import {checkElementLoaded, checkLocalStorage, checkPageLoaded} from "../utilities/extension/helpers";
import {addPauseToCompetitionRow, repeatGetLocalPausedCompetitions} from "./competitionPause";
import {hideIfExistCompetitionActiveButtons} from "./competitionHistory";

export function activateCompetitionSave() {
	let historyMenu = `<li><a href="#" class="tab helper_cmpHistory">Saved competitions</a></li>`;
	$('#competitions-tab-region ul').append(historyMenu);
}


export function deleteSavedCompetition(competitionId, existingRowsCount) {
	let requiredElement = $('#enrolled-competitions-region .competitions-table-rows tr td.comp-image-container');

	chrome.storage.local.get('savedCompetitions', data => {
		data.savedCompetitions = $.grep(data.savedCompetitions || [], function(value) {
			return value !== competitionId;
		});

		chrome.storage.local.set(data, () => {
			// Competition data is now stored
			console.log(`Deleted Saved Competition: ${competitionId}`);
			checkLocalStorage();

			checkElementLoaded('#competitions-list-region .competitions-table-rows', function () {
				updateEnrolledCompetitions();
			});

			// waitForElementUpdate(existingRowsCount, requiredElement, updateEnrolledCompetitions, false);
		})
	});
}

export function saveSelectedCompetition(competitionId, existingRowsCount) {

	let requiredElement = $('#enrolled-competitions-region .competitions-table-rows tr td.comp-image-container');
	// Get previous competitions (if exist) and add new
	chrome.storage.local.get('savedCompetitions', data => {

		let tempArray = [].concat(data.savedCompetitions || [], [competitionId]);
		// Transform to unique array
		data.savedCompetitions = [...new Set(tempArray)];

		chrome.storage.local.set(data, () => {
			// Competition data is now stored
			console.log(`Saved selected Activated competition: ${competitionId}`);
			checkLocalStorage();

			checkElementLoaded('#competitions-list-region .competitions-table-rows', function () {
				// console.log(`LAST rows count: ${existingRowsCount} Current after adding new: ${requiredElement.length}`);
				if(requiredElement.length <= existingRowsCount) {
					console.log(`random check if enrolled can be updated`);
					updateEnrolledCompetitions();
				} else {
					console.log(`Else check if enrolled can be updated`);
					waitForElementUpdate(existingRowsCount, requiredElement, updateEnrolledCompetitions, true);
				}
			});
		})
	});
}

export function updateEnrolledCompetitions() {
	repeatGetLocalPausedCompetitions()
		.then(() => addPauseToCompetitionRow())
		.then(() => hideIfExistCompetitionActiveButtons());

}

function getSavedCompetitions() {
	return new Promise((resolve) => {
		chrome.storage.local.get('savedCompetitions', function (data) {
			console.log(`ALL SAVED competitions: `, data);
			resolve(data.savedCompetitions);
		});
	});
}

function savePausedCompetition(competitionId, competitionRow) {

	// PASKUI PANAIKINTI
	chrome.storage.local.clear();

	console.log(`PAUSE:`, competitionId);
	let id = competitionId;

	let tempIcons = competitionRow.find('.compthumb').attr("class").split(/\s+/);
	let icons = tempIcons.map(function() {
		return $(this).text();
	}).get();

	let title = competitionRow.find('.first a').text();

	let tempTags = competitionRow.find('.tags span');
	let tags = tempTags.map(function() {
		return $(this).text();
	}).get();

	let attemptsLeft = competitionRow.find('.tacenter').text().trim().split("/")[0];
	let attemptsTotal = competitionRow.find('.tacenter').text().trim().split("/")[1];
	let position = competitionRow.find('td').eq(3).text();
	let starts = competitionRow.find('td').eq(4).text();
	let ends = competitionRow.find('td').eq(5).text();
	let status = competitionRow.find('td').eq(6).text();

	console.log(icons);
	console.log(title);
	console.log(tags);
	console.log(attemptsLeft);
	console.log(attemptsTotal);
	console.log(position);
	console.log(starts);
	console.log(ends);
	console.log(status);

	let selectedCompetition = {
		id,
		icons,
		title,
		tags,
		attemptsLeft,
		attemptsTotal,
		position,
		starts,
		ends,
		status
	}

	return new Promise((resolve) => {
		chrome.storage.local.get('pausedCompetitions', data => {
			data.pausedCompetitions = [].concat(data.pausedCompetitions || [], [selectedCompetition]);
			chrome.storage.local.set(data, () => {
				// Competition data is now stored
				console.log(`Paused and saved: ${competitionId}`);
				resolve(data);
				checkLocalStorage();
			})
		});
	});

}

function checkCompetitionStatus(auth_id) {
	countPlayerCompetitions()
		.then(() => getCurrentCompetitions(auth_id))
		.then((data) => console.log(data))
}

async function getCurrentCompetitions(auth_id) {
	let response = await fetch(
		`https://api.thehunter.com/v1/Page_content/competition_states?oauth_access_token=${auth_id}`
	);
	return await response.json();
}

export function waitForElementUpdate(existingLength, requiredElement, callback, status) {

	let intervalChecker = setInterval(() => {
		let totalLength = $(requiredElement).length;

		console.log(`Interval checking for updated table.. Existing: ${existingLength} Appeared: ${totalLength}`);

		// If length changed, means.. updated
		if(status) {
			if (existingLength < totalLength) {
				clearInterval(intervalChecker);
				callback();
			}
		} else {
			if (existingLength > totalLength) {
				clearInterval(intervalChecker);
				callback();
			}
		}

	}, 100);
}
