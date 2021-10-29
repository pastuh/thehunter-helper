import moment from 'moment';

import {
	checkElementLoaded,
	checkLocalStorage,
	checkPageLoaded,
	clearLocalStorage
} from "../utilities/extension/helpers";
import {
	activateCompetitionSave,
	deleteSavedCompetition,
	getLocalSavedCompetitions,
	saveSelectedCompetition
} from "./competitionSave";
import {activateCompetitionPause} from "./competitionPause";
import {
	fixPausedCompetitionLeaveBtn,
	getEnrolledCompetitionsCount, getServerCompetitions,
	hideIfExistCompetitionActiveButtons, hideIfExistSavedTable,
	markActivatedAnimals,
	scrollToClickedCompetition, selectedAnimalIndicatorReset,
	tagSelectedAnimal, updateTitleAllListedCompetitions
} from "./competitionPage";

export let serverData;
export async function storeServerCompetitionData() {
	serverData = await getServerCompetitions();
}

// INIT Competition functions Pause/Save
export function activateCompetitionHistory() {
	checkElementLoaded('#competitions-list-region .competitions-table-rows', function () {
		if (!$('#competitions-tab-region ul .helper_cmpHistory').length) {
			console.log(`REAL INITIALIZATION`);
			activateCompetitionPause();
			activateCompetitionSave();
			markActivatedAnimals();
			activateCompetitionPageButtons();
			console.log(`Page loaded with`, serverData);
		}
	});
}

function activateCompetitionPageButtons() {
	let competitionsPage = $('#page-competitions');
	// JOIN/Activate button adds animal to Saved list
	competitionsPage.on('click', '.btn-join', function(element) {
		let existingRowsCount = getEnrolledCompetitionsCount();
		let button = $(element.target);
		let competitionRow = button.closest('tr');
		let competitionId = button.data('cmpid');
		button.text('Loading');

		// Wait for indicator website completed actions
		let intervalChecker = setInterval(() => {
			if (button.text() === 'Deactivate') {
				clearInterval(intervalChecker);
				saveSelectedCompetition(competitionId, competitionRow, existingRowsCount);
				selectedAnimalIndicatorReset();
			}
		}, 100);

	});

	// LEAVE/Deactivate button deletes animal from Saved list
	competitionsPage.on('click', '.btn-leave', function(element) {
		// let existingRowsCount = getEnrolledCompetitionsCount();
		let button = $(element.target);

		if(!button.hasClass('btn-stop')) {
			console.log(`Leaving competition..`);

			let competitionId = button.data('cmpid');

			console.log(`this.. ${competitionId}`);

			if(button.hasClass('btn-paused')) {
				console.log(`current text.. ${button.text()}`);
				button.text('...');
			} else {
				button.text('Loading');
			}

			// Wait for indicator website completed actions
			let intervalChecker = setInterval(() => {
				console.log(`turi class?`, button.hasClass('btn-join'));

				if (button.hasClass('btn-join')) {
					console.log(`Btn changed to join..`);
					clearInterval(intervalChecker);
					// deleteSavedCompetition(competitionId, existingRowsCount);
					deleteSavedCompetition(competitionId, 'leaveCompetition');
					selectedAnimalIndicatorReset();
				}

			}, 100);
		}
	});

	// If user selectes different animal, adjust Markers
	competitionsPage.on('click', '.compSelectSpecies', function(element) {
		hideIfExistCompetitionActiveButtons();
		markActivatedAnimals();
	});

	// If user selects TAB (preview saved competitions)
	competitionsPage.on('click', '.helper_cmpHistory', function(element) {
		element.preventDefault();
		console.log(`History tab selected`);
		// PREPARE TO EMPTY PAGE
		$('#competitions-filter-region').css({'display': 'none'});
		$('#competitions-campaign-description').css({'display': 'none'});
		$('#competitions-pagination-region').css({'display': 'none'});
		$('#competitions-list-region .competitions-table').css({'display': 'none'});

		let activeAnimalBanner = $('.competition-list-banner');
		if(activeAnimalBanner.length) {
			activeAnimalBanner.remove();
		}

		showSavedInHistoryCompetitions();
	});

	// RESET BACK TO DEFAULT TAB VIEW (Except custom 'saved' tab)
	competitionsPage.on('click', '.tab', function(element) {

		fixPausedCompetitionLeaveBtn();
		updateTitleAllListedCompetitions();

		if (!$(element.target).hasClass('helper_cmpHistory')) {
			hideIfExistCompetitionActiveButtons();
			markActivatedAnimals();
			hideIfExistSavedTable();
			$('#competitions-filter-region').css({'display': 'block'});
			$('#competitions-campaign-description').css({'display': 'block'});
			$('#competitions-pagination-region').css({'display': 'block'});
			$('#competitions-list-region .competitions-table').css({'display': 'table'});
		}
	});

	// Fast scroll to selected competition after clicking enrolled or paused buttons
	competitionsPage.on('click', '.btn-enrolled, .paused_competition', function(element) {
		scrollToClickedCompetition(element);
	});

	// Activate specific animal from the tags
	competitionsPage.on('click', '#enrolled-competitions-region .species-tag', function(element) {
		tagSelectedAnimal(element);
	});

	competitionsPage.on('click', '#competitions-list-region .btn-delete_save', function(element) {
		let button = $(element.target);
		button.closest('tr').remove();
		let competitionId = button.data('cmpid');
		deleteSavedCompetition(competitionId, 'removeSave');
	});
}

