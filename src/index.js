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


const mediaRangeNames = ["xs", "sm", "md", "lg", "xl"];

const ranges = {
  xs: [0, 567],
  sm: [576, 768],
  md: [769, 992],
  lg: [993, 1200],
  xl: [1201, 0],

};
const rangesArray = Object.values(ranges);


let styleEl = document.createElement("style");
styleEl.setAttribute('component', 'CoCreateCss')
document.head.appendChild(styleEl);
let selectorList = [];
let styleList = [];
let tempStyleList = [];
let styleElSheet = styleEl.sheet;
let onStyleChange

export default {
  setOnStyleChange(callback) {
    onStyleChange = callback;
  }
}



window.addEventListener("load", function() {


  observer.init({
    name: "ccCss",
    observe: ["attributes", "childList"],
    attributes: ["class"],
    callback: (mutation) => {


      // // console.log('ccCSS observer start', performance.now())
      if (mutation.type == "childList")
        mutation.target.querySelectorAll("*").forEach((el) => {
          addParsingClassList(el.classList);
        });
      else
        addParsingClassList(mutation.target.classList);
      // styleList.forEach(i => styleElSheet.insertRule(i))
      addNewRules()
      if (onStyleChange) onStyleChange(false, styleList)

    },
  });

  if (document.querySelector('link[parse="false"]') || document.querySelector('link[onload="false"]'))
    return;


  let elements = document.querySelectorAll("[class]");
  for (let element of elements) {
    addParsingClassList(element.classList);
  }
  styleList = tempStyleList;
  tempStyleList = []
  styleList.sort();
  styleList.forEach(i => styleElSheet.insertRule(i))
  if (onStyleChange) onStyleChange(true, styleList)




});


function addNewRules() {

  for (let i = 0, len = tempStyleList.length; i < len; i++) {
    let rule = tempStyleList[i];

    let low = 0,
      high = styleList.length;
    while (low < high) {
      let index = (low + high) >>> 1;
      let midItem = styleList[index];
      if (rule < midItem)
        high = index;
      else
        low = index + 1;



    }

    styleElSheet.insertRule(rule, low);
    styleList.splice(low, 0, rule);


  }

  tempStyleList = []

}




function addParsingClassList(classList) {
  let re = /.+:.+/;
  for (let classname of classList) {
    try {
      if (re.exec(classname)) {
        if (selectorList.indexOf(classname) == -1) {
          let re_at = /.+@.+/;
          if (re_at.exec(classname)) {
            let parts = classname.split("@");
            let main_rule = parseClass(classname);

            for (let i = 1; i < parts.length; i++) {
              let range_num = mediaRangeNames.indexOf(parts[i]);
              if (range_num == -1) continue;
              let range = rangesArray[range_num];
              let prefix = "@media screen";
              if (range[0] != 0) {
                prefix += " and (min-width:" + range[0] + "px)";
              }
              if (range[1] != 0) {
                prefix += " and (max-width:" + range[1] + "px)";
              }
              let rule = prefix + "{" + main_rule + "}";
              tempStyleList.push(rule)

              selectorList.push(classname);
            }
          }
          else {
            let rule = parseClass(classname);

            tempStyleList.push(rule)
            selectorList.push(classname);
          }
        }
      }
    }
    catch (e) {}
  }
}

function parseClass(classname) {
  let res = classname.split(":");
  let rule = "";
  let suffix = res[1]
    .replace(/\./g, "\\.")
    .replace(/%/, "\\%")
    .replace(/@/g, "\\@")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/#/g, "\\#")
    .replace(/,/g, "\\,")
    .replace(/!/, "\\!");
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
    rule = `.${res[0]}\\:${suffix}{${res[0]}:${res[1]}}`;
  }
  return rule;
}
