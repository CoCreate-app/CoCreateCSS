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

let styleEl = document.createElement("style");
let selectorList = new Map();

let parsedCSS = [];
let tempStyleList = [];
let concatCSS = [];
let styleElSheet;
let classList = [];

let newCSS = [];
let themeCSS = { dark: [], light: [] };
// event system
let eventCallback = {};
let details = {};

const on = (event, callback) => {
    if (details[event])
        callback(parsedCSS);
    eventCallback[event] = callback
}
let hasChange = false;

function init() {
    if (document.querySelector('link[data-parse="false"]') || document.querySelector('link[onload="false"]'))
        return;
    styleEl.setAttribute('component', 'CoCreateCss')
    document.head.appendChild(styleEl);
    styleElSheet = styleEl.sheet;

    // 3 lines events system
    if (eventCallback.parse)
        eventCallback.parse()
    details.parse = true;

    classQuery(document)
    parseCSSForTheme();
    classNameQuery(document);

    parseStyleSheets();

    if (document.querySelector('link[data-save="true"]'))
        saveCss(hasChange);
        
    observerInit();
}

function initElement(element) {
    classElement(element)
    parseCSSForTheme();
    classNameElement(element);
}

function classQuery (container) {
    let elements = container.querySelectorAll("[class]");
    classElements(elements)
}
function classElements (elements) {
    for (let element of elements)
        classElement (element)    
}
function classElement (element) {
    parseClassList(element.classList)
}

function classNameQuery (container) {
    let elements = document.querySelectorAll("[className]");
    classNameElements(elements)
}
function classNameElements (elements) {
    for (let element of elements)
        classNameElement (element)    
}
function classNameElement (element) {
    if (element.hasAttribute("class")) {
        let rule = "." + element.getAttribute("className") + " { " + element.getAttribute("class").replace(/ /g, "; ").replace(/:/g, ": ") + "; }";
        tempStyleList.push(rule);
    }
}

const parseStyleSheets = () => {
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

        let temp = [];
        for (let i = 0; i < concatCSS.length; i++) {
            if (temp.indexOf(concatCSS[i]) === -1)
                temp.push(concatCSS[i]);
        }

        concatCSS = temp;

        for (let i = 0; i < concatCSS.length; i++) {
            if (Object.keys(stylesheetCSS).length) {
                if (stylesheetCSS.indexOf(concatCSS[i]) === -1)
                    styleElSheet.insertRule(concatCSS[i])
            }
            else
                styleElSheet.insertRule(concatCSS[i])
        }
        concatCSS.sort();
    }
    return hasChange;
}

const saveCss = (hasChange) => {
    console.log("hasChange", hasChange)
    if (hasChange) {
        console.log('cssString', concatCSS.join('\r\n'))
        window.dispatchEvent(new CustomEvent("newCoCreateCssStyles", {
            detail: {
                isOnload: true,
                styleList: concatCSS.join('\r\n')
            },
        }));
    }
    else {
        console.log('cssString after Concat', concatCSS.join('\r\n'))
    }
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
                    addNewRule();
                }
            }
        }
    }

    return hasChanged;
}

const addNewRule = () => {

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

const getAllChildElements = (element) => {

    if (element.hasChildNodes()) {
        let children = element.childNodes;

        for (let i = 0; i < children.length; i++) {
            if (children[i].nodeName != '#text') {
                if (children[i].hasAttribute('class'))
                    classList.push(children[i].className);
                getAllChildElements(children[i]);
            }
        }
    }
}

const makeParsingListForTheme = (classLists) => {
    for (let classname of classLists) {
        makeRuleForTheme(classname);
    }
}

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

const addThemeClassList = (element) => {
    classList = [];
    getAllChildElements(element);
    makeParsingListForTheme(classList);
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
            initElement(mutation.target);
        }
    })
    observer.init({
        name: "ccCss",
        observe: ["attributes"],
        attributeName: ["class"],
        callback: mutation => {
            classElement(mutation.target)            
        }
    })
    observer.init({
        name: "ccCss",
        observe: ["attributes"],
        attributeName: ["className"],
        callback: mutation => {
            classNameElement(mutation.target)            
        }
    })

}

init();

export default {
    on,
    get parsedCSS() {
        return parsedCSS
    },
    set parsedCSS(value) {
        parsedCSS = value;
        parsedCSS.sort();
    }
}
