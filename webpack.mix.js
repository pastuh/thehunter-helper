let mix = require('laravel-mix');

mix.setPublicPath('./')
    // Included in manifest
    .js(
        'assets/js/utilities/extension/helpers.js',
        'dist/js/utilities/extension'
    )
    .js('assets/js/background.js', 'dist')

    .sass('assets/sass/foreground.scss', 'dist/css')
    .js('assets/js/foreground.js', 'dist')

    .sass('assets/sass/shop/storePage.scss', 'dist/css/shop')

    .sass('assets/sass/friends/friendsPage.scss', 'dist/css/friends')
    .js('assets/js/friends/friendsPage.js', 'dist/js/friends')
    .js('assets/js/friends/friendsStatus.js', 'dist/js/friends')

    .sass('assets/sass/message/messagePage.scss', 'dist/css/message')
    .js('assets/js/message/messagePage.js', 'dist/js/message')

    .sass('assets/sass/lodge/lodgePage.scss', 'dist/css/lodge')
    .js('assets/js/lodge/lodgePage.js', 'dist/js/lodge')

    .sass('assets/sass/mission/missionPage.scss', 'dist/css/mission')
    .js('assets/js/mission/missionPage.js', 'dist/js/mission')

    .sass(
        'assets/sass/competition/competitionPage.scss',
        'dist/css/competition'
    )
    .js('assets/js/competition/competitionPage.js', 'dist/js/competition')
    .js('assets/js/competition/competitionPause.js', 'dist/js/competition')
    .js('assets/js/competition/competitionSave.js', 'dist/js/competition')

    .sass('assets/sass/statistics/statisticsPage.scss', 'dist/css/statistics')

    .js(
        'assets/js/statistics/last/sorterContentPage.js',
        'dist/js/statistics/last'
    )
    .js('assets/js/statistics/last/weaponsTable.js', 'dist/js/statistics/last')
    .js(
        'assets/js/statistics/last/collectablesTable.js',
        'dist/js/statistics/last'
    )
    .js(
        'assets/js/statistics/last/achievementsTable.js',
        'dist/js/statistics/last'
    )
    .js('assets/js/statistics/last/antlersTable.js', 'dist/js/statistics/last')
    .js('assets/js/statistics/last/confirmsTable.js', 'dist/js/statistics/last')
    .js('assets/js/statistics/last/helpers.js', 'dist/js/statistics/last')
    .js(
        'assets/js/statistics/lifetime/animalsTable.js',
        'dist/js/statistics/lifetime'
    )

    .sass('assets/sass/leaderboards/leaderboardsPage.scss', 'dist/css/leaderboards')
    .js('assets/js/leaderboards/leaderboardsPage.js', 'dist/js/leaderboards')

    .sass('assets/sass/scoresheet/scoresheetPage.scss', 'dist/css/scoresheet')
    .js('assets/js/scoresheet/scoresheetPage.js', 'dist/js/scoresheet')

    .sass('assets/sass/shop/owned/ownedPage.scss', 'dist/css/shop/owned')
    .js('assets/js/shop/owned/ownedPage.js', 'dist/js/shop/owned')

    .sass('assets/sass/shop/ammo/ammoPage.scss', 'dist/css/shop/ammo')
    .js('assets/js/shop/ammo/ammoPage.js', 'dist/js/shop/ammo')

    .sass('assets/sass/shop/bundles/bundlesPage.scss', 'dist/css/shop/bundles')
    .js('assets/js/shop/bundles/bundlesPage.js', 'dist/js/shop/bundles')

    .js('assets/js/shop/price.js', 'dist/js/shop')

    .sass('assets/sass/popup.scss', 'dist/css')
    .js('assets/js/popup.js', 'dist/js')

    .copy('assets/images/', 'dist/images')

    .options({
        processCssUrls: false,
        terser: {
            terserOptions: {
                compress: {
                    drop_console: true
                }
            }
        },
    });

mix.autoload({
    jquery: ['$', 'window.jQuery'],
});
