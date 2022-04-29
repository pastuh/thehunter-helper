import {checkElementDisappeared, checkElementLoaded} from '../utilities/extension/helpers';
import {setCompetitionAnimalImage} from "../competition/competitionPage";

let missionPacksInfo = [];

export function activateMissions() {
    checkElementLoaded('#page-missions', function () {

        if (!$('.mission-info-data').length) {

            missionActivator();

            let page = $('body');

            // Detect interactive clicks and adjust table style
            page.on('click', '#missions-favourites-content .icon-star,#missions-packs .toggleFavourite,#page-missions fieldset', function (e) {
                if($(e.target).attr("id") === "mission_favourite_hide" ||
                  $(e.target).attr("id") === "hide-completed" ||
                  $(e.target).hasClass('icon-star') || $(e.target).hasClass('icon-star-empty')){
                    repeatMissionActivator();
                }
            });

            $(document).on("change","select#block_id",function() {
                missionActivator();
            });

            page.on('click', 'button.filterMissions', function (e) {
                missionActivator();
            });

            page.on('keydown', 'input#mission-search', function(e) {
                if(e.key === 'Enter') {
                    missionActivator();
                }
            });

            addMissionLinks();

            page.on('click', '#page-mission-links .btn', function (e) {
                let target = $(e.target).data('link');

                console.log(target);

                $('html, body').animate(
                  {
                      scrollTop: $(`#${target}`).offset().top - 100,
                  },
                  300
                );
            });

        }
    });

}

function repeatMissionActivator() {

    if($('#mission-favourite .set-row').length) {
        console.log('Yra favoritas... spalvinsime');
        checkElementDisappeared('#mission-favourite .mission-info-data', styleFavouritePacks);
    } else if ($('#missions-packs .set-container .icon-star').length &&
              !$('#mission-favourite .mission-info-data').length) {
        console.log('Nesimato favorito... bus greitai');
        checkElementLoaded('#missions-favourites-content .set-row', styleFavouritePacks);
    }
}

function missionActivator() {

    checkElementLoaded('#page-missions', function () {

        // Move 'Active' to the top
        $('#missions-active-headline').parent().detach().prependTo($('#mission-favourite').parent());

        // Fix activation block
        $('#activate-all-block').detach().appendTo('#page-missions');

        if (($('#missions-packs .set-row').length && !$('#missions-packs .mission-info-data').length)) {
            console.log(`Missions styled`);
            styleMissionPacks()
        }

        if (($('#mission-favourite .set-row').length && !$('#mission-favourite .mission-info-data').length)) {
            console.log(`Favorites styled`);
            styleFavouritePacks()
        }

        if (($('#missions-active .mission-row').length && !$('#missions-active .mission-info-data').length)) {
            console.log(`Actives styled`);
            styleActivePacks()
        }

        if (($('#missions-available .mission-row').length && !$('#missions-available .mission-info-data').length)) {
            console.log(`Available styled`);
            styleAvailablePacks()
        }

        // Adjust sorting by animal name
        $('#missions-available [data-sid]').detach().sort(asc_sort).appendTo('#missions-available');
        $('#missions-active [data-sid]').detach().sort(asc_sort).appendTo('.active-mission-block');

    });
}

async function alignOverviews(missionData) {
    missionData.sort(function (a, b) {
        return a.completed - b.completed;
    });

    return missionData;
}

async function sortOverviews(missionData) {
    missionData.forEach((mission) => {
        if (mission.active) {
            $('.mission-sets-container').before(mission.block);
        } else {
            $('.mission-sets-container').prepend(mission.block);
        }
    });
}

