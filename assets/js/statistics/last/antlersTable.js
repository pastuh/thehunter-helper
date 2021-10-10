import Tabulator from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import {
    animalStatsImageFormatter,
    countRowAverage,
    countRows,
    headerStatsMenu,
    hideZeroCount,
} from './helpers';

export function styleAntlersTable() {
    let originalAntlersTable = $('.antler-collectables div').first();
    if (originalAntlersTable.length) {
        let tabledata = [];

        let antlersList = originalAntlersTable.after(
            '<div id="antlers-stats-table" class="hunterHelperTable"></div>'
        );

        let originalAntlersData = originalAntlersTable.find(
            '.antler-collectable'
        );

        originalAntlersData.each(function (index, element) {
            let details = $(element).find('.details').html().split('<br>');
            let antlerTitle = details[0].split(': ')[1].trim();

            let antlerSrc = $(element).find('.image img').attr('src');

            let typeInfo = details[1].split(': ')[1].trim();
            let scoreInfo = details[2].split(': ')[1].trim();
            let harvestedInfo = details[3].split(': ')[1].trim();

            tabledata.push({
                id: index,
                title: antlerTitle,
                image: antlerSrc,
                type_data: typeInfo,
                score_data: scoreInfo,
                harvested_data: harvestedInfo,
            });
        });

        originalAntlersTable.slideUp('normal', function () {
            $(this).remove();
        });

        let table = new Tabulator('#antlers-stats-table', {
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
            initialSort: [{ column: 'score_data', dir: 'desc' }],
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
                    title: 'Type',
                    field: 'type_data',
                    sorter: 'string',
                    headerSortStartingDir: 'desc',
                },
                {
                    title: 'Score',
                    field: 'score_data',
                    sorter: 'number',
                    bottomCalc: countRowAverage,
                    bottomCalcFormatter: hideZeroCount,
                    headerSortStartingDir: 'desc',
                },
                {
                    title: 'Time of Harvest',
                    field: 'harvested_data',
                    sorter: 'string',
                    tooltip: true,
                    headerSortStartingDir: 'desc',
                    visible: false,
                },
            ],
        });
    }
}