async function showSavedInHistoryCompetitions() {

	// let activeCompetitions = [];
	let savedCompetitions = await getLocalSavedCompetitions();

	// Test example
	/*if (typeof savedCompetitions !== "undefined") {
		savedCompetitions.push({
			"attemptsLeft": "2",
			"attemptsTotal": "5",
			"description": "Harvest random lol",
			"ends": "Oct 26th 10:00 EEST",
			"icons": "compthumb comp_special",
			"id": 666,
			"paused": true,
			"finished": true,
			"playersCount": "100",
			"position": "N/A",
			"starts": "Oct 22nd 10:00 EEST",
			"tags": [
				"Whitetail Deer (Typical)",
				"Single player"
			],
			"timestampEnd": 1635083850,
			"timestampStart": 1634886000,
			"title": "TEST #1"
		});
		savedCompetitions.push({
			"attemptsLeft": "5",
			"attemptsTotal": "5",
			"description": "Harvest Something.",
			"ends": "Oct 26th 10:00 EEST",
			"icons": "compthumb comp_special",
			"id": 123123,
			"paused": false,
			"finished": true,
			"playersCount": "6",
			"position": "N/A",
			"starts": "Oct 22nd 10:00 EEST",
			"tags": [
				"Whitetail Deer (Typical)",
				"Single player"
			],
			"timestampEnd": 1635083750,
			"timestampStart": 1634886000,
			"title": "TEST #2"
		});
	}*/

	// let serverCompetitions = await getServerCompetitions();
	let serverCompetitions = serverData;
	console.log(`server data:`, serverCompetitions);


	if (typeof savedCompetitions !== "undefined") {
		// Sort by END time
		savedCompetitions.sort( compare );

		// Find still Active competitions, by comparing Saved and Server data
		$.each(serverCompetitions, function (i, serverCompetition) {
			savedCompetitions.forEach( (item, index) => {
				if(item.id === serverCompetition.id) {
					// Add still active competitions
					// activeCompetitions.push(item);
					// Remove from existing list (Leave only not found competitions. Not found = Finished)
					savedCompetitions.splice(index,1);

					// savedCompetitions[index]['tags'] = serverCompetition.entrants;
					// activeCompetitions[activeCompetitions.length-1].icons = item.icons;
				}
			} );
		});


		// console.log(`STILL ACTIVE:`, activeCompetitions);
		console.log(`FINISHED: `, savedCompetitions);

		// GROUP COMPETITIONS WITH SAME EVENT, AND SHOW TIMER
		let tableTemplate = `
	<table class="table save_competitions-table">
		<thead>
			<tr>
				<th colspan="2" class="save_title">Competition Name</th>
				<th class="data_item save_players">Players</th>
				<th class="data_item save_ends">End date</th>
				<th class="data_item save_status">Status</th>
				<th class="data_item save_attempts">Attempts</th>
				<th class="data_item save_action">Action</th>
			</tr>
		</thead>
		<tbody class="save_competitions-table-rows"></tbody>
	</table>`;

		$('#competitions-list-region .comps-list').prepend(tableTemplate);


		savedCompetitions.forEach(function(competition) {
			if(competition.finished) {
				let gamesCount = competition.attemptsTotal - competition.attemptsLeft;
				let gameStatus = 'Skipped';
				let playClass = '';
				if(gamesCount > 0) {
					gameStatus = 'Played';
					playClass = 'played_competition';
				}

				let htmlTags = ``;

				competition.tags.forEach(tag => {
					htmlTags += `<span class="species-tag">${tag}</span>`;
				});

				let rowTemplate = `
				<tr class="save_row">
					<td class="row-icon comp-image-container">
						<div class="${competition.icons}"></div>
					</td>
					<td class="row-title animal_item first">
						<a href="#competitions/details/${competition.id}" class="save_row-title ${playClass}">${competition.title}</a>
						<div class="tags">
							${htmlTags}
						</div>
						<p class="competition-description save_row-description">${competition.description}</p>	
					</td>
					<td class="row-players data_item tacenter save_row-players">${competition.playersCount}</td>
					<td class="row-starts data_item save_row-countdown">${competition.ends}</td>
					<td class="row-starts data_item save_row-status ${playClass}">${gameStatus}</td>
					<td class="row-starts data_item save_row-attempts">${gamesCount}</td>
					<td class="row-action data_item action save_row-action">
	<!--					ADD REMINDER BUTTON? -->
<!--	CREATE NEW TAB WHERE PLAYER WON? -->
<!-- ALLOW TO INCLUDE COMPETITIONS WHERE PLAYER WON? -->
						<button class="btn btn-delete_save" data-cmpid="${competition.id}" type="button" title="Remove save">X</button>
					</td>
				</tr>
			`;

				$('#competitions-list-region .save_competitions-table-rows').prepend(rowTemplate);
			}
		});
	}

}

