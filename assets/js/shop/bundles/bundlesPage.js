// If background found bundles
import {
    checkElementLoaded,
    globalLocInfo,
} from '../../utilities/extension/helpers';
import { checkHideOwnedItems } from '../owned/ownedPage';

export function calculateBundle() {
    checkElementLoaded('.store-list', function () {
        // Check if bundle menu button selected
        if ($('#store-sidebar .cat50.selected').length === 1) {
            console.log(`bundle tab is active`);
            // If not exist any old info.. add
            if (!$('.calculated-info').length && $('.view-details').length) {
                console.log(`calculations not exist`);
                if (typeof globalLocInfo !== 'object') {
                    globalLocInfo = JSON.parse(
                        localStorage.getItem('jStorage')
                    );
                }

                let elementData = [];

                let bundleData = globalLocInfo.bundles;
                bundleData.forEach((item) => {
                    elementData.push({
                        id: item.id,
                        discount: Math.floor(item.discount.discount * 100),
                        oldPrice: item.value,
                    });
                });

                setBundleInfo(elementData);
            }
        }
    });
}

function setBundleInfo(elementData) {
    console.log(`auto adding bundle info`);
    $('.store-pagination a').on('click', function () {
        console.log(`bundle checker activated.`);
        calculateBundle();
    });

    $('.item').each(function () {
        const id = $(this).find('.view-details').data('bundle-id');

        const info = elementData.find((el) => {
            if (el.id === id) {
                return el;
            }
        });

        $(this)
            .find('.item-price .price')
            .before(`<span class="old-price">${info.oldPrice} > </span>`);

        $(this)
            .find('.item-price')
            .append(
                `<span class="calculated-info">-${info.discount.toFixed(
                    0
                )}%</span>`
            );
    });
}
