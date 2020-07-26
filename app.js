// const upload_s3 = require('../CoCreateJS/upload_s3');
var UglifyCss = require("uglifycss");
var fs = require('fs');
const pkg = require('./package.json');
const name = pkg.name;
const folderOutput = './dist/' //folder JS project
const fileOutput = folderOutput+name+'.min.css'
console.log("Compiling and minifying...")

const file_to_compress = [

// components
'../CoCreate-components/CoCreate-floating-labels/src/CoCreate-floating-label.css',
'../CoCreate-components/CoCreate-select/src/CoCreate-select.css',
'../CoCreate-components/CoCreate-modal/src/CoCreate-modal.css',
'../CoCreate-components/CoCreate-menu-icon/src/CoCreate-menu-icon.css',
'../CoCreate-components/CoCreate-sidenav/src/CoCreate-sidenav.css',
'../CoCreate-components/CoCreate-scroll/src/CoCreate-scroll.css',
'../CoCreate-components/CoCreate-flip-item/src/CoCreate-flip-item.css',

'../CoCreate-components/CoCreate-cursors/src/CoCreate-cursors.css',
// '../CoCreate-components/CoCreate-builder/CoCreate-builder.css',

// plugins
'../CoCreate-plugins/CoCreate-datatables.net/src/CoCreate-datatables.css',
'../CoCreate-plugins/CoCreate-calendar/src/CoCreate-calendar.css',

// css
'src/CoCreate-avatar.css',
'src/CoCreate-badge.css',
'src/CoCreate-button.css',
'src/CoCreate-dropdown.css',
'src/CoCreate-card.css',
'src/box-shadow.css',
'src/CoCreate-navbar.css',
'src/CoCreate-menu.css',
'src/social-icon-colors.css',
'src/CoCreate-core.css',
'src/CoCreate-flex.css',
'src/CoCreate-helper.css',

];

var options = { 
    maxLineLen: 500, 
    expandVars: true, 
    output: {
        beautify: false,
        preamble: "/* CoCreate CSS*/"
    },
};

    var result = UglifyCss.processFiles(file_to_compress,options);
    fs.writeFileSync(fileOutput, result);
    
console.log("Successfully Created "+fileOutput)
/// Upload to S3

fs.copyFile(fileOutput, '../css/' + name + '.min.css', err => {
    if (err) {
        console.log(err)
    }
})

// upload_s3(fileOutput)