function compare( a, b ) {
	if ( a.end < b.end ){
		return -1;
	}
	if ( a.end > b.end ){
		return 1;
	}
	return 0;
}

export function markPausedCompetitionAsFinished() {

	let currentTime = Math.floor(Date.now() / 1000);

	return new Promise((resolve) => {

			chrome.storage.local.get('savedCompetitions', function (data) {

				if (typeof data.savedCompetitions !== "undefined") {

					data.savedCompetitions.forEach(savedCompetition => {

						if(!savedCompetition.finished && savedCompetition.paused) {

							if (currentTime > savedCompetition.timestampEnd) {
								// Competition data is now stored
								console.log(`PAUSED ${savedCompetition.id} marked as FINISHED and hidden from website`);
								savedCompetition.finished = true;
								let targetLine = $(`#enrolled-competitions-region tr [data-cmpid="${savedCompetition.id}"]`).first().closest('tr');
								if(targetLine.length) {
									targetLine.remove();
								}
							}
						}

						if(!savedCompetition.finished && !savedCompetition.paused) {
							let targetLine = $(`#enrolled-competitions-region tr [data-cmpid="${savedCompetition.id}"]`).first().closest('tr');

							if(currentTime < savedCompetition.timestampEnd) {

								if(targetLine.length) {
									let attemptsInfo = targetLine.find('.tacenter').text().split("/");
									savedCompetition.attemptsLeft = attemptsInfo[0].trim();
									savedCompetition.attemptsTotal = attemptsInfo[1].trim();
									savedCompetition.position = targetLine.find('td').eq(3).text();
								}
							}
						}

					});

					chrome.storage.local.set(data, () => {
						checkLocalStorage();
					})
				}

				resolve(data.savedCompetitions);
			});

	});


}

export function addTimerForCompetitions(data) {
	const savedCompetitions = data.savedCompetitions;
	const competitionRow = data.enrolledList;

	if (typeof savedCompetitions !== "undefined") {

		savedCompetitions.forEach( (savedCompetition) => {

			if(!savedCompetition.paused) {
				competitionRow.each(function () {

					let row = $(this);
					let target = row.find('button');
					let tdElement = row.find('td');
					let starts = tdElement.eq(4);
					let ends = tdElement.eq(5);

					let competitionId = target.data('cmpid');
					if (savedCompetition.id === competitionId) {
						let currentTime = Math.floor(Date.now() / 1000);
						// console.log(`TIMER ID: ${savedCompetition.id} Start ${savedCompetition.timestampStart} End: ${savedCompetition.timestampEnd} Now: ${Math.floor(Date.now() / 1000)}`);
						// Show countdown based if competition started
						if (currentTime < savedCompetition.timestampStart) {
							calculateTime(savedCompetition.timestampStart, starts);
							ends.text('');
						}
						if (currentTime > savedCompetition.timestampStart) {
							calculateTime(savedCompetition.timestampEnd, ends);
							starts.text('');
						}
					}
				});
			}
		});
	}

	return savedCompetitions;
}

export function calculateTime(timestamp, zone) {
	let eventTime= timestamp;
	let currentTime = Math.floor(Date.now() / 1000);
	let diffTime = eventTime - currentTime;
	let duration = moment.duration(diffTime*1000, 'milliseconds');
	let interval = 1000;

	setInterval(function(){
		duration = moment.duration(duration - interval, 'milliseconds');

		let days = duration.days();
		let hours = duration.hours();
		let minutes = duration.minutes();
		let seconds = duration.seconds();

		let duration_d = days < 1 ? `` : `${days}d`;
		let duration_h = hours < 10 ? `0${hours}h` : `${hours}h`;
		let duration_m = minutes < 10 ? `0${minutes}m` : `${minutes}m`;
		let duration_s = seconds < 10 ? `0${seconds}s` : `${seconds}s`;

		zone.text(`${duration_d} ${duration_h} ${duration_m} ${duration_s}`);
	}, interval);
}