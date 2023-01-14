import {addOptionsCheckbox, checkElementLoaded} from "../../utilities/extension/helpers";

export function addUnitConvertionOptionCheckbox() {
	console.log(`Adding options block..`);
	let description = `<p>Kg change to Lbs, Meters to Feet.<br> (Changes appear after page refresh)</p>`;

	addOptionsCheckbox('unitOptionSwitch', 'option-units', 'Unit Conversion', description, false);

	$('#unitOptionSwitch').off('change').on('change', function (e) {
		changeUnitConvertionOptions(e);
	});

	$('#optionsBlock .slider').off('click').on('click', function(e){
		console.log('clicking');

		e.preventDefault();
		$(this).parent().toggleClass('down');
	});
}

export function changeUnitConvertionOptions(e) {
	const checkbox = $(e.target);

	if (checkbox.is(':checked')) {
		console.log(`enabling options..`);
		chrome.storage.local.set(
			{
				hunterStatsInternational: true,
			},
			function () {
				checkbox.prop('checked', true);
			}
		);

	} else {
		console.log(`disabling options..`);

		chrome.storage.local.set(
			{
				hunterStatsInternational: false,
			},
			function () {
				checkbox.prop('checked', false);
			}
		);

	}
}

export function checkUnitConvertionOptions() {
	checkElementLoaded('#unitOptionSwitch', function () {
		getUnitOptions()
			.then((result) => {
				console.log(`Unit option Lbs?`, result);
				$('#unitOptionSwitch').prop('checked', result);
			})
	});
}

function getUnitOptions() {
	return new Promise((resolve) => {
		chrome.storage.local.get('hunterStatsInternational', function (data) {
			resolve(data.hunterStatsInternational);
		});
	});
}

export async function getSlowUnitOptions() {
	return new Promise((resolve) => {
		chrome.storage.local.get('hunterStatsInternational', function (data) {
			resolve(data.hunterStatsInternational);
		});
	});
}