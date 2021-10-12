export function showMissingAmmo(e) {
    let $menu_button = $(e.target);

    if ($menu_button.text().indexOf('Ammo') >= 0) {
        if ($menu_button.hasClass('active')) {

            let ammoSidebar = $('#store-sidebar .cat10');
            ammoSidebar.append(
                `<span class="ammo-info-text info-position">Checking..</span>`
            );
            // Show as "loading"
            $menu_button.removeClass('sidebarBorder');
            $menu_button.css('background', '#f9560d');


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

        // By default set as purchase allowed
        let button = $('.item button');
        button.addClass('unknownBuyButton');

        for (let i = 0; i < data.length; i++) {
            let ammoId = $('.item').find(`[data-item-id='${data[i].item.id}']`);
            if (ammoId) {
                let $ammoTarget = ammoId.parent();

                // Mark ammo which have quantity
                if($ammoTarget.find('button').hasClass('disabledBuyButton')) {
                    $ammoTarget.find('button').text('---');
                }

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
                        .append(
                            `<span class="calculated-info" title="Recommended number of 'Buy' button clicks">x${Math.floor(
                                missingAmmo / data[i].item.units.count
                            )}</span>`
                        );

                    // Overwrite previous markings and show Buyable ammo
                    $ammoTarget.find('button').addClass('newBuyButton');
                    $ammoTarget.find('button').text('BUY');
                }
            }
        }
    }
    $menu_button.css('background', '');
    $menu_button.removeClass('sidebarBorder');
    $menu_button.addClass('sidebarBorderOn');
    // Hide small sidebar indicator 'Checking..'
    hideInfoText('.ammo-info-text');
}
