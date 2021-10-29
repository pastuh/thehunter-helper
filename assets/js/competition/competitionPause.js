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
import {addTimerForCompetitions, markPausedCompetitionAsFinished} from "./competitionHistory";

export function activateCompetitionPause() {
	markPausedCompetitionAsFinished()
		.then((data) => addLoadedPausedCompetitionRows(data))
		.then((data) => adjustEnrolledCompetitionTitle(data))
		.then((data) => addTimerForCompetitions(data))
		.then(() => addPauseToCompetitionRow())
		.then(() => hideIfExistCompetitionActiveButtons())
		.then(() => activatePauseCompetitionButtons())
		.then(() => fixPausedCompetitionLeaveBtn());
}

export async function repeatGetLocalPausedCompetitions() {
	console.log(`Repeating get local paused comps..`);
	markPausedCompetitionAsFinished()
		.then((data) => addLoadedPausedCompetitionRows(data))
		.then((data) => adjustEnrolledCompetitionTitle(data))
		.then((data) => addTimerForCompetitions(data))
		.then(() => markActivatedAnimals());
}

function adjustEnrolledCompetitionTitle(savedCompetitions) {

		// clearLocalStorage();

		let enrolledList = $('#enrolled-competitions-region .competitions-table-rows tr');
		let realEnrolled = enrolledList.find('button.btn-secondary.btn-leave');

		let totalRows = realEnrolled.length;
		let counter;
		let existPaused = false;

		if (typeof savedCompetitions === "undefined") {
			console.log(`-no SAVED competitions`);
			counter = `${totalRows}`;
		} else {
			console.log(`Current saved competitions`, savedCompetitions);

			counter = totalRows;
			savedCompetitions.forEach( (item, index) => {
				if(item.paused && !item.finished) {
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

		console.log(`Adding nice color..`);
		let row = target.closest('tr');
		if(row.length) {
			let attemptsInfo = row.find('.tacenter').text().split("/");
			let attemptsLeft = parseInt(attemptsInfo[0].trim());
			let attemptsTotal = parseInt(attemptsInfo[1].trim());

			console.log(`${attemptsLeft} and ${attemptsTotal}`);
			if(attemptsLeft < attemptsTotal) {
				row.find('.row-title').addClass('played_competition');
				row.find('.action').prev('td').addClass('played_competition').text('Played');
			}
		}


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

			savedCompetitions.forEach(savedCompetition => {
				// Only Paused and not Finished will be adjusted/fixed
				if(savedCompetition.paused && !savedCompetition.finished) {
					console.log(`Now adding paused and not finished row`, savedCompetition);

					enrolledList.each(function() {
						let id = $(this).data('cmpid');
						if(id === savedCompetition.id) {
							console.log(`Paused and Active bug fix for`, id);
							$(this).closest('tr').remove();
							let counterTitle = $('#enrolled-competitions-region h4 span');
							let currentCounter = counterTitle.text();
							counterTitle.text(currentCounter - 1);
						}
					});

					let htmlTags = ``;

					// console.log(`Data which will be loaded as pause`, savedCompetition);

					savedCompetition.tags.forEach(tag => {
						htmlTags += `<span class="species-tag">${tag}</span>`;
					});

					//<button class="btn btn-secondary btn-pause active" data-cmpid="${savedCompetition.id}" type="button">❚❚</button>
					let template =
						`<tr>
						<td class="row-icon comp-image-container">
							<div class="${savedCompetition.icons}"></div>
						</td>
						<td class="row-title animal_item first paused_competition">
							<a href="#competitions/details/${savedCompetition.id}">${savedCompetition.title}</a>
							<div class="tags">
								${htmlTags}
							</div>
						</td>
						<td class="row-players data_item tacenter">${savedCompetition.attemptsLeft} / ${savedCompetition.attemptsTotal}</td>
						<td class="row-starts data_item">${savedCompetition.position}</td>
						<td class="row-starts data_item">${savedCompetition.starts}</td>
						<td class="row-starts data_item">${savedCompetition.ends}</td>
						<td class="row-status data_item paused_competition">Paused</td>
						<td class="row-action data_item action">
							<button class="btn btn-primary btn-join btn-paused" data-cmpid="${savedCompetition.id}" type="button">Activate</button>
							<button class="btn btn-secondary btn-leave btn-paused" data-cmpid="${savedCompetition.id}" type="button">X</button>
						</td>
					</tr>`;

					checkPageLoaded(function() {
						$('#enrolled-competitions-region .competitions-table-rows').prepend(template);
					})

				}
			});
	}

	// Pass savedData
	return savedCompetitions;
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