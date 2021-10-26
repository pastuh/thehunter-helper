import {
	checkElementLoaded,
	checkLocalStorage,
	checkPageLoaded,
	clearLocalStorage,
	initAuth
} from "../utilities/extension/helpers";
import {
	fixPausedCompetitionLeaveBtn,
	hideIfExistCompetitionActiveButtons,
	updateTitleAllListedCompetitions
} from "./competitionPage";
import {markActivatedAnimals} from "./competitionPage";
import {getLocalSavedCompetitions} from "./competitionSave";
import {addTimerForCompetitions} from "./competitionHistory";

export function activateCompetitionPause() {
	console.log(`Activating competitions pause..`);
	getLocalSavedCompetitions()
		.then((data) => adjustEnrolledCompetitionTitle(data))
		.then((data) => addTimerForCompetitions(data))
		.then((data) => addLoadedPausedCompetitionRows(data))
		.then(() => addPauseToCompetitionRow())
		.then(() => hideIfExistCompetitionActiveButtons())
		.then(() => activatePauseCompetitionButtons())
		.then(() => fixPausedCompetitionLeaveBtn());
}

export async function repeatGetLocalPausedCompetitions() {
	console.log(`Repeating get local paused comps..`);
	getLocalSavedCompetitions()
		.then((data) => adjustEnrolledCompetitionTitle(data))
		.then((data) => addTimerForCompetitions(data))
		.then((data) => addLoadedPausedCompetitionRows(data))
		.then(() => markActivatedAnimals());
}

function adjustEnrolledCompetitionTitle(savedCompetitions) {

		//clearLocalStorage();

		console.log(`Calculating new Title`, savedCompetitions);

		let enrolledList = $('#enrolled-competitions-region .competitions-table-rows tr');
		let realEnrolled = enrolledList.find('button.btn-secondary.btn-leave');

		let totalRows = realEnrolled.length;
		let counter;
		let existPaused = false;

		if (typeof savedCompetitions === "undefined") {
			console.log(`-no SAVED competitions`);
			counter = `${totalRows}`;
		} else {

			counter = totalRows;
			savedCompetitions.forEach( (item, index) => {
				if(item.paused) {
					counter += 1;
					existPaused = true;
				}
			});

			counter = `<span id="localCompetitions_counter">${counter}</span>`;

			// Adjust information line if exist only PAUSED competitions
			let infoLine = 	$('#enrolled-competitions-region .alert-info');
			if(infoLine.length > 0 && existPaused) {
				infoLine.text(`All enrolled competitions is paused`);
			}
		}

		$('#enrolled-competitions-region h4').html(`Enrolled competitions (${counter}<span id="globalCompetitions_counter"></span>)`);

		updateTitleAllListedCompetitions();

	// Pass savedCompetitions to another function
		return {
			savedCompetitions,
			enrolledList
		};
}

// Add for each Enrolled competition PAUSE button
export function addPauseToCompetitionRow() {
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
	let competitionsPage = $('#page-competitions');
	competitionsPage.on('click', '.btn-pause', function(element) {
		let competitionId = $(element.target).data('cmpid');
		let competitionRow = $(element.target).closest('tr');

		// Mark paused row
		let btnTemplate = `<button class="btn btn-primary btn-join btn-paused" data-cmpid="${competitionId}" type="button">Activate</button>`;
		// <button className="btn btn-secondary btn-leave btn-paused" data-cmpid="${rowData.id}" type="button">X</button>

		competitionRow.find('.first a').addClass('paused_competition');
		let actionEl = competitionRow.find('.action');
		actionEl.find('button').text('X');
		actionEl.find('button').addClass('btn-secondary btn-paused');
		actionEl.prev('td').addClass('paused_competition').text('Paused');
		actionEl.prepend(btnTemplate);
		// Remove pause button
		$(element.target).remove();

		let cloned = competitionRow.clone(true)
		$('#enrolled-competitions-region .competitions-table-rows').prepend(cloned);
		competitionRow.remove();

		// Move paused row to top
		savePausedCompetition(competitionId, cloned);

		let notifyChanges = cloned
			.css({backgroundColor: 'rgb(231 190 61 / 25%)'})
			.show()
		setTimeout(function(){
			notifyChanges.css({backgroundColor: ''});
		},100);

	});

	// For visual loading indicator
	competitionsPage.on('click', '.btn-paused', function(element) {
		let button = $(element.target);

		if(!button.hasClass('btn-stop')) {
			button.prev('button').text('Loading');
		}

	});

}

async function savePausedCompetition(competitionId, competitionRow) {
	let id = competitionId;

	chrome.storage.local.get('savedCompetitions', data => {
		// If competition Paused, add more data to Saved
		data.savedCompetitions.forEach(competition => {
			if(competition.id === id) {

				// Remove timer and show date
				let tdElement = competitionRow.find('td');
				let starts = tdElement.eq(4);
				let ends = tdElement.eq(5);
				starts.text(competition.starts);
				ends.text(competition.ends);

				// Adjust/Add more data to existing paused competition
				competition.paused = true;
				competition.finished = false;
				competition.attemptsLeft = competitionRow.find('.tacenter').text().trim().split("/")[0].trim();
				competition.attemptsTotal = competitionRow.find('.tacenter').text().trim().split("/")[1].trim();
				competition.position = competitionRow.find('td').eq(3).text();
			}
		});

		// data.savedCompetitions.paused = true;
		chrome.storage.local.set(data, () => {
			// Competition data is now stored
			console.log(`Updated SAVE as PAUSED: ${competitionId}`);
			checkLocalStorage();
			deactivateCompetition(id);
		})

		return id;
	});

}

// NAUDOTI VISU PAUSED/SAVED ATKURIMUI
function addLoadedPausedCompetitionRows(savedCompetitions) {

	if (typeof savedCompetitions !== "undefined") {
		//Fix issue with duplicated rows, which marked as active.. (even they are paused)
		let enrolledList = $('#enrolled-competitions-region .competitions-table-rows tr .action .btn-leave');

			savedCompetitions.forEach(rowData => {
				// Only Paused will be adjusted/fixed
				if(rowData.paused) {
					console.log(`Now adding paused row`, rowData);

					enrolledList.each(function() {
						let id = $(this).data('cmpid');
						if(id === rowData.id) {
							console.log(`Paused and Active bug fix for`, id);
							$(this).closest('tr').remove();
							let counterTitle = $('#enrolled-competitions-region h4 span');
							let currentCounter = counterTitle.text();
							counterTitle.text(currentCounter - 1);
						}
					});

					let htmlTags = ``;

					// console.log(`Data which will be loaded as pause`, rowData);

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
				}
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