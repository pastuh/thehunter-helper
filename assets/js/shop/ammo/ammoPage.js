export function showMissingAmmo(e) {
    let $menu_button = $(e.target);

    if ($menu_button.text().indexOf('Ammo') >= 0) {
        if ($menu_button.hasClass('active')) {
            $('.cat10').append(
                `<span class="ammo-info-text info-position">Checking..</span>`
            );

            let my_id = document.documentElement.innerHTML.match(
                /user_id\s?:\s?\"(\d+)\"/
            );
            if (my_id[1]) {
                checkAmmoStatus(my_id[1], $menu_button);
            }
        }
    }
}

function hideInfoText(elementName) {
    let targetName = $(elementName);
    $(targetName).fadeTo('slow', 0.01, function () {
        $(targetName).remove();
    });
}

function checkAmmoStatus(id, $menu_button) {
    getAmmos(id)
        .then((data) => getBullets(data))
        .then((data) => showAmmoCount(data, $menu_button));
}

async function getAmmos(id) {
    let response = await fetch(
        `https://api.thehunter.com/v1/Inventory/list?user_id=${id}`
    );
    return await response.json();
}

async function getBullets(data) {
    return data.filter((data) => data.item.group === 3);
}

async function showAmmoCount(data, $menu_button) {
    if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            let ammoId = $('.item').find(`[data-item-id='${data[i].item.id}']`);
            if (ammoId) {
                $('.item button').addClass('disabledBuyButton');

                let $ammoTarget = ammoId.parent();
                let currentAmmo = ammoId
                    .parent()
                    .find('.you-own')
                    .text()
                    .match(/\d+/);
                let missingAmmo =
                    data[i].item.group * data[i].item.units.count - currentAmmo;

                if (missingAmmo > data[i].item.units.count) {
                    // Change position
                    let lowAmmoElement = $ammoTarget.parent().detach();
                    $('#store-category-children-view').prepend(lowAmmoElement);

                    // Show missing ammo count
                    $ammoTarget
                        .find('.item-price')
                        .append(
                            `<span class="calculated-info">x${Math.floor(
                                missingAmmo / data[i].item.units.count
                            )}</span>`
                        );

                    // Additional marking
                    $ammoTarget.find('button').addClass('newBuyButton');
                }
            }
        }
    }
    $menu_button.css('background', '#f9560d');
    hideInfoText('.ammo-info-text');
}
