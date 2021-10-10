import Tabulator from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import {
    collectableStatsFormatter,
    countRows,
    countRowValue,
    headerStatsMenu,
    hideZeroCount,
} from './helpers';

export function styleCollectablesTable() {
    let originalCollectablesTable = $('.collectable_stats.table');
    if (originalCollectablesTable.length) {
        let tabledata = [];

        let collectablesList = originalCollectablesTable.after(
            '<div id="collectables-stats-table" class="hunterHelperTable"></div>'
        );
        let originalCollectablesData =
            originalCollectablesTable.find('tr.row_data_1');

        originalCollectablesData.each(function (index, element) {
            let collectableTitle = $(element)
                .find('.data_item .collectable')
                .attr('title');
            let collectableBackground = $(element)
                .find('.data_item .collectable')
                .css('background');
            let collectableBackgroundPos = $(element)
                .find('.data_item .collectable')
                .css('backgroundPosition');

            let collectedInfo = $(element)
                .find('.data_item')
                .eq(1)
                .text()
                .trim();
            let totalInfo = $(element).find('.data_item').eq(2).text().trim();
            let maxInfo = $(element).find('.data_item').eq(3).text().trim();

            tabledata.push({
                id: index,
                collectable_title: collectableTitle,
                image: collectableTitle,
                collected_data: collectedInfo,
                total_data: totalInfo,
                max_data: maxInfo,
                background: collectableBackground,
                backgroundPos: collectableBackgroundPos,
            });
        });

        originalCollectablesTable.slideUp('normal', function () {
            $(this).remove();
        });

        let table = new Tabulator('#collectables-stats-table', {
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
            initialSort: [{ column: 'collected_data', dir: 'desc' }],
            columns: [
                {
                    title: 'Collectable',
                    field: 'image',
                    maxWidth: 60,
                    sorter: 'string',
                    hozAlign: 'center',
                    tooltip: true,
                    headerMenu: headerStatsMenu,
                    formatter: collectableStatsFormatter,
                    bottomCalc: countRows,
                    bottomCalcFormatter: hideZeroCount,
                },
                {
                    title: 'Name',
                    field: 'collectable_title',
                    sorter: 'string',
                    hozAlign: 'left',
                    headerFilter: true,
                    headerFilterPlaceholder: 'Filter..',
                    cssClass: 'hunterHelperTableTitle',
                },
                {
                    title: 'Collected',
                    field: 'collected_data',
                    sorter: 'number',
                    bottomCalc: countRowValue,
                    bottomCalcFormatter: hideZeroCount,
                    headerSortStartingDir: 'desc',
                },
                {
                    title: 'Max',
                    field: 'max_data',
                    sorter: 'number',
                    headerSortStartingDir: 'desc',
                },
                {
                    title: 'Total',
                    field: 'total_data',
                    sorter: 'number',
                    bottomCalc: countRowValue,
                    bottomCalcFormatter: hideZeroCount,
                    headerSortStartingDir: 'desc',
                },
            ],
        });
    }
}
