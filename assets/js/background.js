// NOTICE: EVENT js CAN highlight extension icon
// Content -> EVENT (icon actions)
// Activated based on tab actions
let allowedUrl = 'https://www.thehunter.com';

try {
    // Only for specific page
    let allowedUrl = 'https://www.thehunter.com';

    chrome.tabs.onCreated.addListener(async function (tab) {
        chrome.tabs.onUpdated.addListener(async function (
            tabId,
            changeInfo,
            updatedTab
        ) {
            try {
                if (
                    changeInfo.status == 'complete' &&
                    tab.id === updatedTab.id &&
                    updatedTab.url.startsWith(allowedUrl)
                ) {
                    await chrome.action.enable(tab.id);
                } else {
                    await chrome.action.disable(tab.id);
                }
            } catch (e) {
                if (!e.message.includes('No tab with id')) {
                    console.log(`Error while creating:`, e);
                }
            }
        });
    });

    chrome.tabs.onActivated.addListener(async (activeTabInfo) => {
        try {
            const tab = await chrome.tabs.get(activeTabInfo.tabId);
            const isAllowed = tab.url.startsWith(allowedUrl);
            if (isAllowed) {
                await chrome.action.enable(tab.id);
            } else {
                await chrome.action.disable(tab.id);
            }
        } catch (e) {
            console.log(`Error while activating:`, e);
        }
    });

    chrome.tabs.onUpdated.addListener(async (tabId, changeTabInfo) => {
        try {
            let tab = await chrome.tabs.get(tabId);

            if (
                tab.active &&
                changeTabInfo.url !== undefined &&
                changeTabInfo.url.startsWith(allowedUrl)
            ) {
                await chrome.action.enable(tab.id);
            } else {
                await chrome.action.disable(tab.id);
            }
        } catch (e) {
            if (!e.message.includes('No tab with id')) {
                console.log(`Error while updating`, e);
            }
        }
    });
} catch (e) {
    console.log(`Main Error:`, e);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    //On request from Content: to show icon
    if (
        request.from === 'foreground' &&
        request.todo === 'checkUrlFunctions' &&
        request.subject === 'DOMInfo'
    ) {
        console.log('Message from foreground');
        // Retrieve all tabs
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (activeTabs) {
                // Activate Main buttons
                checkOnMessage(`.`, 'checkTabButtons', activeTabs[0]);
                // If plugin was Activated while opening Scoresheet..
                checkOnMessage(
                    `\\/score\\/\\d+$`,
                    'checkTrophyImageFix',
                    activeTabs[0]
                );
                // If plugin was Activated while opening Profle..
                checkOnMessage(`#profile\\/\\w+`, 'checkLodge', activeTabs[0]);
                // If plugin was Activated while opening Store..
                checkOnMessage(`#store`, 'checkShop', activeTabs[0]);
                // If plugin was Activated while opening Store Bundles..
                checkOnMessage(
                    `#store\\/50`,
                    'showBundleDiscount',
                    activeTabs[0]
                );
                // If plugin was Activated while opening Mission..
                checkOnMessage(`#missions`, 'showMissions', activeTabs[0]);
                // If plugin was Activated while opening Competitions..
                checkOnMessage(
                    `#competitions`,
                    'styleCompetition',
                    activeTabs[0]
                );
                // If plugin was Activated while opening Expedition..
                checkOnMessage(
                    `\\/expedition\\/\\d+$`,
                    'styleStatsTables',
                    activeTabs[0]
                );
                checkOnMessage(
                    `\\/statistics(\\/latest)?$`,
                    'styleStatsLastTables',
                    activeTabs[0]
                );
                checkOnMessage(
                    `\\/statistics\\/lifetime$`,
                    'styleStatsLifeTimeTables',
                    activeTabs[0]
                );
            }
        );
        sendResponse({status: 'ok'});
        return true;
    }
});

function checkOnMessage(expression, request, selectedTab) {
    let regex = new RegExp(expression, 'g');
    if (regex.test(selectedTab.url)) {
        chrome.tabs.sendMessage(selectedTab.id, {
            todo: request,
        });
        return true;
    }
}

// If website is active and user open next..
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, updatedTab) {
    console.log('website is really updated');

    if(updatedTab.url.startsWith(allowedUrl)) {

        if (changeInfo.status == 'complete') {
            checkOnUpdated(`.`, 'hideUnnecessary', tabId, changeInfo);
        }

        //Score..
        checkOnUpdated(
          `\\/score\\/\\d+$`,
          'checkTrophyImageFix',
          tabId,
          changeInfo
        );
        // Profile..
        checkOnUpdated(`#profile\\/\\w+`, 'checkLodge', tabId, changeInfo);
        // Store..
        checkOnUpdated(`#store`, 'checkShop', tabId, changeInfo);
        // Store Bundles..
        checkOnUpdated(`#store\\/50`, 'showBundleDiscount', tabId, changeInfo);
        // Missions..
        checkOnUpdated(`#missions`, 'showMissions', tabId, changeInfo);
        // Competitions..
        checkOnUpdated(`#competitions`, 'styleCompetition', tabId, changeInfo);
        // Expedition..
        checkOnUpdated(
          `\\/expedition\\/\\d+$`,
          'styleStatsLastTables',
          tabId,
          changeInfo
        );
        checkOnUpdated(
          `\\/statistics(\\/latest)?$`,
          'styleStatsLastTables',
          tabId,
          changeInfo
        );
        checkOnUpdated(
          `\\/statistics\\/lifetime$`,
          'styleStatsLifeTimeTables',
          tabId,
          changeInfo
        );
    }


});

