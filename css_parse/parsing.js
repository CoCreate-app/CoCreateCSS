let linklength = document.head.querySelectorAll("link[rel=stylesheet]").length;
let link = document.createElement("link");
link.setAttribute("rel", "stylesheet");
link.setAttribute("type", "text/css");
link.setAttribute("href", "./test.css");
// document.head.querySelectorAll("link[rel=stylesheet]")[linklength - 1].insertAdjacentHTML('afterend', link.outerHTML);
document.head.appendChild(link);
link.addEventListener("load", () => {
    let myStyle = document.styleSheets[linklength];
    let elements = document.querySelectorAll("[class]");
    let re = /.+:.+/;
    for (let element of elements) {
        for (let classname of element.classList) {
            if (re.exec(classname)) {
                let res = classname.split(":");
                res[2] = res[1].replace(".", "\\.").replace("%", "\\%");
                myStyle.insertRule(`.${res[0]}\\:${res[2]}{${res[0]}:${res[1]}}`);
            }
        }
    }
});
