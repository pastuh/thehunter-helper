import Tabulator from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';

import {
    ammoStatsFormatter,
    countRowAverage,
    countRows,
    countRowValue,
    headerWeaponsMenu,
    hideZeroCount,
    weaponStatsFormatter,
    zeroCountColor,
} from './helpers';

export function styleWeaponsTable() {
    let originalWeaponsTable = $('.weapon_stats.table');
    if (originalWeaponsTable.length) {
        let tabledata = [];

        let weaponsList = originalWeaponsTable.after(
            '<div id="weapons-stats-table" class="hunterHelperTable"></div>'
        );

        let originalWeaponsData = originalWeaponsTable.find('tr.weapon_row');

        originalWeaponsData.each(function (index, element) {
            let weaponInfo = $(element).find('.weapon_item img');
            let weaponSrc = weaponInfo.attr('src');
            let weaponTitle = weaponInfo.attr('title');

            let ammoInfo = $(element).find('.ammo_item img');
            let ammoSrc = ammoInfo.attr('src');
            let ammoTitle = ammoInfo.attr('title');

            let shotsInfo = $(element).find('.data_item').eq(0).text().trim();

            let accuracyInfo = $(element)
                .find('.data_item')
                .eq(1)
                .text()
                .trim()
                .match(/\d+\.\d+/);
            if (accuracyInfo !== null) {
                accuracyInfo = parseFloat(accuracyInfo[0]).toFixed(2);
            } else {
                accuracyInfo = '0.00';
            }

            let confirmedKillsInfo = parseInt(
                $(element).find('.data_item').eq(2).text().trim()
            );

            let killsHitInfo = $(element)
                .find('.data_item')
                .eq(3)
                .text()
                .trim()
                .match(/(\d+\.\d+)/);
            if (killsHitInfo !== null) {
                killsHitInfo = parseFloat(killsHitInfo[0]).toFixed(2);
            } else {
                killsHitInfo = 0;
            }

            let distanceInfo = $(element)
                .find('.data_item')
                .eq(4)
                .text()
                .trim();

            let distanceMeters = distanceInfo.match(/^\d+\.\d+/);
            let distanceFeets;
            if (distanceMeters !== null) {
                distanceMeters = parseFloat(distanceMeters[0]).toFixed(2);
                distanceFeets = parseFloat(
                    distanceInfo.match(/(\d+\.\d+)ft/)[1]
                ).toFixed(2);
            } else {
                distanceMeters = '0';
                distanceFeets = '0';
            }

            tabledata.push({
                id: index,
                weapon_title: weaponTitle,
                weapon_info: weaponTitle,
                weapon_image: weaponSrc,
                ammo_title: ammoTitle,
                ammo_image: ammoSrc,
                shots_data: shotsInfo,
                accuracy_data: accuracyInfo,
                confirmed_kills_data: confirmedKillsInfo,
                kills_hit_data: killsHitInfo,
                distance_meters: distanceMeters,
                distance_feets: distanceFeets,
            });
        });

        originalWeaponsTable.slideUp('normal', function () {
            $(this).remove();
        });

        let table = new Tabulator('#weapons-stats-table', {
            height: '100%',
            data: tabledata,
            layout: 'fitColumns',
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
            initialSort: [{ column: 'confirmed_kills_data', dir: 'desc' }],
            columns: [
                {
                    title: 'Weapon',
                    field: 'weapon_title',
                    minWidth: 154,
                    sorter: 'string',
                    tooltip: true,
                    headerMenu: headerWeaponsMenu,
                    formatter: weaponStatsFormatter,
                    headerFilter: true,
                    headerFilterPlaceholder: 'Filter..',
                },
                {
                    title: 'Name',
                    field: 'weapon_info',
                    sorter: 'string',
                    hozAlign: 'left',
                    cssClass: 'hunterHelperTableTitle',
                    visible: false,
                    minWidth: 300,
                },
                {
                    title: 'Ammo',
                    field: 'ammo_title',
                    width: 76,
                    sorter: 'string',
                    tooltip: true,
                    formatter: ammoStatsFormatter,
                    bottomCalc: countRows,
                    bottomCalcFormatter: hideZeroCount,
                    cssClass: 'hunterHelperTableImage',
                },
                {
                    title: 'Shots',
                    field: 'shots_data',
                    width: 70,
                    sorter: 'number',
                    bottomCalc: countRowValue,
                    bottomCalcFormatter: hideZeroCount,
                    headerSortStartingDir: 'desc',
                },
                {
                    title: 'Accuracy (%)',
                    field: 'accuracy_data',
                    width: 100,
                    sorter: 'number',
                    headerTooltip: 'Hit Accuracy (%)',
                    bottomCalc: countRowAverage,
                    bottomCalcFormatter: hideZeroCount,
                    formatter: zeroCountColor,
                    headerSortStartingDir: 'desc',
                },
                {
                    title: 'Kills',
                    field: 'confirmed_kills_data',
                    maxWidth: 60,
                    sorter: 'number',
                    headerTooltip: 'Confirmed kills',
                    bottomCalc: countRowValue,
                    bottomCalcFormatter: hideZeroCount,
                    formatter: zeroCountColor,
                    headerSortStartingDir: 'desc',
                },
                {
                    title: 'Kills per hit (%)',
                    field: 'kills_hit_data',
                    width: 111,
                    sorter: 'number',
                    bottomCalc: countRowAverage,
                    bottomCalcFormatter: hideZeroCount,
                    formatter: zeroCountColor,
                    headerSortStartingDir: 'desc',
                },
                {
                    title: 'Longest shot (m)',
                    field: 'distance_meters',
                    sorter: 'number',
                    bottomCalc: countRowAverage,
                    bottomCalcFormatter: hideZeroCount,
                    formatter: zeroCountColor,
                    headerSortStartingDir: 'desc',
                },
                {
                    title: 'Longest shot (ft)',
                    field: 'distance_feets',
                    sorter: 'number',
                    bottomCalc: countRowAverage,
                    bottomCalcFormatter: hideZeroCount,
                    formatter: zeroCountColor,
                    visible: false,
                    headerSortStartingDir: 'desc',
                },
            ],
        });
    }
}
