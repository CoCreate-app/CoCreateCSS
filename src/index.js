import observer from '@cocreate/observer';
import crud from '@cocreate/crud-client';
import './css/avatar.css';
import './css/badge.css';
import './css/box-shadow.css';
import './css/button.css';
import './css/card.css';
import './css/checkbox.css';
import './css/core.css';
import './css/dropdown.css';
import './css/flip-item.css';
import './css/footer.css';
import './css/menu-icon.css';
import './css/navbar.css';
import './css/overlay-content.css';
import './css/progressbar.css';
import './css/scroll.css';

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

let classNameList = new Map();

let tempStyleList = [];
let parsedCSS = [];
let linkCSS = [];
let themeCSS = { dark: [], light: [] };
let styleElSheet;

let linkTag = document.querySelector('link[collection][document_id][name]:not([save="false"])');

function init() {
	if (document.querySelector('link[parse="false"]'))
		return;
	
	let styleEl = document.createElement("style");
	styleEl.setAttribute('component', 'CoCreateCss');
	document.head.appendChild(styleEl);
	styleElSheet = styleEl.sheet;
	
	parseLinkCSS();

	let elements = document.querySelectorAll("[class]");
	initElements(elements);

	observerInit();
}

function initElements (elements) {
	for(let element of elements)
		initElement(element);
	addNewRules();
}

function initElement(element) {
	parseClassList(element.classList);
	createThemeMedia();
	if (element.hasAttribute("className")) {
		let rule = "." + element.getAttribute("className") + " { " + element.getAttribute("class").replace(/ /g, "; ").replace(/:/g, ": ") + "; }";
		tempStyleList.push(rule);
	}
}

function parseLinkCSS() {
	if (linkTag) {
		let Rules = linkTag.sheet.cssRules;

		for (let rule of Rules) {
			try {
				linkCSS.push(rule.cssText);
				if (rule.selectorText) {
					classNameList.set(rule.selectorText.replace(/[.\\]/g, ''), true);
				} else {
					// ToDo: handle media queriesand add to classNameList to avoid duplicate parsing
				}
			}
			catch (err) {
				console.error(err);
			}
		}
	}
}

function parseClassList(classList) {
	for (let className of classList) {
		if (classNameList.has(className)) continue;
	
		if (className.includes('@dark') || className.includes('@light')) {
			createThemeRule(className) ;
		}
		else if (className.includes(':')) {
			if (className.includes('@')) {
				createMediaRule(className);
			}
			else {
				let rule = createRule(className);
				tempStyleList.push(rule);
				classNameList.set(className, true);
			}
		}
	}
}

function createRule(className) {
	let important = "";
	let importantSuffix = "";
	if (className.includes('!important')) {
		[className, important] = className.split("!");
		important = '!' + important;
		importantSuffix = '\\' + important;
	}
	let res = className.split(":");
	let property = res[0];
	let suffix = parseValue(res[1]);
	let value = res[1].split("@")[0].replace(/_/g, " ");
	
	let rule = "";
	if (res.length > 2) {
		for (let i = 0; i < res.length - 2; i++) {
			suffix += "\\:" + res[2 + i] + importantSuffix + ":" + res[2];
		}
		rule = `.${property}\\:${suffix} { ${property}: ${value}${important}; }`;
	}
	else {
		rule = `.${property}\\:${suffix}${importantSuffix} { ${property}: ${value}${important}; }`;
	}
	return rule;
}

function parseValue(value) {
	return value
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
}

function createMediaRule(className) {
	let parts = className.split("@");
	let main_rule = createRule(className);

	for (let i = 1; i < parts.length; i++) {
		let range_num = mediaRangeNames.indexOf(parts[i]);
		let range = [];
		if (range_num != -1) range = rangesArray[range_num];
		else {
			let customRange = parts[i].split('-');
			range = customRange.map(c => Number.parseInt(c));
		}
		let prefix = "@media screen";
		if (range[0] != 0) {
			prefix += " and (min-width:" + range[0] + "px)";
		}
		if (range[1] != 0) {
			prefix += " and (max-width:" + range[1] + "px)";
		}
		let rule = prefix + " {  " + main_rule + "}";
		tempStyleList.push(rule);
		classNameList.set(className, true);
	}
}

function createThemeRule(className) {
	let classname = className;
	let pseudo, theme;
	[className, theme] = className.split('@');
	
	if (theme.includes(':')) {
		theme = theme.split(':');
		pseudo = theme;
		theme = theme[0];
		pseudo.shift();
	}
	
	let res = className.split(':');
	if (res.length > 2) {
		console.log('pseudo names need to be added after theme');
		return;
	}
	let property = res[0];
	let suffix = parseValue(res[1]);
	let value = res[1].replace(/_/g, " ");
	
	let rule = "";
	if (pseudo) {
		suffix += "\\@" + theme;
		for (let i = 0; i < pseudo.length; i++) {
			suffix += ":" + pseudo[0 + i];
		}
		rule = `.${property}\\:${suffix} { ${property}: ${value}; }`;
	}
	else {
		rule = `.${property}\\:${suffix}\\@${theme} { ${property}: ${value}; }`;
	}
	if (theme == 'dark' || theme == 'light') {
		rule = `[theme="${theme}"] ${rule}`;
		let reverseRule = `html:not([theme="${themes[1 - themes.indexOf(theme)]}"]) ${rule}`;
		tempStyleList.push(rule);
		themeCSS[theme].push(reverseRule);
		classNameList.set(classname, true);
	}
}

function createThemeMedia() {
	let initial;
	if (themeCSS.dark.length) {
		initial = "@media (prefers-color-scheme: dark) {";
		for (let c of themeCSS.dark) {
			initial += c + "\n";
		}
		initial += "}";
		tempStyleList.push(initial);
		themeCSS.dark = [];
	}
	if (themeCSS.light.length) {
		initial = "@media (prefers-color-scheme: light) {";
		for (let c of themeCSS.light) {
			initial += c + "\n";
		}
		initial += "}";
		tempStyleList.push(initial);
		themeCSS.light = [];
	}

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
		try {
			styleElSheet.insertRule(rule, low);
		}
		catch (err) {
			console.error(err);
		}
		parsedCSS.splice(low, 0, rule);
	}
	if (tempStyleList.length > 0)
		save();
	tempStyleList = [];
}

function save() {
	if (linkTag) { 
        const onlyUnique = (value, index, self) => {
            return self.indexOf(value) === index;
        };

		let css = parsedCSS.concat(linkCSS).filter(onlyUnique);
		crud.save(linkTag, css.join('\r\n'));
	}
}

const observerInit = () => {
	observer.init({
		name: "ccCss",
		observe: ['childList'],
		target: '[class]',
		callback: mutation => {
			initElements(mutation.addedNodes);
		}
	});
	observer.init({
		name: "ccCss",
		observe: ["attributes"],
		attributeName: ["class", "className"],
		callback: mutation => {
			initElements([mutation.target]);        
		}
	});
};

init();

export default {initElements};
