const hex2rgb = require('hex-rgb');
const { wordsToNumbers } = require('words-to-numbers');
const pluralize = require('pluralize');

const { ELEMENT_SELECTORS } = require('../common/variables');




const hex2rgbCSS = (hex) => {
    const { red, green, blue, alpha } = hex2rgb(hex);
    return `rgb(${red}, ${green}, ${blue}${alpha < 255 ? `, ${parseInt(alpha * 100) / 100}` : ''})`;
}


// Builds class selectors for our react Styled Component classes (ie. accounts for the `-randomString`). 
// You should just be able to type classes as usual
const buildClassSelector = selectors => (
    selectors.replace(/\.([^.[:\s]+)/g, '[class*="$1"]')
);

// ex: Third Button => [ Button, 3 ]
const parseNumberEls = el => {
    if(el.includes('last')) {
        return {
            ordinal: 'last',
            el: el.replace('last ', '')
        }
    } else {
        const parsed = wordsToNumbers(el);
        const numberFound = parsed.match(/\d+/);
        
        if(numberFound) {
            return {
                el: parsed.replace(numberFound[0] + ' ', ''),
                ordinal: parseInt(numberFound[0]),
            };
        } else {
            return {
                el: parsed,
            };
        }
    }
}

// pass a single element or chain (parent => child) as an Array
// to get the selected Cypress element
const getSelector = (elements, { text, singular, showOrdinals } = {}) => {
    if (!Array.isArray(elements))
        elements = [elements];

    // in case it comes in from a parent optional environemnt
    elements = elements.filter(el=>el);

    // for now we apply it to the first ordinal we get
    // ex: third Button in the second Modal will just get the third Button overall
    let firstOrdinal;
    let lastParentSelectors;
    
    let className = elements.reduce((out, elementStr, i) => {
        // ex: Button's => Button
        let element = elementStr.replace('\'s', '');
        
        if(singular)
            element = pluralize.singular(element); // Buttons => Button

        const { ordinal, el} = parseNumberEls(element);

        if (!firstOrdinal && ordinal)
            firstOrdinal = ordinal;
    
        let selectors = ELEMENT_SELECTORS;

        // for now just supports 1 level of nest
        if (out[i - 1])
            selectors = lastParentSelectors;

        const selector = selectors[el];

        if (!selector) {
            const lastParent = elements[i - 1] ? elements[i - 1] + '>' : '';
            throw new Error(`The className was not defined for ${lastParent}${el}`);
        }

        if (selector._default)
            lastParentSelectors = selector;

        // if it's a container
        const className = selector._default ? selector._default : selector;
    
        return [...out, className];
    }, []).join(' ');

    if (text)
        className += `:contains("${text}")`;

    className = buildClassSelector(className);

    return showOrdinals ? { className, firstOrdinal } : className;
};

const getNormalized = (elements, { text, singular } = {}) => {
    const { className, firstOrdinal } = getSelector(elements, { text, singular, showOrdinals: true })
    const el = cy.get(className);

    if(firstOrdinal) {
        if (firstOrdinal === 'last') {
            return el.last();
        } else {
            return el.eq(firstOrdinal - 1);
        }
    }

    return el;
}
module.exports = {
    hex2rgbCSS,
    buildClassSelector,
    parseNumberEls,
    getSelector,
    getNormalized
};