async function styleActivePacks() {
    $('.active-mission-block .mission-container').each(function () {
        const activeQuest = $(this).find('.mission-row').ignore('div').text().trim();
        missionPacksInfo.forEach((element, i) =>  {

            if(activeQuest === element.currentMissionTitle ) {

                $(this).parent().attr('data-sid', element.animalName);
                let overviewRaw = $(this).find('.mission-row');

                overviewRaw.contents().filter(function(){
                    return this.nodeType === 3;
                }).remove();


                overviewRaw.append(`
                <div class="mission-info-data">
                    <span class="mission-objective-counter">${element.overviewCompleted} / ${element.overviewTotal}</span>
                    <i class="state-icon icon-caret-right"></i>
                    <img class="helperAnimalImage" src="${element.animalSrc}" style="display: inline-block;" onerror="if (this.src != 'https://static.thehunter.com/static/img/items/256/hunting_horn_01.png') this.src = 'https://static.thehunter.com/static/img/items/256/hunting_horn_01.png';">
                    <span class="mission-animal-name ${
                  element.overviewCompleted > 0 &&
                  element.overviewCompleted < element.overviewTotal
                    ? 'mission-started'
                    : ''
                } ${element.activatedMission ? 'mission-not-active' : ''}">${element.animalName}</span>
                </div>
                `);


                // Right info Overview
                overviewRaw.append(`
                <div class="mission-counter">
                
                <span>${element.currentMissionTitle}</span>
                    
                    ${
                  element.overviewCompleted < element.overviewTotal && element.currentMissionTitle !== ''
                    ? `
                        <div class="mission-info-line">
                            <i class="state-icon icon-caret-right"></i>
                            <span class="mission-objective-counter ${
                      element.completedObjectives > 0 &&
                      element.completedObjectives < element.totalObjectives
                        ? 'mission-started'
                        : ''
                    }">${element.completedObjectives} / ${element.totalObjectives}</span>
                            <i class="state-icon icon-caret-right"></i>
                            <span class="mission-objective">${element.missionObjective}</span>
                            <i class="state-icon icon-caret-right"></i>
                            <span class="mission-reward">${element.currentReward}</span>
                        </div>`
                    : `<div class="mission-info-line"></div>`
                }
                </div>
                `);

            }
        });

        // Remove arrow icon
        $(this).find('.state-icon-container:first').remove();
    });
}

async function styleAvailablePacks() {

    $('#missions-available .mission-container').each(function () {
        const activeQuest = $(this).find('.mission-row').ignore('div').text().trim();
        missionPacksInfo.forEach((element, i) =>  {

            if(activeQuest === element.currentMissionTitle ) {

                $(this).parent().attr('data-sid', element.animalName);
                let overviewRaw = $(this).find('.mission-row');

                overviewRaw.contents().filter(function(){
                    return this.nodeType === 3;
                }).remove();


                overviewRaw.append(`
                <div class="mission-info-data">
                    <span class="mission-objective-counter">${element.overviewCompleted} / ${element.overviewTotal}</span>
                    <i class="state-icon icon-caret-right"></i>
                    <img class="helperAnimalImage" src="${element.animalSrc}" style="display: inline-block;" onerror="if (this.src != 'https://static.thehunter.com/static/img/items/256/hunting_horn_01.png') this.src = 'https://static.thehunter.com/static/img/items/256/hunting_horn_01.png';">
                    <span class="mission-animal-name ${
                  element.overviewCompleted > 0 &&
                  element.overviewCompleted < element.overviewTotal
                    ? 'mission-started'
                    : ''
                } ${element.activatedMission ? 'mission-not-active' : ''}">${element.animalName}</span>
                </div>
                `);

                // Right info Overview
                overviewRaw.append(`
                <div class="mission-counter">
                
                <span>${element.currentMissionTitle}</span>
                    
                    ${
                  element.overviewCompleted < element.overviewTotal && element.currentMissionTitle !== ''
                    ? `
                        <div class="mission-info-line">
                            <i class="state-icon icon-caret-right"></i>
                            <span class="mission-objective-counter ${
                      element.completedObjectives > 0 &&
                      element.completedObjectives < element.totalObjectives
                        ? 'mission-started'
                        : ''
                    }">${element.completedObjectives} / ${element.totalObjectives}</span>
                            <i class="state-icon icon-caret-right"></i>
                            <span class="mission-objective">${element.missionObjective}</span>
                            <i class="state-icon icon-caret-right"></i>
                            <span class="mission-reward">${element.currentReward}</span>
                        </div>`
                    : `<div class="mission-info-line"></div>`
                }
                </div>
                `);

            }
        });

        // Remove arrow icon
        $(this).find('.state-icon-container:first').remove();
    });

}

function asc_sort(a, b){
    return (a.dataset.sid < b.dataset.sid) ? -1 : 1;
}

