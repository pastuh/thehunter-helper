import { checkElementLoaded } from '../../utilities/extension/helpers';
import { showMissingAmmo } from '../ammo/ammoPage';

export function addOwnedInteractionCheckbox() {
    if (!$('.store-info-text').length) {
        $('.page-title').after(
            `<div class="store-info-text">
                <div>"Hide owned items" 
                    <div class="help-tip"><p>Already purchased items will be hidden.<br> (If at least 1 quantity exist)</p></div>
                </div>
                <div class="onoffswitch">
                    <input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="ownedItemsHidden" tabindex="0">
                    <label class="onoffswitch-label" for="ownedItemsHidden">
                        <span class="onoffswitch-inner"></span>
                        <span class="onoffswitch-switch"></span>
                    </label>
                </div>
                <span class="switchCounter"></span>
            </div>`
        );

        $('#ownedItemsHidden').on('change', function (e) {
            hideOwnedItems(e);
        });
        $('#store-sidebar').on('click', function (e) {
            showMissingAmmo(e);
        });
    }
}

export function checkHideOwnedItems() {
    checkElementLoaded('#ownedItemsHidden', function () {
        getOwnedItemsIsHidden()
            .then((result) => {
                $('#ownedItemsHidden').prop('checked', result);
                return result;
            })
            .then((data) => {
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

        setCounterText(
            $('#ownedItemsHidden'),
            `${hiddenCounter}/${totalCounter}`
        );
    } else {
        setCounterText($('#ownedItemsHidden'), ``);
    }
}

function setCounterText(element, value) {
    element.closest('.store-info-text').find('.switchCounter').text(value);
}
