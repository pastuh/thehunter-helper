import {checkElementLoaded, checkPageLoaded, clearLocalStorage} from "../utilities/extension/helpers";
import {activateCompetitionSave, deleteSavedCompetition, saveSelectedCompetition} from "./competitionSave";
import {activateCompetitionPause } from "./competitionPause";

export function activateCompetitionHistory() {
	checkElementLoaded('#competitions-list-region .competitions-table-rows', function () {
		if (!$('#competitions-tab-region ul .helper_cmpHistory').length) {
			activateCompetitionPause();
			activateCompetitionSave();



			activateCompetitionButtons();
		}
	});
}

function activateCompetitionButtons() {
	console.log(`Activating join leave buttons..`);
	$('#page-competitions').on('click', '.btn-join', function(element) {
		console.log(`joined competition..`);

		let existingRowsCount;
		let requiredElement = $('#enrolled-competitions-region .competitions-table-rows tr td.comp-image-container');
		let savedElement = $('#enrolled-competitions-region .competitions-table-rows tr .btn-paused')

		if(savedElement.length > 0) {
			existingRowsCount = requiredElement.length + savedElement.length;
		} else {
			existingRowsCount = requiredElement.length;
		}

		let button = $(element.target);
		let competitionId = button.data('cmpid');
		console.log(`Clicked competition: `, competitionId);

		// For TEST
		//clearLocalStorage();

		let intervalChecker = setInterval(() => {
			console.log(`button..`, button.text());
			if (button.text() === 'Deactivate') {
				clearInterval(intervalChecker);
				saveSelectedCompetition(competitionId, existingRowsCount);
			}
		}, 100);

	});

	$('#page-competitions').on('click', '.btn-leave', function(element) {
		console.log(`leaving competition..`);

		let existingRowsCount;
		let requiredElement = $('#enrolled-competitions-region .competitions-table-rows tr td.comp-image-container');
		let savedElement = $('#enrolled-competitions-region .competitions-table-rows tr .btn-paused')

		if(savedElement.length > 0) {
			existingRowsCount = requiredElement.length + savedElement.length;
		} else {
			existingRowsCount = requiredElement.length;
		}

		let button = $(element.target);
		let competitionId = button.data('cmpid');

		let intervalChecker = setInterval(() => {
			if (button.hasClass('btn-join')) {
				clearInterval(intervalChecker);
				deleteSavedCompetition(competitionId, existingRowsCount);
			}
		}, 100);

	});

	$('#page-competitions').on('click', '.helper_cmpHistory', function(element) {
		element.preventDefault();
		console.log(`History tab selected`);
	});
}

export function hideIfExistCompetitionActiveButtons() {
	checkElementLoaded('#competitions-list-region .competitions-table-rows', function () {
		console.log(`hide existing active buttons??`);

		if ($('#competitions-list-region .competitions-table-rows .action .btn-leave').length ||
			$('#enrolled-competitions-region .competitions-table-rows .action .btn-paused').length) {
			console.log(`Hidding listing buttons..`);
			hideCompetitionAlreadyActiveButtons();
		}
	});
}

export function hideCompetitionAlreadyActiveButtons() {
	checkElementLoaded('#competitions-list-region .competitions-table-rows', function () {

		let enrolledComps = $('#enrolled-competitions-region .competitions-table-rows .btn-join');
		let listedComps = $('#competitions-list-region .competitions-table-rows tr');

		let listEnrolledIds = [];
		enrolledComps.each(function() {
			listEnrolledIds.push($(this).data('cmpid'));
		});

		listedComps.each(function (index, element) {
			let button = $(element).find('.action button');
			let listedCompId = button.data('cmpid');

			if(button.hasClass('btn-leave')) {
				button.text(`Enrolled`);
				button.addClass('btn-enrolled');
				button.removeClass('btn-secondary btn-leave');
				// button.removeAttr('data-cmpid');
				return; // Check next iteration
			}

			if(button.hasClass('btn-join')) {
				listEnrolledIds.forEach(id => {
					if(id === listedCompId) {
						console.log(`ID found: ${id} and listedId ${listedCompId}, marking inactive..`);
						button.text(`Paused`);
						button.addClass('btn-saved paused_competition');
						button.removeClass('btn-primary btn-join');
						$(element).find('.first a').addClass('paused_competition');
						// button.removeAttr('data-cmpid');
					}
				});
			}
		});
	});
}

function movePausedButFinishedToSave(id) {
	console.log(`This ID not found in List, but exist in enrolled:`, id);
}