function checkOnUpdated(expression, request, tabId, changeInfo) {
    let regex = new RegExp(expression, 'g');
    if (regex.test(changeInfo.url)) {
        chrome.tabs.sendMessage(tabId, {
            todo: request,
        });
        return true;
    }
}

// If user activates tab..
chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, async function (tab) {

        const webTab = await chrome.tabs.get(activeInfo.tabId);
        console.log('If user activates tab..');
        const isAllowed = webTab.url.startsWith(allowedUrl);

        if(isAllowed) {
            // Activate Main buttons
            checkOnActivated(`.`, 'checkTabButtons', tab, activeInfo);

            // Score..
            checkOnActivated(
              `\\/score\\/\\d+$`,
              'checkTrophyImageFix',
              tab,
              activeInfo
            );
            // Profile..
            checkOnActivated(`#profile\\/\\w+`, 'checkLodge', tab, activeInfo);
            // Store..
            checkOnActivated(`#store`, 'checkShop', tab, activeInfo);
            // Store Bundles..
            checkOnActivated(`#store\\/50`, 'showBundleDiscount', tab, activeInfo);
            // Missions..
            checkOnActivated(`#missions`, 'showMissions', tab, activeInfo);
            // Missions..
            checkOnActivated(`#competitions`, 'styleCompetition', tab, activeInfo);
            // Expedition..
            checkOnActivated(
              `\\/expedition\\/\\d+$`,
              'styleStatsLastTables',
              tab,
              activeInfo
            );
            checkOnActivated(
              `\\/statistics(\\/latest)?$`,
              'styleStatsLastTables',
              tab,
              activeInfo
            );
            checkOnActivated(
              `\\/statistics\\/lifetime$`,
              'styleStatsLifeTimeTables',
              tab,
              activeInfo
            );
        }


    });
});

function checkOnActivated(expression, request, tab, activeInfo) {
    let regex = new RegExp(expression, 'g');
    if (regex.test(tab.url)) {
        chrome.tabs.sendMessage(activeInfo.tabId, {
            todo: request,
        });
        return true;
    }
}

// If user creates new tab with..
chrome.tabs.onCreated.addListener(function (tab) {
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, updatedTab) {

        if (updatedTab.url.startsWith(allowedUrl) && changeInfo.status == 'complete' && tab.id === updatedTab.id) {
            console.log(`Tab created and updated.. and allowed?`, updatedTab.url.startsWith(allowedUrl));
            // Score..
            checkOnCreated(
                `\\/score\\/\\d+$`,
                'checkTrophyImageFix',
                tab,
                tabId
            );
            // Profile..
            checkOnCreated(`#profile\\/\\w+`, 'checkLodge', tab, tabId);
            // Store..
            checkOnCreated(`#store`, 'checkShop', tab, tabId);
            // Store Bundles..
            checkOnCreated(`#store\\/50`, 'showBundleDiscount', tab, tabId);
            // Missions..
            checkOnCreated(`#missions`, 'showMissions', tab, tabId);
            // Missions..
            checkOnCreated(`#competitions`, 'styleCompetition', tab, tabId);
            // Expedition..
            checkOnCreated(
                `\\/expedition\\/\\d+$`,
                'styleStatsLastTables',
                tab,
                tabId
            );
            checkOnCreated(
                `\\/statistics(\\/latest)?$`,
                'styleStatsLastTables',
                tab,
                tabId
            );
            checkOnCreated(
                `\\/statistics\\/lifetime$`,
                'styleStatsLifeTimeTables',
                tab,
                tabId
            );
        }
    });
});

function checkOnCreated(expression, request, tab, tabId) {
    let regex = new RegExp(expression, 'g');
    if (regex.test(tab.pendingUrl)) {
        setTimeout(function () {
            chrome.tabs.sendMessage(tabId, {
                todo: request,
            });
            return true;
        }, 500);
        return true;
    }
}

// For future testing working example
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (
        request.from === 'foreground' &&
        request.todo === 'showFriends' &&
        request.subject === 'DOMInfo'
    ) {
        sendResponse({
            message: 'success',
        });
        return true;
    }
});

// Read player message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (
        request.from === 'foreground' &&
        request.todo === 'readMessage' &&
        request.subject === 'userCommand'
    ) {
        let text = request.message;
        testVoiceMatching(text);
    }
});

function testVoiceMatching(result) {
    let speakListener = function (utterance, options, sendTtsEvent) {
        sendTtsEvent({ type: 'end', charIndex: utterance.length });
    };
    let stopListener = function () {};
    chrome.ttsEngine.onSpeak.addListener(speakListener);
    chrome.ttsEngine.onStop.addListener(stopListener);

    chrome.tts.speak(result, {
        voiceName: 'Microsoft Mark - English (United States)',
        enqueue: true,
        onEvent: function (event) {
            if (event.type == 'end') {
                chrome.ttsEngine.onSpeak.removeListener(speakListener);
                chrome.ttsEngine.onStop.removeListener(stopListener);
            }
        },
    });
}
