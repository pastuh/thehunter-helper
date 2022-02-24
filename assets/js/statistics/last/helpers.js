export let weaponStatsFormatter = function (row) {
    let data = row.getData();
    return `<img class='helperWeaponImage' src='${data.weapon_image}' title='${data.weapon_title}'>`;
};

export let ammoStatsFormatter = function (row) {
    let data = row.getData();
    return `<img class='helperAmmoImage' src='${data.ammo_image}' title='${data.ammo_title}'>`;
};

export let animalStatsImageFormatter = function (row) {
    let data = row.getData();
    return `<img class='helperAnimalImage' src='${data.image}' title='${data.title}'>`;
};

export let animalStatsImageFormatter2 = function (row) {
    let data = row.getData();
    return `<img class='helperAnimalImage' src='${data.image}'>`;
};

export let scoreStatsFormatter = function (row) {
    let data = row.getData();
    return `<a class="scoreLink" href="https://www.thehunter.com/${data.animal_link}">${data.animal_score}</a>`;
};

export let weaponStatsDiagramFormatter = function (row) {
    let data = row.getData();
    let usedWeaponsList = '';

    data.weapon_src.forEach(function (weaponSrc) {
        usedWeaponsList += `<img class='helperWeaponImage' src='${weaponSrc.source}' title='${weaponSrc.title}'>`;
    });
    usedWeaponsList += `<div class="diagramData">${data.animal_diagram.html()}</div>`;
    return `<div class="weaponBlock">${usedWeaponsList}</div>`;
};

export let taxidermizeFormatter = function (row) {
    let data = row.getData();

    if(typeof data.animal_taxidermize !== 'undefined') {
        let button = data.animal_taxidermize[0];
        return `<div>${button.outerHTML}</div>`;
    } else {
        return `<div><button class="btn btn-primary btn-taxidermize disabled">Check lodge</button></div>`;
    }
};

export let countRows = function (values) {
    return values.length;
};

export let countRowValue = function (values, data) {
    let calc = 0;

    if (values.length >= 2) {
        values.forEach(function (value) {
            calc += parseInt(value);
        });
    }
    return calc;
};

export let countRowAverage = function (values, data) {
    let calc = 0;

    if (values.length >= 2) {
        values.forEach(function (value) {
            calc += parseFloat(value);
        });
        calc = (calc / values.length).toFixed(2);
    }

    return calc;
};

export let hideZeroCount = function (cell) {
    if (cell.getValue() !== 0) {
        return cell.getValue();
    }
};

export let zeroCountColor = function (cell) {
    let value = cell.getValue();

    if (value == '0' || value == '0.00') {
        let cellElement = cell.getElement();
        $(cellElement).css({ color: '#555' });
    }

    return value;
};

// weapons
export let headerWeaponsMenu = function () {
    let menu = [];
    let columns = this.getColumns();

    for (let column of columns) {
        // Header icon
        let icon = document.createElement('i');
        icon.classList.add(
            column.isVisible() ? 'custom-check-select' : 'custom-select'
        );

        // Label
        let label = document.createElement('span');
        let title = document.createElement('span');

        title.textContent = ' ' + column.getDefinition().title;

        if (column.getField() !== 'weapon_title') {
            label.appendChild(icon);
        }
        label.appendChild(title);

        //create menu item
        menu.push({
            label: label,
            action: function (e) {
                //prevent menu closing
                e.stopPropagation();

                //toggle current column visibility
                if (column.getField() !== 'weapon_title') {
                    column.toggle();

                    if (
                        column.getField() === 'distance_feets' ||
                        column.getField() === 'distance_meters'
                    ) {
                        column.setWidth(true);
                    }

                    //change menu item icon
                    if (column.isVisible()) {
                        icon.classList.remove('custom-select');
                        icon.classList.add('custom-check-select');
                    } else {
                        icon.classList.remove('custom-check-select');
                        icon.classList.add('custom-select');
                    }
                }
            },
        });
    }
    return menu;
};

// animals
export let headerStatsMenu = function () {
    let menu = [];
    let columns = this.getColumns();

    for (let column of columns) {
        let icon = document.createElement('i');
        icon.classList.add(
            column.isVisible() ? 'custom-check-select' : 'custom-select'
        );

        let label = document.createElement('span');
        let title = document.createElement('span');

        title.textContent = ' ' + column.getDefinition().title;

        if (column.getField() !== 'image') {
            label.appendChild(icon);
        }
        label.appendChild(title);

        menu.push({
            label: label,
            action: function (e) {
                e.stopPropagation();

                if (column.getField() !== 'image') {
                    column.toggle();

                    if (column.isVisible()) {
                        icon.classList.remove('custom-select');
                        icon.classList.add('custom-check-select');
                    } else {
                        icon.classList.remove('custom-check-select');
                        icon.classList.add('custom-select');
                    }
                }
            },
        });
    }

    return menu;
};

