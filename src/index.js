/* Parsing CSS for Utility CSS*/
import observer from '@cocreate/observer'
import { logger } from '@cocreate/utils'
import './css/avatar.css'
import './css/badge.css'
import './css/box-shadow.css'
import './css/button.css'
import './css/card.css'
import './css/checkbox.css'
import './css/core.css'
import './css/dropdown.css'
import './css/flip-item.css'
import './css/menu-icon.css'
import './css/navbar.css'
import './css/overlay-content.css'
import './css/progressbar.css'
import './css/scroll.css'

let console = logger('all');

const themes = ["light", "dark"];
const mediaRangeNames = ["xs", "sm", "md", "lg", "xl"];
const ranges = {
    xs: [0, 575],
    sm: [576, 768],
    md: [769, 992],
    lg: [993, 1200],
    xl: [1201, 0],

};
const rangesArray = Object.values(ranges);

let selectorList = new Map();

let parsedCSS = [];
let tempStyleList = [];
let concatCSS = [];
let styleElSheet;
let classList = [];

let newCSS = [];
let themeCSS = { dark: [], light: [] };

let hasChange = false;

function init() {
    if (document.querySelector('link[data-parse="false"]'))
        return;
    
    let styleEl = document.createElement("style");
    styleEl.setAttribute('component', 'CoCreateCss')
    document.head.appendChild(styleEl);
    styleElSheet = styleEl.sheet;

    let elements = document.querySelectorAll("[class]");
    initElements(elements);

    parseStyleSheets();

    // if (document.querySelector('link[data-save="true"]'))
    //     save(hasChange);
        
    observerInit();
}

function initElements (elements) {
    for(let element of elements)
        initElement(element);
    addNewRules();
    // save(hasChange)
}

function initElement(element) {
    parseClassList(element.classList)
    parseCSSForTheme();
    if (element.hasAttribute("className")) {
        let rule = "." + element.getAttribute("className") + " { " + element.getAttribute("class").replace(/ /g, "; ").replace(/:/g, ": ") + "; }";
        tempStyleList.push(rule);
    }
}

function parseClassList(classList) {
    let re = /.+:.+/;
    let re_theme = /.+:.+:.+/;
    let hasChanged = false;
    for (let classname of classList) {
        if (re_theme.exec(classname)) {
            makeRuleForTheme(classname);
        }
        else if (re.exec(classname)) {
            if (!selectorList.has(classname)) {
                let re_at = /.+@.+/;
                if (re_at.exec(classname)) {
                    let parts = classname.split("@");
                    let main_rule = createRule(classname);

                    for (let i = 1; i < parts.length; i++) {
                        let range_num = mediaRangeNames.indexOf(parts[i]);
                        let range = []
                        if (range_num != -1) range = rangesArray[range_num];
                        else {
                            let customRange = parts[i].split('-');
                            range = customRange.map(c => Number.parseInt(c))
                        }
                        let prefix = "@media screen";
                        if (range[0] != 0) {
                            prefix += " and (min-width:" + range[0] + "px)";
                        }
                        if (range[1] != 0) {
                            prefix += " and (max-width:" + range[1] + "px)";
                        }
                        let rule = prefix + " {  " + main_rule + "}";
                        tempStyleList.push(rule)
                        selectorList.set(classname, true);
                        hasChanged = true;

                    }
                }
                else {
                    let rule = createRule(classname);
                    tempStyleList.push(rule)
                    selectorList.set(classname, true);
                    hasChanged = true;
                }
            }
        }
    }
    return hasChanged;
}

function addNewRules() {
    for (let i = 0, len = tempStyleList.length; i < len; i++) {
        let rule = tempStyleList[i];

        let low = 0,
            high = parsedCSS.length;
        while (low < high) {
            let index = (low + high) >>> 1;
            let midItem = parsedCSS[index];
            if (rule < midItem)
                high = index;
            else
                low = index + 1;

        }

        if (low > styleElSheet.cssRules.length) low = styleElSheet.cssRules.length;
        styleElSheet.insertRule(rule, low);
        parsedCSS.splice(low, 0, rule);
    }

    tempStyleList = []
}

