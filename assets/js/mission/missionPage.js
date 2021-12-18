import { checkElementLoaded } from '../utilities/extension/helpers';
import {setCompetitionAnimalImage} from "../competition/competitionPage";

export function activateMissions() {
    checkElementLoaded('#page-missions', function () {
        if (!$('.mission-info-data').length) {
            styleOverviewInfo()
                .then((data) => alignOverviews(data))
                .then((data) => sortOverviews(data));
        }
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

async function styleOverviewInfo() {
    let assignedOverviews = [];

    $('.mission-sets-container .set-container').each(function () {
        // Main Available mission
        let availableMission = $(this).find(
            '.mission-container:not(.completed,.locked)'
        );
        let overviewRaw = $(this).find('.set-info:first');

        let availableMissionRow = availableMission.find('.mission-row');

        // Available mission Title
        let currentMissionTitle = availableMissionRow.text().trim();
        // availableMissionRow.html('<i class="icon-angle-down"></i>');

        // Get main Mission name and clear old info
        let missionTitle = overviewRaw.ignore('div').text().trim();
        let animalName = missionTitle.replace('Missions', '');
        overviewRaw.empty();

        // Confirm completed Overview missions
        let innerMission = $(this).find('.mission-container');
        innerMission.find('.objectives .icon-check').css('color', '#4c9e20');
        innerMission.find('.mission-row .icon-star').css('color', '#4c9e20');

        // Main overview counters
        let overviewCompleted = $(this).find(
            '.mission-container.completed'
        ).length;
        let overviewTotal = innerMission.length;

        // Active mission counter
        let objectivesInfo = availableMission.find('.objectives ol li');
        let totalObjectives = objectivesInfo.length;
        let completedObjectives = objectivesInfo.find('.icon-check').length;

        // Get Objective text
        let missionText = objectivesInfo
            .find('.icon-check-empty:first')
            .parent()
            .text()
            .trim();
        let missionObjective = missionText.split(' ')[0];

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

        $(this)
            .find('.set-missions')
            .prepend(
                `<div class="mission-counter">Total gm$: <span class="mission-reward">${
                    completedObjectives >= totalObjectives
                        ? totalReward
                        : totalReward + '+'
                }</span></div>`
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
                    } ${activatedMission ? 'mission-not-active' : ''}">${animalName}</span>
                </div>
                `);
        // Right info Overview
        overviewRaw.append(`
                <div class="mission-counter">
                <span>${currentMissionTitle}</span>
                    
                    ${
                        overviewCompleted < overviewTotal
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

        let missionCurrentId = availableMission.data('id');
        if (missionCurrentId === undefined) {
            $(this)
                .find('.mission-animal-name')
                .css({ 'background-color': '#4c9e20', color: '#fff' });
            $(this).addClass('mission-completed');
            // Move to bottom completed missions
            let completedBlock = $(this).parent().detach();
            $('.mission-sets-container').append(completedBlock);
        } else {
            assignedOverviews.push({
                block: $(this).parent().detach(),
                completed: overviewCompleted,
                active: activatedMission,
            });
        }
    });

    return assignedOverviews;
}

// Allow to ignore specific selected element
$.fn.ignore = function (sel) {
    return this.clone()
        .find(sel || '>*')
        .remove()
        .end();
};
