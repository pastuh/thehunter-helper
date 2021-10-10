import { checkPageLoaded } from '../utilities/extension/helpers';

export function fixScoresheetImage() {
    checkPageLoaded(function () {
        if (!$('#scorecontent').length) {
            let $main = $('body');
            if ($main.length) {
                // Wait for ajax content
                let checkExist2 = setInterval(function () {
                    if ($('.scoresheet .clear').length) {
                        clearInterval(checkExist2);

                        // If content exist
                        let target = $('.scoresheet .clear')[1].innerHTML;
                        if (target.length) {
                            const regex = /https.*\\\/\w+\.jpg/gi;
                            const found = target.match(regex);

                            // If photo exist
                            if (found !== null) {
                                const trophyImage = found[0].replace(
                                    /\\\//gi,
                                    '/'
                                );

                                // Add photo after confirm really not exist
                                if (!$('#scorecontent').length) {
                                    $('.infoimage').append(`
                                    <div id="scorecontent"><img src="${trophyImage}"></div>
                                `);
                                }

                                // Nice scroll up
                                $('html, body').animate(
                                    {
                                        scrollTop:
                                            $('.scoresheet-main').offset().top -
                                            60,
                                    },
                                    500
                                );
                            }
                        }
                    }
                }, 100); // check every 100ms
            }
        }
    });
}
