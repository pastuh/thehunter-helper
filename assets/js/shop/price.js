import { checkElementLoaded } from '../utilities/extension/helpers';

export function adjustNotBuyable(element) {

    checkElementLoaded('.store-list', function () {

        let button;
        let itemWithQuantity = element.find('.item-price .you-own');

        // IF not exist disabled button..
        if(element.find('.disabledBuyButton').length < 1) {
            if(itemWithQuantity.length > 0) {
                console.log(`adding disabled class`);
                element.find('.inlineStoreBuy').addClass('disabledBuyButton');
            }
        }

        // Check if price not hidden
        if(element.find('.hide-price').length < 1) {
            button = element.find('button');

            // IF exist already purchased item
            if (button.hasClass('disabled') && itemWithQuantity.length > 0) {
                console.log(`adding already purchased..`);
                button.text('Already purchased');
                button.attr('title', `You already own this item. Can't purchase more`);
                button.parent().find('.item-price-container').addClass('hide-price');
            }

            // IF exist not purchasable items
            if (button.hasClass('disabled') && itemWithQuantity.length < 1) {
                // console.log(`not allowed to purchase..`);
                button.text('Purchase is disabled');
                button.attr('title', `Item Not buyable, disabled by game administrators`);
                button.parent().find('.item-price-container').addClass('hide-price');
            }

        }

    });

}

export function showSalePrice() {
    console.log(`show sale price..`);
    checkItemSale();

    $('#store-sidebar').on('click', function () {
        checkItemSale();
    });
}

export function checkItemSale() {
    if ($('#store-sidebar .cat50.selected').length === 0) {
        checkElementLoaded('.store-list', function () {
            $('.store-pagination a').on('click', function () {
                checkItemSale();
            });

            $('.item').each(function () {
                if ($(this).is(':visible')) {
                    let mainElement = $(this);

                    adjustNotBuyable(mainElement);

                    mainElement
                        .find('.sale')
                        .closest('.item-inner')
                        .each(function () {
                            //show discount in %
                            if (
                                $(this).find('.item-price .discount-price')
                                    .length > 0 &&
                                $(this).find('.calculated-info').length < 1
                            ) {
                                let oldPrice = $(this)
                                    .find('.item-price .old-price')
                                    .text()
                                    .match(/\d+/)[0];
                                let discountPrice = $(this)
                                    .find('.item-price .discount-price')
                                    .text()
                                    .match(/\d+/)[0];
/*                                $(this)
                                    .append(
                                        `<span class="calculated-info">-${(
                                            ((oldPrice - discountPrice) /
                                                oldPrice) *
                                            100
                                        ).toFixed(0)}%</span>`
                                    );*/
                                $(this).find('.banner-inner').text(`-${(
                                    ((oldPrice - discountPrice) /
                                        oldPrice) *
                                    100
                                ).toFixed(0)}%`);
                            }
                        });
                }
            });
        });
    }
}
