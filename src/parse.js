let linklength = document.head.querySelectorAll("link[rel=stylesheet]").length;
let link = document.createElement("link");
link.setAttribute("rel", "stylesheet");
link.setAttribute("type", "text/css");
// link.setAttribute("href", "./utility.css");
// document.head.appendChild(link);
document.head.querySelectorAll("link[rel=stylesheet]")[linklength - 1].insertAdjacentHTML('afterend', link.outerHTML);

var helperClassList = [];
var myStyle;
// link.addEventListener("load", () => {
    // console.log(link);
    myStyle = document.styleSheets[linklength];
    let elements = document.querySelectorAll("[class]");
    for (let element of elements) {
        addParsingClassList(element.classList);
    }
// });

const ob_config = { attributes: true, childList: false, subtree: true };
const callback = function(mutationsList, observer) {
    let myStyle = document.styleSheets[linklength];
    for(let mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === "class") {
            addParsingClassList(mutation.target.classList);
        }
    }
};
const observer = new MutationObserver(callback);
observer.observe(document.body, ob_config);

function addParsingClassList(classList) {
    let re = /.+:.+/;
    for (let classname of classList) {
        if (re.exec(classname)) {
            if (helperClassList.indexOf(classname) == -1) {
                helperClassList.push(classname);
                let res = classname.split(":");
                let rule = "";
                let suffix = res[1].replace(".", "\\.").replace("%", "\\%");
                res[1] = res[1].replace("_", " ");
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
                myStyle.insertRule(rule);
            }
        }
    }
}