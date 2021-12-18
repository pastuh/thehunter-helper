import {addOptionsCheckbox, checkElementLoaded} from '../../utilities/extension/helpers';
import { showMissingAmmo } from '../ammo/ammoPage';

export function activateAmmoCalculator() {
    if(!$('.single-functions-activator').length) {
        console.log(`Single functions activator..`);

        $('.page-title').after(`<div class="single-functions-activator"></div>`);

        $('#store-sidebar').on('click', function (e) {
            showMissingAmmo(e);
        });
    }
}

export function addOwnedInteractionCheckbox() {
    console.log(`Adding ownedz block..`);
    let description = `<p>Already purchased items in store will be hidden.<br> (If at least 1 quantity exist)</p>`;

    addOptionsCheckbox('ownedItemsHidden', 'option-owned', 'Hide owned items', description, true);

    $('#ownedItemsHidden').on('change', function (e) {
        hideOwnedItems(e);
    });
}

export function checkHideOwnedItems() {
    checkElementLoaded('#ownedItemsHidden', function () {
        getOwnedItemsIsHidden()
            .then((result) => {
                $('#ownedItemsHidden').prop('checked', result);
                return result;
            })
            .then((data) => {
                console.log(`owned info..`, data);
                // Not for bundle
                if ($('#store-sidebar .cat50.selected').length === 0) {
                    setOwnedItemsVisibility(data);
                } else {
                    setCounterText($('#ownedItemsHidden'), ``);
                }
            });
    });
}

export function hideOwnedItems(e) {
    console.log(`hidding owned items.. with checkbox`);
    const checkbox = $(e.target);

    if (checkbox.is(':checked')) {
        console.log(`setting to is checked`);
        chrome.storage.local.set(
            {
                ownedItemsIsHidden: true,
            },
            function () {
                checkbox.prop('checked', true);
            }
        );

        checkElementLoaded('.store-list', function () {
            setOwnedItemsVisibility(true);
        });
    } else {
        console.log(`setting to not checked`);

        chrome.storage.local.set(
            {
                ownedItemsIsHidden: false,
            },
            function () {
                checkbox.prop('checked', false);
            }
        );

        checkElementLoaded('.store-list', function () {
            setOwnedItemsVisibility(false);
        });
    }
}

function getOwnedItemsIsHidden() {
    return new Promise((resolve) => {
        chrome.storage.local.get('ownedItemsIsHidden', function (data) {
            resolve(data.ownedItemsIsHidden);
        });
    });
}

function setOwnedItemsVisibility(needHideItem) {
    let ammoSidebar = $('#store-sidebar .cat10');
    let ammoSelected = ammoSidebar.hasClass('selected');

    // Mark AMMO sidebar as interactive
    if(ammoSelected) {
        ammoSidebar.parent().find('li a.active').addClass('sidebarBorder');
    }

    if (needHideItem && !ammoSelected) {
        console.log(`checking for hidden items`);
        $('.store-pagination a').on('click', function () {
            console.log(`owned checker activated.`);
            checkHideOwnedItems();
        });

        let totalCounter = 0;
        let hiddenCounter = 0;

        $('.item').each(function () {
            totalCounter += 1;

            //hide if owned
            if ($(this).find('.you-own').length) {
                hiddenCounter += 1;
                $(this).hide();
            }

            //hide if disabled
            let $disabled = $(this).find('button');

            if (
                $(this).find('.you-own').length < 1 &&
                $disabled.hasClass('disabled')
            ) {
                hiddenCounter += 1;
                $(this).hide();
            }
        });

        if(hiddenCounter !== 0 && totalCounter !== 0) {
            setCounterText(
              $('#ownedItemsHidden'),
              `${hiddenCounter}/${totalCounter}`
            );
        }
    } else {
        setCounterText($('#ownedItemsHidden'), ``);
    }
}

export function setCounterText(element, value) {
    element.closest('.store-info-text').find('.switchCounter').text(value);
}
