import {checkElementLoaded, checkLocalStorage, checkPageLoaded} from "../utilities/extension/helpers";
import {addPauseToCompetitionRow, repeatGetLocalPausedCompetitions} from "./competitionPause";
import {hideIfExistCompetitionActiveButtons} from "./competitionPage";
import {serverData} from "./competitionHistory";

export function activateCompetitionSave() {
	let historyMenu = `<li><a href="#" class="tab helper_cmpHistory">Saved competitions</a></li>`;
	$('#competitions-tab-region ul').append(historyMenu);
}

export function deleteSavedCompetition(competitionId) {
	console.log(`Called delete saved competition..`);
	chrome.storage.local.get('savedCompetitions', data => {

		// If competitionID not equals stored IDs leave them in Array.
		data.savedCompetitions = $.grep(data.savedCompetitions || [], function(value) {
			for (let key in value) {
				if(key === 'id') {
					// console.log(`${value[key]} !== ${competitionId} ? = ${value[key] !== competitionId}`);
					return value[key] !== competitionId;
				}
			}
		});

		// console.log(`LOCAL Saved after delete`, data.savedCompetitions);

		chrome.storage.local.set(data, () => {
			// Competition data is now stored
			console.log(`Deleted Local Saved Competition: ${competitionId}`);
			checkLocalStorage();

			checkElementLoaded('#competitions-list-region .competitions-table-rows', function () {
				updateEnrolledCompetitions();
			});
		})
	});
}

export async function saveSelectedCompetition(competitionId, competitionRow, existingRowsCount) {
	console.log(`Saving competition:`, competitionId);

	let id = competitionId;
	let paused = false;
	let finished = false;

	let timestampStart = '';
	let timestampEnd = '';
	$.each(serverData, function (i, serverCompetition) {
		if(id === serverCompetition.id) {
			timestampStart = serverCompetition.start;
			timestampEnd = serverCompetition.end;
		}
	});

	let tempIcons = competitionRow.find('.comp-image-container div').attr("class").split(/\s+/);
	let icons = tempIcons.join(' ');
	let title = competitionRow.find('.first a').text();

	let tempTags = competitionRow.find('.tags span');
	let tags = tempTags.map(function() {
		return $(this).text();
	}).get();

	let description = competitionRow.find('.competition-description').text().trim();
	let playersCount = competitionRow.find('.row-players').text().trim();

	let tdElement = competitionRow.find('td');
	let starts = tdElement.eq(3).text();
	let ends = tdElement.eq(4).text();

	let selectedCompetition = {
		id,
		paused,
		finished,
		icons,
		title,
		tags,
		description,
		playersCount,
		starts,
		ends,
		timestampStart,
		timestampEnd
	}

	let requiredElement = $('#enrolled-competitions-region .competitions-table-rows tr td.comp-image-container');

	chrome.storage.local.get('savedCompetitions', data => {

		let existData = false;
		// If data already exist, change to NOT paused
		if (typeof data.savedCompetitions !== "undefined") {
			data.savedCompetitions.forEach(competition => {
				if(competition.id === id) {
					competition.paused = false;
					existData = true;
					console.log(`Saved data already exist.. changing pause`, competition);
					return false;
				}
			});
		}

		if(!existData) {
			data.savedCompetitions = [].concat(data.savedCompetitions || [], [selectedCompetition]);
		}

		chrome.storage.local.set(data, () => {
			// Competition data is now stored
			checkLocalStorage();

			checkElementLoaded('#competitions-list-region .competitions-table-rows', function () {
				if(requiredElement.length <= existingRowsCount) {
					updateEnrolledCompetitions();
				} else {
					waitForElementUpdate(existingRowsCount, requiredElement, updateEnrolledCompetitions);
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

export function getLocalSavedCompetitions() {
	return new Promise((resolve) => {
		chrome.storage.local.get('savedCompetitions', function (data) {
			resolve(data.savedCompetitions);
		});
	});
}

export function waitForElementUpdate(existingLength, requiredElement, callback) {

	let intervalChecker = setInterval(() => {
		let totalLength = $(requiredElement).length;

		console.log(`Interval checking for updated table.. Existing: ${existingLength} Appeared: ${totalLength}`);

		// If length changed, means.. updated
		if (existingLength < totalLength) {
			clearInterval(intervalChecker);
			callback();
		}
/*		else {
			if (existingLength > totalLength) {
				clearInterval(intervalChecker);
				callback();
			}
		}*/

	}, 100);
}
