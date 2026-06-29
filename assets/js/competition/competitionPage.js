import {checkElementLoaded, checkPageLoaded} from '../utilities/extension/helpers';
import {
    buildLocalizedSpeciesMap,
    getSpeciesAvatarUrl,
    setCompetitionAnimalImage,
} from '../utilities/speciesImage';

export {setCompetitionAnimalImage};

function getFilterButtonSpeciesName(button) {
    const dataName = $(button).attr('data-name');

    if (dataName) {
        return dataName.trim();
    }

    const textNode = button.childNodes[0];

    if (textNode && textNode.nodeValue) {
        return textNode.nodeValue.trim();
    }

    return $(button).clone().children().remove().end().text().trim();
}

export function activateCompetitionStyle() {
    checkElementLoaded('#competitions-filter', function () {
        if (
            !$('body').find('#competitions-filter .competition-style-animal')
                .length
        ) {
            buildLocalizedSpeciesMap();

            let elementTarget = $('body').find('#competitions-filter a');            if (elementTarget.length) {
                elementTarget.each(function () {
                    let target = $(this).find('button');
                    let animalSrc = getSpeciesAvatarUrl(target);

                    $(this).append(
                        `<img class="competition-style-animal" src="${animalSrc}">`
                    );

                    let targetCount = $(this).find('.filter-amount').css({
                        background: '#ccc',
                        color: '#222',
                        'border-radius': '10px',
                        padding: '0 4px',
                        float: 'right',
                    });

                    if (target.hasClass('active')) {
                        target.addClass('animalEnrolled');
                        //targetCount.css({ background: '#4c9e20' });

                        let targetName = target.attr('data-name');
                        let targetId = target.attr('data-id');
                        $('#competitions-list-region').prepend(
                            `<div class="competition-list-banner" style="position:relative;"><img src="https://static.thehunter.com/static/img/competitions/species-${targetId}.jpg" onerror="javascript:this.src='https://static.thehunter.com/static/img/competitions/species-multispecies.jpg'"><div class="competition-banner-text">${targetName} competitions</div></div>`
                        );
                    }

                    let newCount = targetCount.text().replace(/[\(\)]+/g, '');
                    targetCount.text(newCount);

                    if (newCount === '0') {
                        target.parent().css({ opacity: '0.2' });
                    }
                });
            }
        }
    });
}

export async function getServerCompetitions() {
    try {
        const response = await fetch(`https://api.thehunter.com/v1/Page_content/list_competitions`);
        let result = await response.json();
        return result;
    } catch (error) {
        console.error(error);
    }
}

export function getEnrolledCompetitionsCount() {
    let existingRowsCount;
    let requiredElement = $('#enrolled-competitions-region .competitions-table-rows tr td.comp-image-container');
    let savedElement = $('#enrolled-competitions-region .competitions-table-rows tr .btn-paused')

    if(savedElement.length > 0) {
        existingRowsCount = requiredElement.length + savedElement.length;
    } else {
        existingRowsCount = requiredElement.length;
    }
    return existingRowsCount;
}

export function markActivatedAnimals() {

    checkPageLoaded(function () {
        let enrolledList = $('#enrolled-competitions-region .competitions-table-rows tr td');
        let enrolledTags = enrolledList.find('.species-tag');

        let allCompetitions = $('#competitions-filter button');

        if (enrolledTags.length > 0) {
            allCompetitions.each(function () {
                let target = $(this);
                let title = getFilterButtonSpeciesName(this);

                let currentCount = target.find('.filter-amount');
                currentCount.removeClass('animalEnrolled_counter');

                enrolledTags.each(function () {
                    if ($(this).text() === title) {
                        currentCount.addClass('animalEnrolled_counter');
                        return false;
                    }
                });
            });
        } else {
            allCompetitions.find('.filter-amount').removeClass('animalEnrolled_counter');
        }
    });
}

export function tagSelectedAnimal(element) {
    let selectedTag = $(element.target).text();
    let allCompetitions = $('#competitions-filter button');
    allCompetitions.each(function () {
        let title = getFilterButtonSpeciesName(this);
        if (title === selectedTag) {
            $(this).click();
            return false;
        }
    });
}

export function scrollToClickedCompetition(element) {
    let competitionId = $(element.target).data('cmpid');

    $('html, body').animate({
        scrollTop: $('#page-competitions').offset().top - 100
    }, 150);

    let targetLine = $(`#enrolled-competitions-region tr [data-cmpid="${competitionId}"]`).first().closest('tr');
    let notifyChanges = targetLine
        .css({backgroundColor: '#f9370d'})
        .show()
    setTimeout(function(){
        notifyChanges.css({backgroundColor: ''});
    },750);
}

