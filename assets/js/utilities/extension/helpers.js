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

    let defaultValue = true;
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

// Add dynamic buttons to sidebar
export function addInteractionBtn(btnId, btnName) {
    if (!$(`#${btnId}`).length) {
        let targetLoc = $('#sidebar');
        targetLoc
            .last()
            .append(`<div id="${btnId}" class="section btn">${btnName}</div>`);
    }
}

// Nenaudojama?
/*export function sendContentMsgToPopup(from, todo, data = '-') {
    chrome.runtime.sendMessage({
        from: from,
        todo: todo,
        data: data,
    });
}*/