async function styleMissionPacks() {
    missionPacksInfo = [];

    $('.mission-sets-container .set-container').each(function () {
        // Main Available mission
        let availableMission = $(this).find(
          '.mission-container:not(.completed,.locked)'
        );

        let overviewRaw = $(this).find('.set-info:first .toggle-set-info');
        // console.log('overview', overviewRaw);

        let availableMissionRow = availableMission.find('.mission-row');
        // console.log(availableMissionRow);

        // Available mission Title
        let currentMissionTitle;
        if(availableMissionRow.length > 1) {
            currentMissionTitle = availableMissionRow.eq(0).text().trim();
        } else {
            currentMissionTitle = availableMissionRow.text().trim();
        }

        // console.log(`current title`, currentMissionTitle);

        let missionTitle = overviewRaw.ignore('div').text().trim();
        // console.log(`main title`, missionTitle);

        let animalName = missionTitle.replace('Missions', '');
        // console.log(`animal title`, animalName);
        overviewRaw.empty();

        // Confirm completed Overview missions
        let innerMission = $(this).find('.mission-container');
        innerMission.find('.objectives .icon-check').css('color', '#4c9e20');
        innerMission.find('.mission-row .icon-paw').css({'border-radius': '10px', 'background': '#4c9e20'});

        // Main overview counters
        let overviewCompleted = $(this).find(
          '.mission-container.completed'
        ).length;
        let overviewTotal = innerMission.length;
        // console.log(`Total quests: ${overviewCompleted}/${overviewTotal}`);

        // Active mission counter
        let objectivesInfo = availableMission.find('.objectives ol li');
        let totalObjectives = objectivesInfo.length;
        let completedObjectives = objectivesInfo.find('.icon-check').length;
        // console.log(`Inner quests: ${totalObjectives}/${completedObjectives}`);

        // Get Objective text
        let missionText = objectivesInfo
          .find('.icon-check-empty:first')
          .parent()
          .text()
          .trim();
        let missionObjective = missionText.split(' ')[0];
        // console.log(`Current quest: ${missionObjective}`);

        // Get if Mission Activated
        let activatedMission = availableMission.find('.activate button').length;

        // Count all visible missions rewards (gm$)
        let currentReward = parseInt(
          availableMission.find('.rewards ul li').ignore('i').text().trim()
        );

        // Visible missions total rewards (gm$)
        let totalReward = 0;
        innerMission.each(function () {
            let reward = parseInt(
              $(this).find('.rewards ul li').ignore('i').text().trim()
            );
            if (reward) {
                totalReward += reward;
            }
        });

        // Add rewards counter
        let totalGmsTemplate = `<div class="mission-counter">Total gm$: 
                                    <span class="mission-reward">${
                                      completedObjectives >= totalObjectives
                                        ? totalReward
                                        : totalReward + '+'
                                    }</span>
                                </div>`

        $(this)
          .find('.set-missions')
          .prepend(
            `${totalReward !== 0 ? totalGmsTemplate : '' }`
          );

        // Left info Overview
        let animalSrc = setCompetitionAnimalImage(animalName.trim());
        animalSrc = `https://static.thehunter.com/static/img/statistics/${animalSrc}.png`;

        overviewRaw.append(`
                <div class="mission-info-data">
                    <span class="mission-objective-counter">${overviewCompleted} / ${overviewTotal}</span>
                    <i class="state-icon icon-caret-right"></i>
                    <img class="helperAnimalImage" src="${animalSrc}" style="display: inline-block;" onerror="if (this.src != 'https://static.thehunter.com/static/img/items/256/hunting_horn_01.png') this.src = 'https://static.thehunter.com/static/img/items/256/hunting_horn_01.png';">
                    <span class="mission-animal-name ${
          overviewCompleted > 0 &&
          overviewCompleted < overviewTotal
            ? 'mission-started'
            : ''
        } ${activatedMission ? 'mission-not-active' : ''}
          ${overviewCompleted == overviewTotal ? 'mission-completed' : ''}">${animalName}</span>
                </div>
                `);


        // Right info Overview
        overviewRaw.append(`
                <div class="mission-counter">
                
                <span>${currentMissionTitle}</span>
                    
                    ${
          overviewCompleted < overviewTotal && currentMissionTitle !== ''
            ? `
                        <div class="mission-info-line">
                            <i class="state-icon icon-caret-right"></i>
                            <span class="mission-objective-counter ${
              completedObjectives > 0 &&
              completedObjectives < totalObjectives
                ? 'mission-started'
                : ''
            }">${completedObjectives} / ${totalObjectives}</span>
                            <i class="state-icon icon-caret-right"></i>
                            <span class="mission-objective">${missionObjective}</span>
                            <i class="state-icon icon-caret-right"></i>
                            <span class="mission-reward">${currentReward}</span>
                        </div>`
            : `<div class="mission-info-line"></div>`
        }
                </div>
                `);


        // Change available Mission colors
        availableMission.find('div').first().css({ 'background' : '#4c9e20'});
        availableMission.find('.mission-details').css({ 'background' : '#111'});

        // Remove arrow icon
        $(this).find('.state-icon-container:first').remove();

        if(availableMissionRow.length > 1) {

            // If same mission have multiple quests.. push all
            availableMissionRow.each(function(i, obj) {
                currentMissionTitle = $(obj).text().trim();

                missionPacksInfo.push({
                    currentMissionTitle,
                    overviewCompleted,
                    overviewTotal,
                    missionTitle,
                    animalName,
                    animalSrc,
                    activatedMission,
                    completedObjectives,
                    totalObjectives,
                    missionObjective,
                    currentReward
                });
            });

        } else {

            missionPacksInfo.push({
                currentMissionTitle,
                overviewCompleted,
                overviewTotal,
                missionTitle,
                animalName,
                animalSrc,
                activatedMission,
                completedObjectives,
                totalObjectives,
                missionObjective,
                currentReward
            });

        }

        let missionCurrentId = availableMission.data('id');
        if (missionCurrentId === undefined) {

            // Mark mission as completed if all quests completed
            /*$(this)
              .find('.mission-animal-name')
              .css({ 'background-color': '#4c9e20', color: '#fff' });
            $(this).addClass('mission-completed');*/


            // Move to bottom completed missions
            let completedBlock = $(this).parent().detach();
            // console.log('block', completedBlock);
            $('.mission-sets-container').append(completedBlock);
        } else {
            /*missionPacksInfo.push({
                block: $(this).parent().detach(),
                completed: overviewCompleted,
                active: activatedMission,
            });*/
        }

    });

    return missionPacksInfo;
}

