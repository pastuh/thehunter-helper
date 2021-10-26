// Inject in to page something (allows manipulate DOM)
let page = $('body');

import {
    setHunterOptions,
    addInteractionBtn,
    checkPageLoaded,
    addSeasonInfo,
    addUpArrow,
    checkElementLoaded,
} from './utilities/extension/helpers';

import { activateStatsLastTables } from './statistics/last/sorterContentPage';
import {activateCompetitionStyle} from './competition/competitionPage';
import {
    activateCompetitionHistory,
    storeServerCompetitionData
} from "./competition/competitionHistory";
import { addFriendsModule } from './friends/friendsPage';
import { addProfileLodges } from './lodge/lodgePage';
import { activateMissions } from './mission/missionPage';
import { autoReadMessages, setMessageStatus } from './message/messagePage';
import { fixScoresheetImage } from './scoresheet/scoresheetPage';
import {
    addOwnedInteractionCheckbox,
    checkHideOwnedItems,
} from './shop/owned/ownedPage';
import { calculateBundle } from './shop/bundles/bundlesPage';
import { showSalePrice } from './shop/price';

// Activated after page refresh
chrome.runtime.sendMessage({
    from: 'foreground',
    subject: 'DOMInfo',
    todo: 'checkUrlFunctions',
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.todo === 'styleStatsLifeTimeTables') {
        activateStatsLastTables();
    }
    if (request.todo === 'styleStatsLastTables') {
        activateStatsLastTables();
    }
    if (request.todo === 'styleStatsTables') {
        activateStatsLastTables();
    }
    if (request.todo === 'styleCompetition') {
        storeServerCompetitionData();
        activateCompetitionStyle();
        activateCompetitionHistory();
    }
    if (request.todo === 'checkTabButtons') {
        showInfoButtons();
    }
    if (request.todo === 'checkLodge') {
        addProfileLodges();
    }
    if (request.todo === 'showMissions') {
        activateMissions();
    }
    if (request.todo === 'checkTrophyImageFix') {
        fixScoresheetImage();
    }
    if (request.todo === 'showBundleDiscount') {
        calculateBundle();
    }
    if (request.todo === 'checkShop') {
        checkElementLoaded('.store-list', function () {
            addOwnedInteractionCheckbox();
            checkHideOwnedItems();
            showSalePrice();
            triggerShopSearch();
        });
    }
});

function showInfoButtons() {
    checkPageLoaded(function () {
        setHunterOptions();
        addUpArrow();
        addSeasonInfo();
        addInteractionBtn('btnFriends', 'Show In-game friends');
        addInteractionBtn('btnMessage', 'Read new messages');
        setMessageStatus();
    });
}

function triggerShopSearch() {
    $('#store-category-search').on('keyup', function () {
        addOwnedInteractionCheckbox();
        checkHideOwnedItems();
        showSalePrice();
        calculateBundle();
    });
}

// Show InGame friends sidebar
page.on('click', '#btnFriends', function () {
    addFriendsModule();
});

page.on('click', '#btnMessage', function () {
    autoReadMessages();
});