function parseStyleSheets() {
    let stylesheetCSS = [];
    let hasChange = true;
    let styleIndex = -1;
    let getValidLinkTag = false;

    try {
        for (let stylesheet of document.styleSheets) {
            styleIndex++;
            if (stylesheet.ownerNode.hasAttribute('data-save')) {
                getValidLinkTag = true;
                break;
            }
        }

        if (getValidLinkTag) {
            let myRules = document.styleSheets[styleIndex].cssRules; // Returns a CSSRuleList

            for (let rule of myRules) {
                stylesheetCSS.push(rule.cssText.replace(/\\n/g, ''));
            }
        }
        else
            hasChange = false;
    }
    catch (err) {
        hasChange = false;
        console.error(err)
    }
    finally {
        console.log('stylesheetCSS', stylesheetCSS);
        console.log('parsedCss', parsedCSS)

        const onlyUnique = (value, index, self) => {
            return self.indexOf(value) === index;
        }

        const diff = (a, b) => {
            return a.filter(item => b.indexOf(item) === -1);
        }

        concatCSS = parsedCSS.concat(stylesheetCSS).filter(onlyUnique);
        newCSS = [...diff(parsedCSS, stylesheetCSS)];

        console.log('newCss', newCSS);
        console.log("concatCSS", concatCSS)

        for (let i = 0; i < concatCSS.length; i++) {
            styleElSheet.insertRule(concatCSS[i])
        }
        concatCSS.sort();
    }
    return hasChange;
}


function save(hasChange) {
    if (hasChange) {
    	let link = document.querySelector('[data-save=true][collection][document_id][name]')
    	if (link) { 
        	var data = [{
        		element: link,
        		value: concatCSS.join('\r\n'),
        	}];
        	CoCreate.crud.save(data)
    	}
    }
}

// const addThemeClassList = (element) => {
//     classList = [];
//     getAllChildElements(element);
//     makeParsingListForTheme(classList);
// }

// const getAllChildElements = (element) => {

//     if (element.hasChildNodes()) {
//         let children = element.childNodes;

//         for (let i = 0; i < children.length; i++) {
//             if (children[i].nodeName != '#text') {
//                 if (children[i].hasAttribute('class'))
//                     classList.push(children[i].className);
//                 getAllChildElements(children[i]);
//             }
//         }
//     }
// }

// const makeParsingListForTheme = (classLists) => {
//     for (let classname of classLists) {
//         makeRuleForTheme(classname);
//     }
// }

const makeRuleForTheme = (className) => {
    let style, value, theme;
    [style, value, theme] = className.split(':');
    if (theme == 'dark' || theme == 'light') {
        let rule = `[theme="${theme}"] .${style}\\:${value}\\:${theme}{${style}:${value};}`;
        let reverseRule = `html:not([theme="${themes[1 - themes.indexOf(theme)]}"]) *.${style}\\:${value}\\:${theme}{${style}:${value};}`;
        tempStyleList.push(rule);
        themeCSS[theme].push(reverseRule);
        return rule;
    }
}


const parseCSSForTheme = () => {
    let initial;
    if (themeCSS.dark.length) {
        initial = "@media (prefers-color-scheme: dark) {"
        for (let c of themeCSS.dark) {
            initial += c + "\n";
        }
        initial += "}";
        tempStyleList.push(initial);
        themeCSS.dark = [];
    }
    if (themeCSS.light.length) {
        initial = "@media (prefers-color-scheme: light) {"
        for (let c of themeCSS.light) {
            initial += c + "\n";
        }
        initial += "}";
        tempStyleList.push(initial);
        themeCSS.light = [];
    }

}

const createRule = (classname) => {
    let res = classname.split(":");
    let rule = "";
    let suffix = res[1]
        .replace(/\./g, "\\.")
        .replace(/%/g, "\\%")
        .replace(/@/g, "\\@")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
        .replace(/#/g, "\\#")
        .replace(/,/g, "\\,")
        .replace(/!/g, "\\!")
        .replace(/\//g, "\\/")
        .replace(/\"/g, "\\\"")
        .replace(/\'/g, "\\'");
    res[1] = res[1].split("@")[0];
    res[1] = res[1].replace(/_/g, " ");
    if (res.length > 2) {
        let pseudo = [];
        for (let i = 0; i < res.length - 2; i++) {
            suffix += "\\:" + res[2 + i];
            pseudo.push(":" + res[2 + i]);
        }
        let clsname = "." + res[0] + "\\:" + suffix;
        rule += clsname + pseudo[0];
        for (let i = 1; i < pseudo.length; i++) {
            rule += ", " + clsname + pseudo[i];
        }
        rule += `{${res[0]}:${res[1]}}`;
    }
    else {
        rule = `.${res[0]}\\:${suffix} { ${res[0]}: ${res[1]}; }`;
    }
    return rule;
}

const observerInit = () => {
    observer.init({
        name: "ccCss",
        observe: ['childList'],
        target: '[class]',
        callback: mutation => {
            initElements(mutation.addedNodes);
        }
    })
    observer.init({
        name: "ccCss",
        observe: ["attributes"],
        attributeName: ["class", "className"],
        callback: mutation => {
            initElements([mutation.target])            
        }
    })
}

init();

export default {initElements}
