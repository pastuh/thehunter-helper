import {checkLocalStorage, clearLocalStorage, initAuth} from "../utilities/extension/helpers";
import {hideIfExistCompetitionActiveButtons} from "./competitionHistory";
import {showActiveCompetitionIndicator} from "./competitionPage";

export function activateCompetitionPause() {
	getLocalPausedCompetitions()
		.then((data) => adjustEnrolledCompetitionTitle(data))
		.then((data) => addLoadedPausedCompetitionRows(data))
		.then(() => addPauseToCompetitionRow())
		.then(() => hideIfExistCompetitionActiveButtons())
		.then(() => activatePauseCompetitionButtons());
}

export async function repeatGetLocalPausedCompetitions() {
	console.log(`Repeating get local paused comps..`);
	getLocalPausedCompetitions()
		.then((data) => adjustEnrolledCompetitionTitle(data))
		.then((data) => addLoadedPausedCompetitionRows(data))
		.then(() => showActiveCompetitionIndicator());
}

function adjustEnrolledCompetitionTitle(data) {
	console.log(`Calculating new Title`);

	let enrolledList = $('#enrolled-competitions-region .competitions-table-rows tr td');
	let realEnrolled = enrolledList.find('.comp-image-container');

	let totalComps = 0;
	let allCompetitions = $('#competitions-filter button');
	let allAnimalsCounters = allCompetitions.find('.filter-amount');

	allAnimalsCounters.each(function() {
		totalComps += parseInt($(this).text());
	});

	let totalRows = realEnrolled.length;
	let counter;
	if (typeof data === "undefined") {
		counter = `${totalRows}`;
	} else {
		counter = `<span id="localCompetitions_counter">${data.length + totalRows}</span>`;

		// Adjust information line if exist only PAUSED competitions
		let infoLine = 	$('#enrolled-competitions-region .alert-info');
		if(infoLine.length > 0 && data.length > 0) {
			infoLine.text(`All enrolled competitions is paused`);
		}
	}
	$('#enrolled-competitions-region h4').html(`Enrolled competitions (${counter} / ${totalComps})`);

	// Pass data to another function
	return data;
}

export function getLocalPausedCompetitions() {
	return new Promise((resolve) => {
		chrome.storage.local.get('pausedCompetitions', function (data) {
			console.log(`Loaded all Paused Competitions if exist`, data);
			resolve(data.pausedCompetitions);
		});
	});
}

// Add for each Enrolled competition PAUSE button
export function addPauseToCompetitionRow() {
	console.log(`Adding PAUSE button if not Paused`);

	let elementTarget = $('#enrolled-competitions-region .competitions-table-rows tr');
	elementTarget.each(function () {
		let target = $(this).find('button');
		if(!target.hasClass('btn-pause') && !target.hasClass('btn-join')) {
			let competitionId = target.data('cmpid');
			target.parent().append(`<button class="btn btn-secondary btn-pause" data-cmpid="${competitionId}" type="button">❚❚</button>`)
		}
	});

}

function activatePauseCompetitionButtons() {

	$('#page-competitions').on('click', '.btn-pause', function(element) {
		let competitionId = $(element.target).data('cmpid');
		let competitionRow = $(element.target).closest('tr');

		// Mark paused row
		let btnTemplate = `<button class="btn btn-primary btn-join btn-paused" data-cmpid="${competitionId}" type="button">Activate</button>`;
		// <button className="btn btn-secondary btn-leave btn-paused" data-cmpid="${rowData.id}" type="button">X</button>

		competitionRow.find('.first a').addClass('paused_competition');
		let actionEl = competitionRow.find('.action');
		actionEl.find('button').text('X');
		actionEl.find('button').addClass('btn-paused');
		actionEl.prev('td').addClass('paused_competition').text('Paused');
		actionEl.prepend(btnTemplate);
		// Remove pause button
		$(element.target).remove();

		console.log(`...cloning and prepending..`);
		let cloned = competitionRow.clone(true)
		$('#enrolled-competitions-region .competitions-table-rows').prepend(cloned);
		competitionRow.remove();

		// Move paused row to top
		savePausedCompetition(competitionId, competitionRow);

		let notifyChanges = cloned
			.css({backgroundColor: 'rgb(231 190 61 / 25%)'})
			.show()
		setTimeout(function(){
			notifyChanges.css({backgroundColor: ''});
		},100);

		// CIA PRIDETI FUNKCIJAS: TITLE update, GAUTI ALL PAUSED, FILL TABLE
	});

	$('#page-competitions').on('click', '.btn-paused', function(element) {
		let competitionId = $(element.target).data('cmpid');
		deleteLocalPausedCompetition(competitionId);
	});

}

