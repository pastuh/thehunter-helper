import Tabulator from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import {
    addStatsWeaponsSrc,
    animalStatsImageFormatter2,
    countRowAverage,
    countRows,
    countRowValue,
    headerStatsMenu,
    hideZeroCount,
    scoreStatsFormatter,
    setStatisticsWeaponImage,
    weaponStatsDiagramFormatter,
    zeroCountColor,
} from './helpers';

export function styleConfirmedKillsTable() {
    let originalConfirmedKillsTable = $('.confirmed-kills div').first();
    if (originalConfirmedKillsTable.length) {
        let tabledata = [];

        let confirmedKillsTable = originalConfirmedKillsTable.after(
            '<div id="confirmed-stats-table" class="hunterHelperTable"></div>'
        );

        addStatsWeaponsSrc();

        let originalConfirmedKillsData =
            originalConfirmedKillsTable.find('.animal');

        originalConfirmedKillsData.each(function (index, element) {
            let animalSrc = $(element).find('.harvest_image img').attr('src');

            let animalTitleInfo = $(element).find('th .species').text().trim();
            let animalTitle;
            let animalGender = animalTitleInfo.match(/\(\w+\)/);
            if (animalGender !== null) {
                animalTitle = animalTitleInfo.replace(/\s\(\w\)$/g, '').trim();
                animalGender = animalGender[0].replace(/\(|\)/g, '').trim();
            } else {
                animalTitle = animalTitleInfo;
                animalGender = '-';
            }

            let animalScoreInfo = $(element).find('th .score').text().trim();
            let animalScore = animalScoreInfo.match(/\d+.\d+|\d+/);
            if (animalScore !== null) {
                animalScore = animalScore[0].trim();
            } else {
                animalScore = '0';
            }

            let animalScoreSystem = animalScoreInfo.match(/\s(\w)$/);
            if (animalScoreSystem !== null) {
                animalScoreSystem = animalScoreSystem[0].trim();
            } else {
                animalScoreSystem = '';
            }

            let animalLink = $(element).find('th .score a').attr('href');
            let animalDiagram = $(element).find('.organ_diagram');

            let animalValue = $(element)
                .find('.row_data_1')
                .eq(1)
                .text()
                .split(': ')[1]
                .trim();

            let animalWeight = $(element)
                .find('.row_data_2')
                .eq(0)
                .text()
                .split(': ')[1]
                .trim();
            let weightKg = animalWeight.match(/(\d+\.\d+)\s?kg/);
            let weightLb;
            if (weightKg !== null) {
                weightKg = parseFloat(weightKg[0]).toFixed(2);
                weightLb = parseFloat(
                    animalWeight.match(/(\d+\.\d+)\s?lbs/)[1]
                ).toFixed(2);
            } else {
                weightKg = '0';
                weightLb = '0';
            }

            let harvestTime = $(element)
                .find('.row_data_1')
                .eq(2)
                .text()
                .split(': ')[1]
                .trim();

            let shotsHit = $(element)
                .find('.row_data_2')
                .eq(1)
                .text()
                .split(': ')[1]
                .trim();

            let shotDistance = $(element)
                .find('.row_data_1')
                .eq(3)
                .text()
                .split(': ')[1]
                .trim();
            let distanceMeters = shotDistance.match(/(\d+\.\d+)\s?m/);
            let distanceFeets;
            if (distanceMeters !== null) {
                distanceMeters = parseFloat(distanceMeters[0]).toFixed(2);
                distanceFeets = parseFloat(
                    shotDistance.match(/(\d+\.\d+)\s?ft/)[1]
                ).toFixed(2);
            } else {
                distanceMeters = '0';
                distanceFeets = '0';
            }

            let weaponTitle;
            let weaponSrc = [];

            // Check if used more than 1 weapon
            let weaponTitleChecker = $(element)
                .find('.row_data_2')
                .eq(2)
                .html()
                .split(': ')[1]
                .split('<br>');
            if (weaponTitleChecker.length >= 3) {
                weaponTitleChecker.forEach(function (value) {
                    let checkTitle = value.replace('</td>', '').trim();
                    if (checkTitle) {
                        weaponSrc.push({
                            source: setStatisticsWeaponImage(checkTitle),
                            title: checkTitle,
                        });
                    }
                });
            } else {
                weaponTitle = $(element)
                    .find('.row_data_2')
                    .eq(2)
                    .text()
                    .split(': ')[1]
                    .trim();
                weaponSrc.push({
                    source: setStatisticsWeaponImage(weaponTitle),
                    title: weaponTitle,
                });
            }

            tabledata.push({
                id: index,
                animal_gender: animalGender,
                animal_title: animalTitle,
                animal_info: animalTitle,
                image: animalSrc,
                animal_score: animalScore,
                animal_scoreSys: animalScoreSystem,
                animal_link: animalLink,
                animal_diagram: animalDiagram,
                animal_value: animalValue,
                animal_weightKg: weightKg,
                animal_weightLb: weightLb,
                shots_hit: shotsHit,
                weapon_used: weaponTitle,
                weapon_src: weaponSrc,
                distance_meters: distanceMeters,
                distance_feets: distanceFeets,
                harvest_time: harvestTime,
            });
        });

        originalConfirmedKillsTable.slideUp('normal', function () {
            $(this).remove();
        });

        let table = new Tabulator('#confirmed-stats-table', {
            height: '100%',
            data: tabledata,
            layout: 'fitColumns',
            groupToggleElement: 'header',
            groupBy: function (data) {
                return data.animal_title;
            },
            groupHeader: function (value, count, data, group) {
                return `<span class="confirmedAnimalTitle">${value}</span><span style='color:#888; float: right;'>( ${count} )</span>`;
            },
            responsiveLayout: 'collapse',
            headerSortTristate: true,
            addRowPos: 'top',
            pagination: false,
            movableColumns: true,
            resizableRows: false,
            resizableColumns: false,
            selectable: false,
            tooltipsHeader: true,
            tooltips: false,
            placeholder: 'No Data Found',
            initialSort: [{ column: 'animal_score', dir: 'desc' }],
            columns: [
                {
                    title: 'Species',
                    field: 'image',
                    maxWidth: 60,
                    sorter: 'string',
                    hozAlign: 'center',
                    headerTooltip: true,
                    headerMenu: headerStatsMenu,
                    formatter: animalStatsImageFormatter2,
                    bottomCalc: countRows,
                    bottomCalcFormatter: hideZeroCount,
                    cssClass: 'hunterHelperTableImage',
                },
                {
                    title: 'Gender',
                    field: 'animal_gender',
                    width: 55,
                    sorter: 'string',
                },
                {
                    title: 'Score',
                    field: 'animal_score',
                    width: 70,
                    sorter: 'number',
                    bottomCalc: countRowAverage,
                    bottomCalcFormatter: hideZeroCount,
                    formatter: scoreStatsFormatter,
                    headerSortStartingDir: 'desc',
                },
                {
                    title: 'Scoring system',
                    field: 'animal_scoreSys',
                    sorter: 'string',
                    headerSortStartingDir: 'desc',
                    visible: false,
                },
                {
                    title: 'Value',
                    field: 'animal_value',
                    width: 70,
                    sorter: 'number',
                    headerTooltip: 'Harvest value',
                    bottomCalc: countRowAverage,
                    bottomCalcFormatter: hideZeroCount,
                    formatter: zeroCountColor,
                    headerSortStartingDir: 'desc',
                },
                {
                    title: 'Weight (kg)',
                    field: 'animal_weightKg',
                    width: 70,
                    sorter: 'number',
                    headerTooltip: 'Animal weight (kg)',
                    bottomCalc: countRowAverage,
                    bottomCalcFormatter: hideZeroCount,
                    formatter: zeroCountColor,
                    headerSortStartingDir: 'desc',
                },
                {
                    title: 'Weight (lbs)',
                    field: 'animal_weightLb',
                    width: 70,
                    sorter: 'number',
                    headerTooltip: 'Animal weight (lbs)',
                    bottomCalc: countRowAverage,
                    bottomCalcFormatter: hideZeroCount,
                    formatter: zeroCountColor,
                    headerSortStartingDir: 'desc',
                    visible: false,
                },
                {
                    title: 'Shots hit',
                    field: 'shots_hit',
                    width: 70,
                    sorter: 'number',
                    bottomCalc: countRowValue,
                    bottomCalcFormatter: hideZeroCount,
                    headerSortStartingDir: 'desc',
                },
                {
                    title: 'Weapon',
                    field: 'weapon_used',
                    minWidth: 154,
                    variableHeight: true,
                    sorter: 'string',
                    headerTooltip: 'Weapon used',
                    headerMenu: headerStatsMenu,
                    formatter: weaponStatsDiagramFormatter,
                    headerFilter: true,
                    headerFilterPlaceholder: 'Filter..',
                    cssClass: 'hunterHelperDiagram',
                },
                {
                    title: 'Shot distance (m)',
                    field: 'distance_meters',
                    sorter: 'number',
                    bottomCalc: countRowAverage,
                    bottomCalcFormatter: hideZeroCount,
                    formatter: zeroCountColor,
                    headerSortStartingDir: 'desc',
                },
                {
                    title: 'Shot distance (ft)',
                    field: 'distance_feets',
                    sorter: 'number',
                    bottomCalc: countRowAverage,
                    bottomCalcFormatter: hideZeroCount,
                    formatter: zeroCountColor,
                    visible: false,
                    headerSortStartingDir: 'desc',
                },
                {
                    title: 'Time of Harvest',
                    field: 'harvest_time',
                    sorter: 'string',
                    tooltip: true,
                    headerSortStartingDir: 'desc',
                    visible: false,
                },
            ],
        });
    }
}
