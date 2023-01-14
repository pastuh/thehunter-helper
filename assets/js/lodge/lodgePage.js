import {
    checkElementLoaded,
    checkPageLoaded, hideInfoMessage,
} from '../utilities/extension/helpers';

export function addProfileLodges() {
    checkPageLoaded(function () {
        // If content exist
        if (!$('#lodge-trophies-info').length && !$('#lodge-section').length) {
            $('#profile_content').prepend(
                `<div id="lodge-trophies-info" class="lodge-alert"><span class="lodge-trophies-message lodge-name">Looking for lodges..</span></div>`
            );
            activateLodges();
        }
    });
}

function activateLodges() {
    checkElementLoaded('#profile-header .handle .user-name', function () {
        userInfoForLodges()
            .then((id) => checkLodges(id))
            .then((data) => countLodges(data))
            .then((data) => showLodges(data));
    });
}

async function userInfoForLodges() {
    let name = $('#profile-header .handle .user-name')[0].innerText;
    let response = await fetch(
        `https://api.thehunter.com/v1/Public_user/getByHostname?hostname=${name}`
    );
    let data = await response.json();
    return data.id;
}

async function checkLodges(id) {
    const infoData = [];
    let response = await fetch(
        `https://apiv2.thehunter.com/game/user/${id}/lodges`
    );
    let data = await response.json();
    infoData.push({ activeUser: id, lodges: data });
    return infoData;
}

async function countLodges(data) {
    hideInfoMessage('.lodge-trophies-message');

    if (data[0].lodges.length) {
        const lodgeInfo = [];

        data[0].lodges.forEach((lodge) => {
            if (!lodge.locked) {
                lodgeInfo.push({
                    activeUser: data[0].activeUser,
                    lodgeId: lodge.id,
                    lodgeType: lodge.lodge_type_id,
                    lodgeName: lodge.name,
                });
            }
        });
        return lodgeInfo;
    } else {
        $('#lodge-trophies-info').append(
            `<span class="lodge-trophies-message lodge-name">Open lodges not found!</span>`
        );

        setTimeout(() => {
            hideInfoMessage('.lodge-trophies-message');
        }, 5000);
        return;
    }
}

async function showLodges(data) {
    const lodgeList = [
        {
            id: 746,
            url: 'https://static.thehunter.com/static/img/items/256/classy_trophy_lodge.png',
        },
        {
            id: 780,
            url: 'https://static.thehunter.com/static/img/items/256/rustic_trophy_lodge.png',
        },
        {
            id: 846,
            url: 'https://static.thehunter.com/static/img/items/256/tropical_lodge.png',
        },
    ];

    if ($('#pending-friend-requests').length && !$('#lodgescontent').length) {
        let $main = $('body');
        if ($main.length) {
            // Wait for ajax content
            let checkExist2 = setInterval(function () {
                if ($('#profile-header').length) {
                    clearInterval(checkExist2);

                    $('#profile-header').prepend(
                        `<div id="lodge-section"></div>`
                    );
                    $('body').prepend(`<div id="trophy-overlay"></div>`);
                    $('body').prepend(
                        `<div id="trophy-overlayContent">
                            <div class="screen-info">
                                <div class="trophy-close">X</div>
                                <img id="trophy-imgBig" src="" />
                                <div class="trophy-text"></div>
                            </div>

                        </div>`
                    );
                    if (typeof data !== 'undefined') {

                        let lodgeSize = ''
                        let lodgeSpace = '';
                        if(data.length > 32) {
                            lodgeSpace = 'lodge-adjust';
                            lodgeSize = 'lodge-huge';
                        } else if (data.length > 26) {
                            lodgeSpace = 'lodge-adjust';
                            lodgeSize = 'lodge-large';
                        } else if (data.length > 16) {
                            lodgeSize = 'lodge-medium';
                        }

                        $('#lodge-section').addClass(lodgeSpace);

                        data.forEach((lodgeData) => {
                            for (let i = 0; i < lodgeList.length; i++) {
                                if (lodgeData.lodgeType === lodgeList[i].id) {
                                    //Add links to trophies with image
                                    $('#lodge-section').prepend(
                                        `<img class="lodge-image lodge-${lodgeData.lodgeId} ${lodgeSize}" src='${lodgeList[i].url}' title="${lodgeData.lodgeName}"/>`
                                    );
                                    // Allow to click on each lodge and preview trophies
                                    $(`.lodge-${lodgeData.lodgeId}`).on(
                                        'click',
                                        function () {
                                            getLodgeTrophies(lodgeData);
                                        }
                                    );
                                }
                            }
                        });
                    }
                }
            }, 100);
        }
    }
}

