/* Parsing CSS for Utility Class of CoCreate.app*/
/* created by Webelf000 */

let styleEl = document.createElement("style");
// styleEl.setAttribute('componentnnn', 'CCCSS')
document.head.appendChild(styleEl);
var utilityClassList = [];
var myStyle;
window.addEventListener("load", function () {
  const ob_config = {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: ["class"],
  };
  const callback = function (mutationsList, observer) {
    for (let mutation of mutationsList) {
      let element = mutation.target;
      addParsingClassList(element.classList);
    }
    sortRules();
  };
  const observer = new MutationObserver(callback);
  observer.observe(document.body, ob_config);

  myStyle = styleEl.sheet;
  let elements = document.querySelectorAll("[class]");
  for (let element of elements) {
    addParsingClassList(element.classList);
  }
  sortRules();
  
  // document.addEventListener('CoCreateHtmlTags-rendered',()=>{
  //     let elements = document.querySelectorAll("[class]");
  //     for (let element of elements) {
  //       addParsingClassList(element.classList);
  //     }
  //     sortRules();
  //     document.head.appendChild(styleEl);
  // })
});

function sortRules() {
  let ruleList = [];
  let length = utilityClassList.length;
  for (let i in utilityClassList) {
    ruleList.push(myStyle.cssRules[length - i - 1]);
    myStyle.deleteRule(length - i - 1);
  }
  let swapped;
  for (let i = 0; i < length; i++) {
    swapped = false;
    for (let j = length - 1; j > i; j--) {
      if (utilityClassList[j - 1] > utilityClassList[j]) {
        let temp = utilityClassList[j];
        utilityClassList[j] = utilityClassList[j - 1];
        utilityClassList[j - 1] = temp;
        temp = ruleList[j];
        ruleList[j] = ruleList[j - 1];
        ruleList[j - 1] = temp;
        swapped = true;
      }
    }
    if (swapped == false) break;
  }
  for (let i = 0; i < length; i++) {
    myStyle.insertRule(ruleList[i].cssText);
  }
}

function addParsingClassList(classList) {
  let re = /.+:.+/;
  for (let classname of classList) {
    try {
      if (re.exec(classname)) {
        if (utilityClassList.indexOf(classname) == -1) {
          // let re_important = /.*!important.*/;
          // let important = 0;
          // if (re_important.exec(classname)) {
          //     console.log("important");
          //     important = 1;
          //    let temp = classname.split("!important");
          //    classname = "";
          //    for (let tmp of temp) {
          //        classname += tmp;
          //    }
          // }
          let re_at = /.+@.+/;
          if (re_at.exec(classname)) {
            let parts = classname.split("@");
            let main_rule = parseClass(classname);
            const range_names = ["xs", "sm", "md", "lg", "xl"];
            const ranges = [
              [0, 567],
              [576, 768],
              [769, 992],
              [993, 1200],
              [1201, 0],
            ];
            for (let i = 1; i < parts.length; i++) {
              let range_num = range_names.indexOf(parts[i]);
              if (range_num == -1) continue;
              let range = ranges[range_num];
              let prefix = "@media screen";
              if (range[0] != 0) {
                prefix += " and (min-width:" + range[0] + "px)";
              }
              if (range[1] != 0) {
                prefix += " and (max-width:" + range[1] + "px)";
              }
              let rule = prefix + "{" + main_rule + "}";
              myStyle.insertRule(rule);
              utilityClassList.push(classname);
            }
          } else {
            let rule = parseClass(classname);
            myStyle.insertRule(rule);
            utilityClassList.push(classname);
          }
        }
      }
    } catch (e) {}
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
  } else {
    rule = `.${res[0]}\\:${suffix}{${res[0]}:${res[1]}}`;
  }
  return rule;
}
