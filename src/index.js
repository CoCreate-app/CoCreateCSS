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
import crud from '@cocreate/crud-client'

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

let styleList = [];
let tempStyleList = [];
let styleElSheet;

// event system
let eventCallback = {};
let details = {};






// function updateAllCss(styleList, collection, document_id, name) {
// 	//wait for ccCSs


// 	crud.updateDocument({
// 		collection,
// 		document_id,
// 		upsert: true,
// 		// broadcast_sender,
// 		data: {
// 			[name + 'Array']: JSON.stringify(styleList)
// 		},
// 	});

// }


async function getCssArrayFromDB() {
  console.log("getCssArrayFromDB")
  let link = document.querySelector('[data-save=true][data-collection][data-document_id][name]');

  if (!link) {
    console.log("error")
    return new Promise((resolve, reject) => {
      resolve([])
    });
    //throw new Error('no [data-save=true][data-collection][data-document_id][name] found')
  }


  const collection = link.getAttribute('data-collection');
  let name = link.getAttribute('name');
  const document_id = link.getAttribute('data-document_id');
  let unique = Date.now();

  // here we are fetching the value cssArray from db... instaed want to fetch name:src' which is the css string..
  // after we fetch the css string we want to convert it to an array... 
  // how?
  crud.readDocument({ collection: collection, document_id: document_id, event: unique });

  let { data: responseData, metadata } = await crud.listenAsync(unique);

  if (responseData && responseData[name + 'Array']) {

    return new Promise((resolve, reject) => {


      let cssArray;
      let cssString;
      try {
        cssString = String.raw `${JSON.stringify(responseData[name])}`;
        cssArray = cssString.trim().split(/\s(?=\.)/g).map(i => i.replace(/@media/gi, ",@media").split(',')).flat();

      }
      catch (err) {
        reject(err)
        console.log('styleArray not parseable')
      }

      resolve(cssArray)
    })
    // 	on('parse', (styles) => updateAllCss(styles.concat(cssArray), collection, document_id, name))
  }
  else
    throw new Error('no css found in db')






}



function arrayUnique(array) {
  var a = array.concat();
  for (var i = 0; i < a.length; ++i) {
    for (var j = i + 1; j < a.length; ++j) {
      if (a[i] === a[j])
        a.splice(j--, 1);
    }
  }

  return a;
}


function on(event, callback) {

  if (details[event])
    callback(styleList);

  eventCallback[event] = callback


}


window.addEventListener("load", async function() {


  styleEl.setAttribute('component', 'CoCreateCss')
  document.head.appendChild(styleEl);
  styleElSheet = styleEl.sheet;




  observer.init({
    name: "ccCss",
    observe: ["attributes", "childList"],
    attributes: ["class"],
    callback: (mutation) => {

      let hasChange = false;
      // // console.log('ccCSS observer start', performance.now())

      hasChange = addParsingClassList(mutation.target.classList);
      if (mutation.type == "childList")
        mutation.target.querySelectorAll("*").forEach((el) => {
          hasChange = addParsingClassList(el.classList) || hasChange;
        });


      // styleList.forEach(i => styleElSheet.insertRule(i))
      addNewRules()

      if (hasChange)
        window.dispatchEvent(new CustomEvent("newCoCreateCssStyles", {
          detail: {
            isOnload: false,
            styleList: styleList
          },
        }));


    },
  });

  if (document.querySelector('link[parse="false"]') || document.querySelector('link[onload="false"]'))
    return;



  let hasChange = false;
  let elements = document.querySelectorAll("[class]");


  for (let element of elements) {
    hasChange = addParsingClassList(element.classList) || hasChange;
  }
  styleList = tempStyleList;
  tempStyleList = [];

  let isSuccess;
  try {
    let dbCss = await getCssArrayFromDB();

    console.log("dbCss", dbCss)
    console.log("styleList", styleList)
    styleList = arrayUnique(styleList.concat(dbCss))

    console.log("After concat ", styleList)
    let temp = [];
    for (let i = 0; i < styleList.length; i++) {
      if (temp.indexOf(styleList[i]) === -1)
        temp.push(styleList[i]);
    }


    styleList = temp;

    for (let i = 0; i < styleList.length; i++) {
      if (Object.keys(dbCss).length) {
        if (dbCss.indexOf(styleList[i]) === -1)
          styleElSheet.insertRule(styleList[i])
      }
      else
        styleElSheet.insertRule(styleList[i])
    }




    styleList.sort();
    isSuccess = true;
  }
  catch (err) {
    console.error(err)
  }

  if (!isSuccess)
    styleList.forEach(l => styleElSheet.insertRule(l))

  console.log("hasChange", hasChange)
  if (hasChange)
    window.dispatchEvent(new CustomEvent("newCoCreateCssStyles", {
      detail: {
        isOnload: true,
        styleList: styleList
      },
    }));

  // 3 lines events system
  if (eventCallback.parse)
    eventCallback.parse()
  details.parse = true;


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
  let hasChanged = false;
  for (let classname of classList) {

    if (re.exec(classname)) {
      if (!selectorList.has(classname)) {
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
            selectorList.set(classname, true);
            hasChanged = true;

          }
        }
        else {
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

function parseClass(classname) {
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
    rule = `.${res[0]}\\:${suffix}{${res[0]}:${res[1]}}`;
  }
  return rule;
}


export default {
  on,
  get styleList() {
    return styleList
  },
  set styleList(value) {
    styleList = value;
    styleList.sort();
  }
}