async function getLodgeTrophies(lodgeData) {
    fetchTrophies(lodgeData)
        .then((animals) => listTrophiesIds(animals))
        .then((ids) => getTrophiesData(ids))
        .then((data) => listTrophiesPhoto(data));
}

async function fetchTrophies(lodgeData) {
    let response = await fetch(
        `https://apiv2.thehunter.com/game/user/${lodgeData.activeUser}/lodges/${lodgeData.lodgeId}`
    );
    return await response.json();
}

async function listTrophiesIds(data) {
    $(`.lodge-${data.id}`).animate(
        {
            width: 'toggle',
        },
        300
    );

    const trophyIds = [];
    if (typeof data.animal_slots !== 'undefined') {
        $('#profile_content').html('');
        data.animal_slots.forEach((animal) => {
            trophyIds.push(animal.trophy_id);
        });
    } else {
        $('#lodge-trophies-info').append(
            `<span class="lodge-trophies-message lodge-name">${data.name} lodge is empty!</span>`
        );

        setTimeout(() => {
            hideInfoMessage('.lodge-trophies-message');
        }, 5000);
    }
    return trophyIds;
}

async function getTrophiesData(ids) {
    if (ids.length) {
        let name = $('#profile-header .handle .user-name')[0].innerText;
        $('#profile_content').append('<div class="trophy-loader-zone"><div class="trophy-loader"></div><span>Loading trophies..</span></div>');

        try {
            let data = await Promise.all(
                ids.map((id) =>
                    $.ajax({
                        type: 'GET',
                        url: `https://www.thehunter.com/user/${name}/score/?id=${id}&tab=true`,
                        success: function (data) {
                            return data;
                        },
                        statusCode: {
                            500: function() {
                                $('.trophy-loader-zone').html(`<div class="trophy-loader" style="border-color: red;"></div><span style='color: red;'>Error.. page reload required</span>`);
                            }
                        }
                    })
                )
            );
            return data;
        } catch (error) {
            //console.log(error);
            throw error;
        }
    }
}

async function listTrophiesPhoto(data) {
    if (typeof data !== 'undefined' && data.length) {
        let loader = $('.trophy-loader-zone');

        data.forEach((page) => {

            const regex = /https.*\\\/\w+\.jpg/gi;
            const found = page.match(regex);

            // If photo exist
            if (found !== null) {

                // Check if possible to load data
                if(loader.length && /animal_id":(\d+),/gi.exec(page) !== null) {
                    $('.trophy-loader-zone').remove();
                } else {
                    $('.trophy-loader-zone').html(`<div class="trophy-loader" style="border-color: red;"></div><span style='color: red;'>Error.. Data not available</span>`);
                    return false;
                }

                const trophyImage = found[0].replace(/\\\//gi, '/');
                const finalImage =
                    trophyImage.slice(0, 27) +
                    '/thumb/242x242' +
                    trophyImage.slice(27);

                let name = /hostname":"(\w+)"/gi.exec(page)[1];
                let animal_id = /animal_id":(\d+),/gi.exec(page)[1];
                let shot_distance = /distance":(\d+|\w+),/gi.exec(page)[1];
                let weight = /"weight":(\d+(\.\d+)?|\w+)/gi.exec(page)[1];
                let score = /"score":(\d+(\.\d+)?|\w+)/gi.exec(page)[1];
                let confirmTime = /"confirmTs":(\d+),/gi.exec(page)[1];

                $('#profile_content').append(`
                <div class="trophy-image trophy-${animal_id}"><img src="${finalImage}"><a class="trophy-link" href="https://www.thehunter.com/#profile/${name}/score/${animal_id}" target="_blank">${new Date(
                    confirmTime * 1000
                )
                    .toISOString()
                    .slice(0, 19)
                    .replace('T', ' ')}</a></div>
            `);

                $(`.trophy-${animal_id}`).on('click', () => {
                    $('.trophy-text').html(
                        `Shot this <span class="trophy-mark">${
                            weight !== 'null' ? weight / 1000 : '...'
                        } kg</span> beauty from <span class="trophy-mark">${
                            shot_distance !== 'null'
                                ? shot_distance / 1000
                                : 'unknown'
                        } m</span> distance. Score was <span class="trophy-mark">${
                            score !== 'null' ? score : 'unknown'
                        }</span>`
                    );
                    $('#trophy-overlay').slideDown('fast');
                    $('#trophy-overlayContent').slideDown('fast');
                    $('#trophy-imgBig').attr('src', `${trophyImage}`);
                });
            }
        });

        $('#trophy-imgBig,.trophy-close').on('click', () => {
            $('#trophy-imgBig').attr('src', '');
            $('#trophy-overlay').hide();
            $('#trophy-overlayContent').hide();
        });

        // Nice scroll up
        //$('html, body').animate({ scrollTop : $('.trophy-image').offset().top - 60 }, 500);
    }
}
