import { speciesIdToSlug } from '../data/speciesIdToSlug';

const LOCALIZED_CACHE_KEY = 'hunterHelper_speciesNameToSlug_v4';
const STATISTICS_IMAGE_BASE =
    'https://static.thehunter.com/static/img/statistics';
export const MULTISPECIES_SPECIES_ID = '100';
export const HUNTING_HORN_IMAGE_URL =
    'https://static.thehunter.com/static/img/items/256/hunting_horn_01.png';

let localizedNameToSlug = {};

loadLocalizedSpeciesCache();

export function slugFromEnglishName(name) {
    if (!name || typeof name !== 'string') {
        return '';
    }

    let animalTitle = name.trim();

    if (/multi\s*species/i.test(animalTitle)) {
        return 'multispecies';
    }

    if (animalTitle === 'Roe-bit') {
        return 'roebit';
    }

    animalTitle = animalTitle.replace(/\s+|-/g, '_').toLowerCase();

    if (animalTitle.indexOf('(typical') >= 0) {
        animalTitle = animalTitle.replace(/_\(typical\)/g, '');
    }

    if (animalTitle.indexOf('non_typical') >= 0) {
        animalTitle = animalTitle.replace(/\(|\)/g, '');
        return animalTitle;
    }

    if (animalTitle.indexOf('grey_wolf') >= 0) {
        return animalTitle.replace(/grey_/g, '');
    }

    if (animalTitle.indexOf('eurasian_lynx') >= 0) {
        return animalTitle.replace(/eurasian_lynx/g, 'lynx_eurasian');
    }

    if (animalTitle.indexOf('northern_pintail') >= 0) {
        return animalTitle.replace(/northern_pintail/g, 'pintail');
    }

    if (animalTitle.indexOf('rock_ptarmigan') >= 0) {
        return animalTitle.replace(/rock_ptarmigan/g, 'ptarmigan_rock');
    }

    if (animalTitle.indexOf('willow_ptarmigan') >= 0) {
        return animalTitle.replace(/willow_ptarmigan/g, 'ptarmigan_willow');
    }

    if (animalTitle.indexOf('white_tailed_ptarmigan') >= 0) {
        return animalTitle.replace(
            /white_tailed_ptarmigan/g,
            'ptarmigan_white_tailed'
        );
    }

    if (animalTitle === 'duck') {
        return 'mallard';
    }

    if (animalTitle === 'ptarmigan') {
        return 'ptarmigan_willow';
    }

    return animalTitle;
}

export function getPageLocale() {
    const scripts = document.getElementsByTagName('script');

    for (let i = 0; i < scripts.length; i++) {
        const text = scripts[i].textContent || '';

        const selectedMatch = text.match(/selectedLocale:\s*"([^"]+)"/);
        if (selectedMatch) {
            return selectedMatch[1];
        }

        const userMatch = text.match(/"locale":"([^"]+)"/);
        if (userMatch) {
            return userMatch[1];
        }
    }

    return 'en_US';
}

export function getSlugBySpeciesId(speciesId) {
    if (speciesId === undefined || speciesId === null || speciesId === '') {
        return '';
    }

    return speciesIdToSlug[String(speciesId)] || '';
}

export function augmentSpeciesMapFromApi(competitions) {
    if (!Array.isArray(competitions)) {
        return;
    }

    const speciesRule = /Species:\s*([A-Za-z][^\n]+?)(?:\s+Reserves:|\s+Description)/;

    competitions.forEach((competition) => {
        const speciesIds = competition?.type?.species;
        const rules = competition?.type?.rules;

        if (!Array.isArray(speciesIds) || speciesIds.length !== 1 || !rules) {
            return;
        }

        const match = rules.match(speciesRule);
        if (!match) {
            return;
        }

        const id = String(speciesIds[0]);
        if (!speciesIdToSlug[id]) {
            speciesIdToSlug[id] = slugFromEnglishName(match[1].trim());
        }
    });
}

export function loadLocalizedSpeciesCache() {
    try {
        const cached = sessionStorage.getItem(LOCALIZED_CACHE_KEY);
        if (cached) {
            localizedNameToSlug = {
                ...localizedNameToSlug,
                ...JSON.parse(cached),
            };
        }
    } catch (error) {
        console.error(error);
    }
}

export function saveLocalizedSpeciesCache() {
    try {
        sessionStorage.setItem(
            LOCALIZED_CACHE_KEY,
            JSON.stringify(localizedNameToSlug)
        );
    } catch (error) {
        console.error(error);
    }
}

export function buildLocalizedSpeciesMap() {
    $('#competitions-filter button').each(function () {
        const speciesId = $(this).attr('data-id');
        const localizedName = $(this).attr('data-name');
        const slug = getSlugBySpeciesId(speciesId);

        if (localizedName && slug) {
            localizedNameToSlug[localizedName] = slug;
        }
    });

    saveLocalizedSpeciesCache();
}

export function getSpeciesImageSlug(input) {
    let speciesId;
    let localizedName;

    if (input && typeof input === 'object' && typeof input.attr === 'function') {
        speciesId = input.attr('data-id');
        localizedName = input.attr('data-name');
    } else if (typeof input === 'string') {
        localizedName = input.trim();
    }

    const slugFromId = getSlugBySpeciesId(speciesId);
    if (slugFromId) {
        return slugFromId;
    }

    if (localizedName && localizedNameToSlug[localizedName]) {
        return localizedNameToSlug[localizedName];
    }

    if (localizedName && getPageLocale() === 'en_US') {
        return slugFromEnglishName(localizedName);
    }

    return '';
}

export function isMultispeciesSlug(slug) {
    return slug === 'multispecies';
}

export function isMultispeciesInput(input) {
    if (input && typeof input === 'object' && typeof input.attr === 'function') {
        return String(input.attr('data-id')) === MULTISPECIES_SPECIES_ID;
    }

    return false;
}

export function getStatisticsImageUrl(slug) {
    if (!slug || isMultispeciesSlug(slug)) {
        return '';
    }

    return `${STATISTICS_IMAGE_BASE}/${slug}.png`;
}

export function getSpeciesAvatarUrl(input) {
    if (isMultispeciesInput(input)) {
        return HUNTING_HORN_IMAGE_URL;
    }

    const slug = getSpeciesImageSlug(input);

    if (isMultispeciesSlug(slug)) {
        return HUNTING_HORN_IMAGE_URL;
    }

    if (!slug) {
        return HUNTING_HORN_IMAGE_URL;
    }

    return getStatisticsImageUrl(slug);
}

export function setCompetitionAnimalImage(input) {
    return getSpeciesImageSlug(input);
}
