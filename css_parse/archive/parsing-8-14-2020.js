/* Parsing CSS for Utility Class of CoCreate.app*/
/* created by Webelf000 */
let linklength = document.styleSheets.length;
let link = document.createElement("link");
link.setAttribute("rel", "stylesheet");
link.setAttribute("type", "text/css");
link.setAttribute("href", "#");
document.head.appendChild(link);
var utilityClassList = [];
var myStyle;
link.addEventListener("load", function(){
    myStyle = document.styleSheets[linklength];
    let elements = document.querySelectorAll("[class]");
    for (let element of elements) {
        addParsingClassList(element.classList);
    }
    const ob_config = { attributes: true, childList: false, subtree: true };
    const callback = function(mutationsList, observer) {
        for(let mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === "class") {
                addParsingClassList(mutation.target.classList);
            }
        }
    };
    const observer = new MutationObserver(callback);
    observer.observe(document.body, ob_config); 
});
function addParsingClassList(classList) {
    let re = /.+:.+/;
    for (let classname of classList) {
        if (re.exec(classname)) {
            if (utilityClassList.indexOf(classname) == -1) {
                let re_at = /.+@.+/;
                if (re_at.exec(classname)) {
                    let parts = classname.split("@");
                    let main_rule = parseClass(classname);
                    const range_names = ["xs", "sm", "md", "lg"];
                    const ranges = [[0, 767], [768, 991], [992, 1199], [1200, 0]];
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
                    let re_at = new RegExp("^" + classname + "@");
                    let rulelist = [];
                    let index = utilityClassList.findIndex(value => re_at.test(value));
                    while(index != -1) {
                        rulelist.push(myStyle.cssRules[index]);
                        utilityClassList.splice(index, 1);
                        myStyle.deleteRule(index);
                        index = utilityClassList.findIndex(value => re_at.test(value));
                    }
                    let rule = parseClass(classname)
                    myStyle.insertRule(rule);
                    utilityClassList.push(classname);
                    if (rulelist.length > 0) {
                        for (let i = 0; i < rulelist.length; i++) {
                            myStyle.insertRule(rulelist[i].selectorText + rulelist[i].cssText);
                        }
                    }
                }
            }
        }
    }
    function parseClass(classname) {
        let res = classname.split(":");
        let rule = "";
        let suffix = res[1].replace(/\./g, "\\.").replace(/%/, "\\%").replace(/@/g, "\\@");
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
        console.log(rule);
        return rule;
    }
}