let statsTrophiesSrc = [];

export function addStatsTrophiesSrc() {
    let trophiesList = $('.confirmed-kills .animal');
    trophiesList.each(function (index, element) {
        let trophyTitle = $(element).find('.species').text().toLowerCase();
        let trophySrc = $(element).find('.harvest_image img').attr('src');
        statsTrophiesSrc.push({ title: trophyTitle, src: trophySrc });
    });
}

export function setStatisticsAnimalImage(title) {
    let tableAnimalTitle = title.toLowerCase();
    let animalSrc;

    if (tableAnimalTitle.indexOf('(typical') >= 0) {
        tableAnimalTitle = tableAnimalTitle.replace(/\(typical\)/g, '');
    } else if (tableAnimalTitle.indexOf('(non-') >= 0) {
        tableAnimalTitle = tableAnimalTitle.replace(/\(non-typical\)/g, '');
    }

    statsTrophiesSrc.forEach(function (trophy) {
        let title = trophy.title;
        if (title.indexOf(tableAnimalTitle) >= 0) {
            animalSrc = trophy.src;
            return false;
        }
    });

    if (typeof animalSrc === 'undefined') {
        animalSrc =
            'https://static.thehunter.com/static/img/items/256/hunting_horn_01.png';
    }

    return animalSrc;
}

// Collectables
export let collectableStatsFormatter = function (row) {
    let data = row.getData();
    return `<div class='helperCollectableImage' title='${data.collectable_title}'><span class='helperCollectableImageBg' style='background: ${data.background};'></span></div>`;
};

// Confirmed Kills
let statsWeaponsSrc = [];

export function addStatsWeaponsSrc() {
    let weaponsList = $('#weapons-stats-table .helperWeaponImage');
    weaponsList.each(function (index, element) {
        let elementTitle = $(this).attr('title').toLowerCase();
        let elementSrc = $(this).attr('src');
        statsWeaponsSrc.push({ title: elementTitle, src: elementSrc });
    });
}

export function setStatisticsWeaponImage(title) {
    let tableWeaponTitle = title.toLowerCase();
    let weaponRealSrc;

    statsWeaponsSrc.forEach(function (weapon) {
        let title = weapon.title;
        if (title.indexOf(tableWeaponTitle) >= 0) {
            weaponRealSrc = weapon.src;
            return false;
        }
    });

    if (typeof weaponRealSrc === 'undefined') {
        weaponRealSrc =
            'https://static.thehunter.com/static/img/items/256/binoculars_black.png';
    }

    return weaponRealSrc;
}

// On hover actions
let hunterDiagramExist = false;
$(document)
    .on('mouseenter', '.hunterHelperDiagram', function (e) {
        if (!hunterDiagramExist) {
            let diagramSrc = $(this).find('.diagramData').html();

            if (typeof diagramSrc !== 'undefined') {
                $('body').append(
                    `<div class="hunterDiagram-hover">${diagramSrc}</div>`
                );
                let diagramSize = $('.hunterDiagram-hover').width();

                $('.hunterDiagram-hover').css({
                    top: $(this).parent('.tabulator-row').offset().top,
                    left:
                        $(this).parent('.tabulator-row').offset().left -
                        diagramSize,
                    display: 'block',
                    'z-index': '10',
                });
                hunterDiagramExist = true;
            }
        }
    })
    .on('mouseleave', '.hunterHelperDiagram', function () {
        if (hunterDiagramExist) {
            $('.hunterDiagram-hover').remove();
            hunterDiagramExist = false;
        }
    });

let hunterImgExist = false;
$(document)
    .on('mouseenter', '.hunterHelperTableImage', function (e) {
        if (!hunterImgExist) {
            let imgSrc = $(this).find('img').attr('src');

            if (typeof imgSrc !== 'undefined') {
                $('body').append(
                    `<span class="hunterImg-hover"><img src="${imgSrc}"></span>`
                );
                let imgSize = $('.hunterImg-hover').width();

                $('.hunterImg-hover').css({
                    top: $(this).parent('.tabulator-row').offset().top,
                    left:
                        $(this).parent('.tabulator-row').offset().left -
                        imgSize,
                    display: 'block',
                    'z-index': '10',
                });
                hunterImgExist = true;
            }
        }
    })
    .on('mouseleave', '.hunterHelperTableImage', function () {
        if (hunterImgExist) {
            $('.hunterImg-hover').remove();
            hunterImgExist = false;
        }
    });