export function hideIfExistCompetitionActiveButtons() {

    checkElementLoaded('#competitions-list-region .competitions-table-rows', function () {

        if ($('#competitions-list-region .competitions-table-rows .action .btn-leave').length ||
            $('#enrolled-competitions-region .competitions-table-rows .action .btn-paused').length) {

            console.log(`Competitions gets button styles`);

            let enrolledComps = $('#enrolled-competitions-region .competitions-table-rows .btn-join');
            let listedComps = $('#competitions-list-region .competitions-table-rows tr');

            let listEnrolledIds = [];
            enrolledComps.each(function() {
                listEnrolledIds.push($(this).data('cmpid'));
            });

            listedComps.each(function (index, element) {
                let button = $(element).find('.action button');
                let listedCompId = button.data('cmpid');

                if(button.hasClass('btn-leave')) {
                    button.text(`Enrolled`);
                    button.addClass('btn-enrolled');
                    button.removeClass('btn-secondary btn-leave');
                    return;
                }

                if(button.hasClass('btn-join')) {
                    listEnrolledIds.forEach(id => {
                        if(id === listedCompId) {
                            // console.log(`ID found: ${id} and listedId ${listedCompId}, marking inactive..`);
                            button.text(`Paused`);
                            button.addClass('btn-saved paused_competition');
                            button.removeClass('btn-primary btn-join');
                            $(element).find('.first a').addClass('paused_competition');
                        }
                    });
                }
            });

            markActivatedAnimals();
        }
    });
}

export function selectedAnimalIndicatorReset() {
    checkPageLoaded(function () {
        let selectedAnimal = $('#competitions-filter-region button.compSelectSpecies.active');
        if (selectedAnimal) {
            selectedAnimal.removeClass('active');
            let counterColor = selectedAnimal.find('span');
            counterColor.each(item => {
                if (!$(item).hasClass('animalEnrolled_counter')) {
                    $(item).css({'background': '#ccc'});
                }
            })

            $('.competition-list-banner').remove();
        }
    });
}

export function updateTitleAllListedCompetitions() {

    checkElementLoaded('#competitions-filter button', function () {

        let activeTab = $("#competitions-tab-region .nav-tabs li.active").index();
        if(activeTab === 0) {

            let allCompetitions = $('#competitions-filter button');

            if(allCompetitions.length > 0) {

                let totalComps = 0;
                let allAnimalsCounters = allCompetitions.find('.filter-amount');
                allAnimalsCounters.each(function() {
                    totalComps += parseInt($(this).text());
                });

                if(totalComps === 0 || isNaN(totalComps)) {
                    totalComps = '';
                } else {
                    totalComps = ` / ${totalComps}`;
                }

                $('#enrolled-competitions-region h4').find('#globalCompetitions_counter').text(`${totalComps}`);
            }
        }
    });
}

// Impossible to leave Paused competition if upcoming page is open..
export function fixPausedCompetitionLeaveBtn() {

    checkPageLoaded(function() {
        let pausedRows = $('#enrolled-competitions-region tr button.btn-leave.btn-paused');
        let stoppedRows = $('#enrolled-competitions-region tr button.btn-secondary.btn-stop');

        let activeTab = $("#competitions-tab-region .nav-tabs li.active").index();

        if(activeTab === 1 || activeTab === 2) {
            if(pausedRows.length) {
                infoAboutEmptyCompetitionPage();

                pausedRows.addClass('btn-stop');
                pausedRows.removeClass('btn-leave');
                pausedRows.removeClass('btn-paused');

                pausedRows.prev('button.btn-primary').addClass('btn-stop');
                pausedRows.prev('button.btn-primary').removeClass('btn-join');
                pausedRows.prev('button.btn-primary').removeClass('btn-paused');
            }
            if(!stoppedRows.length) {
                infoAboutEmptyCompetitionPage();
            }
        }

        if(activeTab === 0) {
            if(stoppedRows.length) {
                stoppedRows.removeClass('btn-stop');
                stoppedRows.addClass('btn-leave');
                stoppedRows.addClass('btn-paused');

                stoppedRows.prev('button.btn-primary').removeClass('btn-stop');
                stoppedRows.prev('button.btn-primary').addClass('btn-join');
                stoppedRows.prev('button.btn-primary').addClass('btn-paused');
            }
        }
    });
}

export function infoAboutEmptyCompetitionPage() {
    let infoLine = 	$('#enrolled-competitions-region .alert-info');

    if(infoLine.length) {
        infoLine.text(`Missing Active competitions? Choose 'Upcoming competitions' tab. (Need page refresh)`);
    }
}

export function hideIfExistSavedTable() {
    checkPageLoaded(function() {
        let saveTable = $('#competitions-list-region .save_competitions-table');

        if(saveTable.length) {
            saveTable.remove();
        }
    })
}