import { checkElementLoaded } from '../utilities/extension/helpers';

export function showSalePrice() {
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
                                $(this)
                                    .find('.item-price')
                                    .append(
                                        `<span class="calculated-info">-${(
                                            ((oldPrice - discountPrice) /
                                                oldPrice) *
                                            100
                                        ).toFixed(0)}%</span>`
                                    );
                            }
                        });
                }
            });
        });
    }
}
