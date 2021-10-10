import Tabulator from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import {
    animalStatsImageFormatter,
    countRows,
    countRowValue,
    headerStatsMenu,
    hideZeroCount,
} from './helpers';

export function styleAchievementsTable() {
    let originalAchievementsTable = $('.achievement-latest.table');
    if (originalAchievementsTable.length) {
        let tabledata = [];

        let achievementsList = originalAchievementsTable.after(
            '<div id="achievements-stats-table" class="hunterHelperTable"></div>'
        );
        let originalAchievementsData =
            originalAchievementsTable.find('tbody tr');

        originalAchievementsData.each(function (index, element) {
            let achievementSrc = $(element).find('td img').attr('src');

            let elementTitle = $(element)
                .find('td:eq(1)')
                .html()
                .split('<br>')[1]
                .trim()
                .slice(0, -1);
            let achievementTitle = elementTitle
                .match(/^(\d+)(.*)/)[2]
                .replace(' harvests in the EHR', '');

            let dateInfo = $(element).find('.date').text().trim();
            let scoreInfo = $(element).find('.score').text().trim();

            tabledata.push({
                id: index,
                title: achievementTitle,
                image: achievementSrc,
                date_data: dateInfo,
                score_data: scoreInfo,
            });
        });

        originalAchievementsTable.slideUp('normal', function () {
            $(this).remove();
        });

        let table = new Tabulator('#achievements-stats-table', {
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
            columns: [
                {
                    title: 'Achievement',
                    field: 'image',
                    maxWidth: 60,
                    sorter: 'string',
                    hozAlign: 'center',
                    tooltip: true,
                    headerMenu: headerStatsMenu,
                    formatter: animalStatsImageFormatter,
                    bottomCalc: countRows,
                    bottomCalcFormatter: hideZeroCount,
                    cssClass: 'hunterHelperTableImage',
                },
                {
                    title: 'Title',
                    field: 'title',
                    sorter: 'string',
                    hozAlign: 'left',
                    headerFilter: true,
                    headerFilterPlaceholder: 'Filter..',
                    cssClass: 'hunterHelperTableTitle',
                },
                {
                    title: 'Date',
                    field: 'date_data',
                    width: 100,
                    sorter: 'string',
                    visible: false,
                },
                {
                    title: 'Harvests',
                    field: 'score_data',
                    width: 100,
                    sorter: 'number',
                    bottomCalc: countRowValue,
                    bottomCalcFormatter: hideZeroCount,
                    headerSortStartingDir: 'desc',
                },
            ],
        });
    }
}
