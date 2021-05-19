/* Parsing CSS for Utility CSS*/
import observer from '@cocreate/observer'
import './box-shadow.css'
import './CoCreate-avatar.css'
import './CoCreate-badge.css'
import './CoCreate-button.css'
import './CoCreate-card.css'
import './CoCreate-checkbox.css'
import './CoCreate-core.css'
import './CoCreate-dropdown.css'
import './CoCreate-flip-item.css'
import './CoCreate-menu-icon.css'
import './CoCreate-navbar.css'
import './CoCreate-overlay-content.css'
import './CoCreate-progressbar.css'
import './CoCreate-scroll.css'
// import crud from '@cocreate/crud-client'

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

const observerInit = () => {
    styleEl.setAttribute('component', 'CoCreateCss')
    document.head.appendChild(styleEl);
    styleElSheet = styleEl.sheet;

    observer.init({
        name: "ccCss",
        observe: ["attributes", "childList"],
        attributes: ["class"],
        callback: (mutation) => {

            let hasChange = false;
            hasChange = addParsingClassList(mutation.target.classList);

            if (mutation.type == "childList")
                mutation.target.querySelectorAll("*").forEach((el) => {
                    hasChange = addParsingClassList(el.classList) || hasChange;
                });

            addNewRules()

            if (hasChange) {
                console.log('parsedCSS', parsedCSS)
                console.log('cssString', parsedCSS.join('\r\n'))
                window.dispatchEvent(new CustomEvent("newCoCreateCssStyles", {
                    detail: {
                        isOnload: false,
                        styleList: concatCSS
                    },
                }));
            }

        },
    });
}

const getParsedCss = () => {
    let hasChange = false;
    let elements = document.querySelectorAll("[class]");

    for (let element of elements) {
        hasChange = addParsingClassList(element.classList) || hasChange;
    }
    parseCSSForTheme();

    // elements = document.querySelectorAll("[theme]");
    // for (let element of elements) {
    //     addThemeClassList(element)
    // }
    parsedCSS = tempStyleList;
    tempStyleList = [];
    return hasChange;
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
        let rule = '[theme="' + theme + '"] .' + style + '\\:' + value + '\\:' + theme + ' {' + style + ':' + value + ';}'
        tempStyleList.push(rule);
        themeCSS[theme].push(rule);
        return rule;
    }
}

const addThemeClassList = (element) => {
    classList = [];
    getAllChildElements(element);
    makeParsingListForTheme(classList);
}

const getWholeCss = () => {
    let stylesheetCSS = [];
    let hasChange = true;
    let styleIndex = -1;
    let getValidLinkTag = false;

    try {
        let stylesheets = document.querySelectorAll("link[type='text/css']");

        for (let stylesheet of stylesheets) {
            styleIndex++;
            if (stylesheet.hasAttribute('data-save')) {
                getValidLinkTag = true;
                break;
            }
        }

        if (getValidLinkTag) {
            let myRules = document.styleSheets[styleIndex].cssRules; // Returns a CSSRuleList

            for (let rule of myRules) {
                stylesheetCSS.push(rule.cssText);
            }
        } else
            hasChange = false;
    } catch (err) {
        hasChange = false;
        console.error(err)
    } finally {
        console.log('stylesheetCSS', stylesheetCSS);
        console.log('parsedCss', parsedCSS)

        const onlyUnique = (value, index, self) => {
            return self.indexOf(value) === index;
        }

        const diff = (a, b) => {
            return a.filter(item => b.indexOf(item) === -1);
        }

        concatCSS = parsedCSS.concat(stylesheetCSS).filter(onlyUnique);
        newCSS = [...diff(parsedCSS, stylesheetCSS), ...diff(stylesheetCSS, parsedCSS)];

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
            } else
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
                styleList: concatCSS
            },
        }));
    } else {
        console.log('cssString after Concat', concatCSS.join('\r\n'))
    }
}

async function init() {

    observerInit();

    if (document.querySelector('link[data-parse="false"]') || document.querySelector('link[onload="false"]'))
        return;

    let hasChange = false;

    hasChange = getParsedCss();
    hasChange = getWholeCss();

    if (document.querySelector('link[data-save="true"]'))
        saveCss(hasChange);

    // 3 lines events system
    if (eventCallback.parse)
        eventCallback.parse()
    details.parse = true;
}

const addNewRules = () => {

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
        styleElSheet.insertRule(rule, low);
        parsedCSS.splice(low, 0, rule);
    }

    tempStyleList = []
}

const addParsingClassList = (classList) => {
    let re = /.+:.+/;
    let re_theme = /.+:.+:.+/;
    let hasChanged = false;

    for (let classname of classList) {
        if (re_theme.exec(classname)) {
            makeRuleForTheme(classname)
        } else if (re.exec(classname)) {
            if (!selectorList.has(classname)) {
                let re_at = /.+@.+/;
                if (re_at.exec(classname)) {
                    let parts = classname.split("@");
                    let main_rule = parseClass(classname);

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
                        let rule = prefix + "{" + main_rule + ";}";
                        tempStyleList.push(rule)
                        selectorList.set(classname, true);
                        hasChanged = true;

                    }
                } else {
                    let rule = parseClass(classname);
                    tempStyleList.push(rule)
                    selectorList.set(classname, true);
                    hasChanged = true;

                }
            }
        }
    }

    return hasChanged;
}

const parseCSSForTheme = () => {
    let initial;
    if (themeCSS.dark.length) {
        initial = "@media (prefers-color-scheme: dark) {"
        for (let c of themeCSS.dark) {
            initial += c + "\n";
        }
        initial += "}";
    }
    if (themeCSS.light.length) {
        initial = "@media (prefers-color-scheme: light) {"
        for (let c of themeCSS.light) {
            initial += c + "\n";
        }
        initial += "}";
    }
    tempStyleList.push(initial);
}

const parseClass = (classname) => {
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
    } else {
        rule = `.${res[0]}\\:${suffix} { ${res[0]}: ${res[1]}; }`;
    }
    return rule;
}

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

window.addEventListener("load", init);