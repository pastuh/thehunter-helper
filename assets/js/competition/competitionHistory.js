import {checkElementLoaded, checkPageLoaded, clearLocalStorage} from "../utilities/extension/helpers";
import {activateCompetitionSave, deleteSavedCompetition, saveSelectedCompetition} from "./competitionSave";
import {activateCompetitionPause } from "./competitionPause";
import {showActiveCompetitionIndicator} from "./competitionPage";

export function activateCompetitionHistory() {
	checkElementLoaded('#competitions-list-region .competitions-table-rows', function () {
		if (!$('#competitions-tab-region ul .helper_cmpHistory').length) {
			activateCompetitionPause();
			activateCompetitionSave();
			showActiveCompetitionIndicator();
			activateCompetitionButtons();
		}
	});
}

function activateCompetitionButtons() {

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
		button.text('Loading');

		// For TEST
		//clearLocalStorage();

		let intervalChecker = setInterval(() => {
			console.log(`button..`, button.text());
			if (button.text() === 'Deactivate') {
				clearInterval(intervalChecker);
				saveSelectedCompetition(competitionId, existingRowsCount);
				fixActiveAnimalIndicator();
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
				fixActiveAnimalIndicator();
			}
		}, 100);

	});

	$('#page-competitions').on('click', '.compSelectSpecies', function(element) {
		hideIfExistCompetitionActiveButtons();
		showActiveCompetitionIndicator();
	});

	$('#page-competitions').on('click', '.helper_cmpHistory', function(element) {
		element.preventDefault();
		console.log(`History tab selected`);
		// SHOW CLEAR PAGE
		$('#competitions-filter-region').css({'display': 'none'});
		$('#competitions-campaign-description').css({'display': 'none'});
		$('#competitions-pagination-region').css({'display': 'none'});
		$('#competitions-list-region .competitions-table-rows tr').css({'display': 'none'});

		// LOAD SAVED DATA
		// LOAD SERVER DATA
		// CHECK IF FINISHED. BASED ON THAT SET SAVE POSITION
		// IF NOT EXIST IN SERVER. MARK DIFFERENT COLOR
		// LIST BY ID
	});

	$('#page-competitions').on('click', '.tab', function(element) {
		if (!$(element.target).hasClass('helper_cmpHistory')) {
			console.log(`ne history tabas`);
			showActiveCompetitionIndicator();
			$('#competitions-filter-region').css({'display': 'block'});
			$('#competitions-campaign-description').css({'display': 'block'});
			$('#competitions-pagination-region').css({'display': 'block'});
			$('#competitions-list-region .competitions-table-rows tr').css({'display': 'table-row'});
		}
	});

	$('#page-competitions').on('click', '.btn-enrolled', function(element) {
		let competitionId = $(element.target).data('cmpid');

		$('html, body').animate({
			scrollTop: $('#page-competitions').offset().top - 100
		}, 150);

		let targetLine = $(`#enrolled-competitions-region tr [data-cmpid="${competitionId}"]`).first().closest('tr');
		let notifyChanges = targetLine
			.css({backgroundColor: '#f9370d'})
			.show()
		setTimeout(function(){
			notifyChanges.css({backgroundColor: ''});
		},750);

	});
}

export function fixActiveAnimalIndicator() {
	checkPageLoaded(function () {
		let selectedAnimal = $('#competitions-filter-region button.compSelectSpecies.active');
		if (selectedAnimal) {
			selectedAnimal.removeClass('active');
			let counterColor = selectedAnimal.find('span');
			counterColor.each(item => {
				if (!$(item).hasClass('animalEnrolled_counter')) {
					$(item).css({'background': '#ccc'});
				}
			})

			$('.competition-list-banner').remove();
		}
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

	showActiveCompetitionIndicator();
}

function movePausedButFinishedToSave(id) {
	console.log(`This ID not found in List, but exist in enrolled:`, id);
}