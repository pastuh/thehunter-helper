export let globalLocInfo;

// On load set Hunter options/settings
export function setHunterOptions() {
    // Clear existing storage
    /*    chrome.storage.local.clear(function () {
			let error = chrome.runtime.lastError;
			if (error) {
				console.error(error);
			}
			// do something more
		});
		chrome.storage.local.clear(); // callback is optional*/

    // ----- DEFAULT VALUES FOR NEW EXTENSION USER
    let defaultValue = false;
    chrome.storage.local.get(
        { ownedItemsIsHidden: defaultValue },
        function (data) {
            // data.links will be either the stored value, or defaultValue if nothing is set
            chrome.storage.local.set(
                { ownedItemsIsHidden: data.ownedItemsIsHidden },
                function () {
                    // The value is now stored, so you don't have to do this again
                }
            );
        }
    );
    // ----- DEFAULT VALUES FOR NEW EXTENSION USER
    chrome.storage.local.get(
      { hunterStatsInternational: defaultValue },
      function (data) {
          chrome.storage.local.set(
            { hunterStatsInternational: data.hunterStatsInternational },
            function () {
            //
            }
          );
      }
    );

    // List all storage
    /*    chrome.storage.local.get(function (result) {
			console.log(result);
		});*/
}

// Check if page loaded
export function checkPageLoaded(callback) {
    let intervalChecker = setInterval(() => {
        let spinner = $('.loading-view');

        if (!spinner.length) {
            clearInterval(intervalChecker);
            callback();
        }
    }, 100);
}

export function checkElementLoaded(element, callback) {
    let intervalChecker = setInterval(() => {
        let loadingElement = $(element);
        if (loadingElement.length) {
            clearInterval(intervalChecker);
            callback();
        }
    }, 100);
}


export function checkLocalStorage() {
    chrome.storage.local.get(function (result) {
        console.log(`LOCAL:`, result);
    });
}

export function clearLocalStorage() {
    console.log(`~LOCAL CLEARED~`);
    chrome.storage.local.clear();
}

// Allow to scroll back to top
export function addUpArrow() {
    if (!$('#page-top').length) {
        let page = $('body');

        page.append(
            '<div id="page-top" title="Back to TOP"><span class="arrow-top">^</span></div>'
        );

        page.on('click', '#page-top', function () {
            $('html, body').animate(
                {
                    scrollTop: $('.main-menu').offset().top,
                },
                300
            );
        });
    }
}

// Add season counter near logo
export function addSeasonInfo() {
    if (!$('#season-info').length) {
        globalLocInfo = JSON.parse(localStorage.getItem('jStorage'));
        const seasonInfo = globalLocInfo.season;
        $('.section.logo').append(
            `<div id="season-info">${seasonInfo} season</div>`
        );
    }
}

// Add dynamic block to sidebar
export function addSidebarBlock(btnId) {
    if (!$(`#${btnId}`).length) {
        let targetLoc = $('#sidebar');
        targetLoc
          .last()
          .append(`<div id="${btnId}" class="section"><span class="slider btn">Extension settings</span><div class="slider-info"></div></div>`);
    }
}

// Add dynamic buttons to sidebar
export function addInteractionBtn(btnId, btnName) {
    if (!$(`#${btnId}`).length) {
        let targetLoc = $('#sidebar');
        targetLoc
            .last()
            .append(`<div id="${btnId}" class="section btn">${btnName}</div>`);
    }
}

export function initAuth() {
    let auth_id = document.documentElement.innerHTML.match(
        /\"access_token\":\"(\w+)\"/
    );
    return auth_id[1];
}

export function addOptionsCheckbox(btnId, btnMainClass, btnName, btnDescr, counter) {
    console.log($(`#optionsBlock`).length);
    if (!$(`#${btnId}`).length) {

        let counterTemplate = '';
        if(counter) {
            counterTemplate = `<span class="switchCounter"></span>`;
        }
        let template = `<div class="store-info-text ${btnMainClass}">
                <div>"${btnName}" 
                    <div class="help-tip">${btnDescr}</div>
                </div>
                <div class="onoffswitch">
                    <input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="${btnId}" tabindex="0">
                    <label class="onoffswitch-label" for="${btnId}">
                        <span class="onoffswitch-inner"></span>
                        <span class="onoffswitch-switch"></span>
                    </label>
                </div>
                ${counterTemplate}
            </div>`;

        let targetLoc = $('#optionsBlock .slider-info');
        targetLoc
          .last()
          .append(template);
    }
}