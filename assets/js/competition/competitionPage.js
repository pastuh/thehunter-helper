import {checkElementLoaded, checkPageLoaded} from '../utilities/extension/helpers';

export function activateCompetitionStyle() {
    checkElementLoaded('#competitions-filter', function () {
        if (
            !$('body').find('#competitions-filter .competition-style-animal')
                .length
        ) {
            let elementTarget = $('body').find('#competitions-filter a');
            if (elementTarget.length) {
                elementTarget.each(function () {
                    let target = $(this).find('button');
                    let animalTitle = setCompetitionAnimalImage(target);

                    if (animalTitle.indexOf('multi') >= 0) {
                        $(this).append(
                            `<img class="competition-style-animal" src="https://static.thehunter.com/static/img/items/256/hunting_horn_01.png">`
                        );
                    } else {
                        $(this).append(
                            `<img class="competition-style-animal" src="https://static.thehunter.com/static/img/statistics/${animalTitle}.png">`
                        );
                    }

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

export function setCompetitionAnimalImage(title) {
    let animalTitle = title;

    if (typeof animalTitle === 'object') {
        animalTitle = title.attr('data-name');
    }

    if (animalTitle === 'Roe-bit') {
        animalTitle = 'roebit';
    } else {
        animalTitle = animalTitle.replace(/\s+|-/g, '_').toLowerCase();
    }

    if (animalTitle.indexOf('(typical') >= 0) {
        animalTitle = animalTitle.replace(/_\(typical\)/g, '');
    }

    if (animalTitle.indexOf('non_typical') >= 0) {
        animalTitle = animalTitle.replace(/\(|\)/g, '');
        return animalTitle;
    }

    if (animalTitle.indexOf('grey_wolf') >= 0) {
        animalTitle = animalTitle.replace(/grey_/g, '');
        return animalTitle;
    }

    if (animalTitle.indexOf('eurasian_lynx') >= 0) {
        animalTitle = animalTitle.replace(/eurasian_lynx/g, 'lynx_eurasian');
        return animalTitle;
    }

    if (animalTitle.indexOf('northern_pintail') >= 0) {
        animalTitle = animalTitle.replace(/northern_pintail/g, 'pintail');
        return animalTitle;
    }

    if (animalTitle.indexOf('rock_ptarmigan') >= 0) {
        animalTitle = animalTitle.replace(/rock_ptarmigan/g, 'ptarmigan_rock');
        return animalTitle;
    }

    if (animalTitle.indexOf('willow_ptarmigan') >= 0) {
        animalTitle = animalTitle.replace(
            /willow_ptarmigan/g,
            'ptarmigan_willow'
        );
        return animalTitle;
    }

    if (animalTitle.indexOf('white_tailed_ptarmigan') >= 0) {
        animalTitle = animalTitle.replace(
            /white_tailed_ptarmigan/g,
            'ptarmigan_white_tailed'
        );
        return animalTitle;
    }
    return animalTitle;
}

export function showActiveCompetitionIndicator() {

    checkPageLoaded(function () {
        let enrolledList = $('#enrolled-competitions-region .competitions-table-rows tr td');
        let enrolledTags = enrolledList.find('.species-tag');

        let allCompetitions = $('#competitions-filter button');

        if (enrolledTags.length > 0) {
            allCompetitions.each(function () {
                let target = $(this);
                let title = $(this)[0].childNodes[0].nodeValue.trim();

                let currentCount = target.find('.filter-amount');
                currentCount.removeClass('animalEnrolled_counter');
                console.log(`color gray`);

                enrolledTags.each(function () {
                    if ($(this).text() === title) {
                        console.log(`found animal`, title);
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