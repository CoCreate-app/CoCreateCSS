function addRule(stylename, selector, rule) {

    var stylesheet = document.querySelector(`link[data-save]`)
    console.log('stylesheet', stylesheet)

    let myRules = stylesheet.cssRules; // Returns a CSSRuleList
    console.log(myRules); // let ruleList = stylesheet.cssRules;
}
// example use