async function styleFavouritePacks() {

    if(!$('#mission-favourite .mission-info-data').length && $('#missions-packs .set-container .icon-star').length) {
        console.log('Paprastas favorites.. spalvinsime..');
        activateFavouriteStyle();
    }

}

function activateFavouriteStyle() {
    $('.favourite-mission-sets-container .set-container').each(function () {
        console.log(`Favorite row nuspalvinta`);
        // Main Available mission
        let availableMission = $(this).find(
          '.mission-container:not(.completed,.locked)'
        );

        let overviewRaw = $(this).find('.set-info:first .toggle-set-info');
        // console.log('overview', overviewRaw);

        let availableMissionRow = availableMission.find('.mission-row').first();
        // Available mission Title
        let currentMissionTitle = availableMissionRow.text().trim();
        // console.log(`current title`, currentMissionTitle);

        let missionTitle = overviewRaw.ignore('div').text().trim();
        // console.log(`main title`, missionTitle);

        let animalName = missionTitle.replace('Missions', '');
        // console.log(`animal title`, animalName);
        overviewRaw.empty();

        // Confirm completed Overview missions
        let innerMission = $(this).find('.mission-container');
        innerMission.find('.objectives .icon-check').css('color', '#4c9e20');
        innerMission.find('.mission-row .icon-paw').css({'border-radius': '10px', 'background': '#4c9e20'});

        // Main overview counters
        let overviewCompleted = $(this).find(
          '.mission-container.completed'
        ).length;
        let overviewTotal = innerMission.length;
        // console.log(`Total quests: ${overviewCompleted}/${overviewTotal}`);

        // Active mission counter
        let objectivesInfo = availableMission.find('.objectives ol li');
        let totalObjectives = objectivesInfo.length;
        let completedObjectives = objectivesInfo.find('.icon-check').length;
        // console.log(`Inner quests: ${totalObjectives}/${completedObjectives}`);

        // Get Objective text
        let missionText = objectivesInfo
          .find('.icon-check-empty:first')
          .parent()
          .text()
          .trim();
        let missionObjective = missionText.split(' ')[0];
        // console.log(`Current quest: ${missionObjective}`);

        // Get if Mission Activated
        let activatedMission = availableMission.find('.activate button').length;

        // Count all visible missions rewards (gm$)
        let currentReward = parseInt(
          availableMission.find('.rewards ul li').ignore('i').text().trim()
        );

        // Visible missions total rewards (gm$)
        let totalReward = 0;
        innerMission.each(function () {
            let reward = parseInt(
              $(this).find('.rewards ul li').ignore('i').text().trim()
            );
            if (reward) {
                totalReward += reward;
            }
        });

        // Add rewards counter
        let totalGmsTemplate = `<div class="mission-counter">Total gm$: 
                                    <span class="mission-reward">${
          completedObjectives >= totalObjectives
            ? totalReward
            : totalReward + '+'
        }</span>
                                </div>`

        $(this)
          .find('.set-missions')
          .prepend(
            `${totalReward !== 0 ? totalGmsTemplate : '' }`
          );

        // Left info Overview
        let animalSrc = setCompetitionAnimalImage(animalName.trim());
        animalSrc = `https://static.thehunter.com/static/img/statistics/${animalSrc}.png`;

        overviewRaw.append(`
                <div class="mission-info-data">
                    <span class="mission-objective-counter">${overviewCompleted} / ${overviewTotal}</span>
                    <i class="state-icon icon-caret-right"></i>
                    <img class="helperAnimalImage" src="${animalSrc}" style="display: inline-block;" onerror="if (this.src != 'https://static.thehunter.com/static/img/items/256/hunting_horn_01.png') this.src = 'https://static.thehunter.com/static/img/items/256/hunting_horn_01.png';">
                    <span class="mission-animal-name ${
          overviewCompleted > 0 &&
          overviewCompleted < overviewTotal
            ? 'mission-started'
            : ''
        } ${activatedMission ? 'mission-not-active' : ''}
          ${overviewCompleted == overviewTotal ? 'mission-completed' : ''}">${animalName}</span>
                </div>
                `);


        // Right info Overview
        overviewRaw.append(`
                <div class="mission-counter">
                
                <span>${currentMissionTitle}</span>
                    
                    ${
          overviewCompleted < overviewTotal && currentMissionTitle !== ''
            ? `
                        <div class="mission-info-line">
                            <i class="state-icon icon-caret-right"></i>
                            <span class="mission-objective-counter ${
              completedObjectives > 0 &&
              completedObjectives < totalObjectives
                ? 'mission-started'
                : ''
            }">${completedObjectives} / ${totalObjectives}</span>
                            <i class="state-icon icon-caret-right"></i>
                            <span class="mission-objective">${missionObjective}</span>
                            <i class="state-icon icon-caret-right"></i>
                            <span class="mission-reward">${currentReward}</span>
                        </div>`
            : `<div class="mission-info-line"></div>`
        }
                </div>
                `);


        // Change available Mission colors
        availableMission.find('div').first().css({ 'background' : '#4c9e20'});
        availableMission.find('.mission-details').css({ 'background' : '#111'});

        // Remove arrow icon
        $(this).find('.state-icon-container:first').remove();

    });
}

// Add fast scroll buttons
export function addMissionLinks() {
    if (!$('#page-mission-links').length) {

        $('.missions-content').prepend(`
            <div id="page-mission-links"><span style="color: #CCCCCC">Go to:</span> 
                <span data-link="mission-filters" class="btn">Filters</span>
                <span data-link="mission-favourite" class="btn">Favourite</span>
                <span data-link="missions-available-headline" class="btn">Available</span>
                <span data-link="missions-overview" class="btn">Missions</span>
            </div>
        `);
    }
}

// Allow to ignore specific selected element
$.fn.ignore = function (sel) {
    return this.clone()
        .find(sel || '>*')
        .remove()
        .end();
};