export function deleteLocalPausedCompetition(competitionId) {
	chrome.storage.local.get('pausedCompetitions', data => {
		console.log(`Paused before check:`, data.pausedCompetitions);

		// If competitionID not equals stored IDs leave them in Array.
		data.pausedCompetitions = $.grep(data.pausedCompetitions || [], function(value) {
			for (let key in value) {
				if(key === 'id') {
					// console.log(`${value[key]} !== ${competitionId} ? = ${value[key] !== competitionId}`);
					return value[key] !== competitionId;
				}
			}
		});

		console.log(`Paused after check:`, data.pausedCompetitions);

		chrome.storage.local.set(data, () => {
			// Competition data is now stored
			console.log(`Deleted Local Paused Competition: ${competitionId}`);
			checkLocalStorage();
			// Find saved competition and style
			// let requiredElement = '#enrolled-competitions-region .competitions-table-rows tr td.comp-image-container';
			// let existingRows = $(requiredElement).length;
			// waitForElementUpdate(existingRows, requiredElement, updateEnrolledCompetitions, false);
		})
	});
}

async function savePausedCompetition(competitionId, competitionRow) {
	console.log(`PAUSED competition:`, competitionId);
	// clearLocalStorage();

	let id = competitionId;

	let tempIcons = competitionRow.find('.comp-image-container div').attr("class").split(/\s+/);
	let icons = tempIcons.join(' ');

	let title = competitionRow.find('.first a').text();

	let tempTags = competitionRow.find('.tags span');
	let tags = tempTags.map(function() {
		return $(this).text();
	}).get();

	let attemptsLeft = competitionRow.find('.tacenter').text().trim().split("/")[0];
	let attemptsTotal = competitionRow.find('.tacenter').text().trim().split("/")[1];

	let tdElement = competitionRow.find('td');
	let position = tdElement.eq(3).text();
	let starts = tdElement.eq(4).text();
	let ends = tdElement.eq(5).text();
	let status = tdElement.eq(6).text();

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

	chrome.storage.local.get('pausedCompetitions', data => {
		data.pausedCompetitions = [].concat(data.pausedCompetitions || [], [selectedCompetition]);
		chrome.storage.local.set(data, () => {
			// Competition data is now stored
			console.log(`Added Paused competition to pausedCompetitions: ${competitionId}`);
			checkLocalStorage();
			deactivateCompetition(id);
		})
	});

	return competitionId;

/*	return new Promise((resolve) => {
		chrome.storage.local.get('pausedCompetitions', data => {
			data.pausedCompetitions = [].concat(data.pausedCompetitions || [], [selectedCompetition]);
			chrome.storage.local.set(data, () => {
				// Competition data is now stored
				console.log(`Added Paused competition to pausedCompetitions: ${competitionId}`);
				resolve(data);
				checkLocalStorage();
			})
		});
	});*/

}

// NAUDOTI VISU PAUSED/SAVED ATKURIMUI
function addLoadedPausedCompetitionRows(data) {

	if (typeof data !== "undefined") {

		//Fix issue with duplicated rows, which marked as active.. (even they are paused)
		let enrolledList = $('#enrolled-competitions-region .competitions-table-rows tr .action .btn-leave');

			data.forEach(rowData => {

				enrolledList.each(function() {
					let id = $(this).data('cmpid');

					if(id === rowData.id) {
						console.log(`Paused and Active bug fix for`, id);
						$(this).closest('tr').remove();
					}
				});

				let htmlTags = ``;

				console.log(`Data which will be loaded as pause`, rowData);

				rowData.tags.forEach(tag => {
					htmlTags += `<span class="species-tag">${tag}</span>`;
				});

				//<button class="btn btn-secondary btn-pause active" data-cmpid="${rowData.id}" type="button">❚❚</button>
				let template =
					`<tr>
						<td class="row-icon comp-image-container">
							<div class="${rowData.icons}"></div>
						</td>
						<td class="row-title animal_item first paused_competition">
							<a href="#competitions/details/${rowData.id}">${rowData.title}</a>
							<div class="tags">
								${htmlTags}
							</div>
						</td>
						<td class="row-players data_item tacenter">${rowData.attemptsLeft} / ${rowData.attemptsTotal}</td>
						<td class="row-starts data_item">${rowData.position}</td>
						<td class="row-starts data_item">${rowData.starts}</td>
						<td class="row-starts data_item">${rowData.ends}</td>
						<td class="row-status data_item paused_competition">Paused</td>
						<td class="row-action data_item action">
							<button class="btn btn-primary btn-join btn-paused" data-cmpid="${rowData.id}" type="button">Activate</button>
							<button class="btn btn-secondary btn-leave btn-paused" data-cmpid="${rowData.id}" type="button">X</button>
						</td>
					</tr>`;

				$('#enrolled-competitions-region .competitions-table-rows').prepend(template);
			});
	}
}

async function deactivateCompetition(id) {

	let competitionId = id;
	let playerAuth = initAuth();

	let requestOptions = {
		method: 'POST'
	};

	console.log(`Deactivated competition`, competitionId);

	fetch(`https://api.thehunter.com/v1/Competition/leave?id=${competitionId}&oauth_access_token=${playerAuth}`, requestOptions)
		.then(response => response.text())
		.catch(error => console.log('error', error));

}