import Tabulator from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import {
    addStatsTrophiesSrc,
    animalStatsImageFormatter,
    countRows,
    countRowValue,
    headerStatsMenu,
    hideZeroCount,
    zeroCountColor,
} from '../last/helpers';
import { setCompetitionAnimalImage } from '../../competition/competitionPage';

export function styleAnimalsLifeTimeTable() {
    let originalAnimalsTable = $('.animal_stats.table');
    if (originalAnimalsTable.length) {
        let tabledata = [];

        let animalsList = originalAnimalsTable.after(
            '<div id="animals-stats-table" class="hunterHelperTable"></div>'
        );

        addStatsTrophiesSrc();

        let originalAnimalsData = originalAnimalsTable.find('tr.row_data_1');

        originalAnimalsData.each(function (index, element) {
            let animalTitle = $(element).find('.animal_item').text().trim();

            let animalSrc = setCompetitionAnimalImage(animalTitle);
            animalSrc = `https://static.thehunter.com/static/img/statistics/${animalSrc}.png`;

            let spottedInfo = $(element).find('.data_item').eq(0).text().trim();
            let trackedInfo = $(element).find('.data_item').eq(1).text().trim();
            let harvestedInfo = $(element)
                .find('.data_item')
                .eq(2)
                .text()
                .trim();

            tabledata.push({
                id: index,
                title: animalTitle,
                image: animalSrc,
                spotted_data: spottedInfo,
                tracked_data: trackedInfo,
                harvested_data: harvestedInfo,
            });
        });

        originalAnimalsTable.slideUp('normal', function () {
            $(this).remove();
        });

        let table = new Tabulator('#animals-stats-table', {
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
            initialSort: [{ column: 'harvested_data', dir: 'desc' }],
            columns: [
                {
                    title: 'Species',
                    field: 'image',
                    maxWidth: 60,
                    sorter: 'string',
                    hozAlign: 'center',
                    headerTooltip: true,
                    headerMenu: headerStatsMenu,
                    formatter: animalStatsImageFormatter,
                    bottomCalc: countRows,
                    bottomCalcFormatter: hideZeroCount,
                    cssClass: 'hunterHelperTableImage',
                },
                {
                    title: 'Name',
                    field: 'title',
                    sorter: 'string',
                    hozAlign: 'left',
                    headerFilter: true,
                    headerFilterPlaceholder: 'Filter..',
                    cssClass: 'hunterHelperTableTitle',
                },
                {
                    title: 'Spotted',
                    field: 'spotted_data',
                    sorter: 'number',
                    bottomCalc: countRowValue,
                    bottomCalcFormatter: hideZeroCount,
                    formatter: zeroCountColor,
                    headerSortStartingDir: 'desc',
                },
                {
                    title: 'Tracked',
                    field: 'tracked_data',
                    sorter: 'number',
                    bottomCalc: countRowValue,
                    bottomCalcFormatter: hideZeroCount,
                    formatter: zeroCountColor,
                    headerSortStartingDir: 'desc',
                },
                {
                    title: 'Harvested',
                    field: 'harvested_data',
                    sorter: 'number',
                    bottomCalc: countRowValue,
                    bottomCalcFormatter: hideZeroCount,
                    formatter: zeroCountColor,
                    headerSortStartingDir: 'desc',
                },
            ],
        });
    }
}
