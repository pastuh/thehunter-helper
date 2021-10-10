// If background found statistics
import { checkPageLoaded } from '../../utilities/extension/helpers';
import { styleWeaponsTable } from './weaponsTable';
import { styleAnimalsLifeTimeTable } from '../lifetime/animalsTable';
import { styleCollectablesTable } from './collectablesTable';
import { styleAchievementsTable } from './achievementsTable';
import { styleAntlersTable } from './antlersTable';
import { styleConfirmedKillsTable } from './confirmsTable';

export function activateStatsLastTables() {
    checkPageLoaded(function () {
        if ($('.weapon_stats.table').length) {
            if (!$('#weapons-stats-table').length) {
                console.log(`weapons stats table`);
                styleWeaponsTable();
            }
        }
        if ($('.animal_stats.table').length) {
            if (!$('#animals-stats-table').length) {
                console.log(`animal stats table`);
                styleAnimalsLifeTimeTable();
            }
        }
        if ($('.collectable_stats.table').length) {
            if (!$('#collectables-stats-table').length) {
                console.log(`collectables stats table`);
                styleCollectablesTable();
            }
        }
        if ($('.achievement-latest.table').length) {
            if (!$('#achievements-stats-table').length) {
                console.log(`achievements stats table`);

                styleAchievementsTable();
            }
        }
        if ($('.antler-collectables').length) {
            if (!$('#antlers-stats-table').length) {
                console.log(`antlers table`);

                styleAntlersTable();
            }
        }
        if ($('.confirmed-kills').length) {
            if (!$('#confirmed-stats-table').length) {
                console.log(`confirmed kills table`);

                styleConfirmedKillsTable();
            }
        }
    });
}
