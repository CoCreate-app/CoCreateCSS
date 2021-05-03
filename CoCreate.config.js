module.exports = {
    config: {
        apiKey: "c2b08663-06e3-440c-ef6f-13978b42883a",
        organization_Id: "5de0387b12e200ea63204d6c",
        host: "server.cocreate.app:8088"
    },
 
    sources: [
        {
            entry: "./docs/index.html",
            collection: "files",
            document_id: "60132e7286c0ba24512cca3c",
            key: "src",
            data:{
                name: "CoCreateCSS Doc",
                domains: ["cocreate.app", "server.cocreate.app", "ws.cocreate.app"],
                path: "/docs/CoCreateCSS",
            }
        },
        {
            entry: "./docs/utility.html",
            collection: "files",
            document_id: "60132e7286c0ba24512cca3c",
            key: "src",
            data:{
                name: "Utility Doc",
                domains: ["cocreate.app", "server.cocreate.app", "ws.cocreate.app"],
                path: "/docs/utility",
            }
        },
        {
            entry: "./docs/avatar.html",
            collection: "files",
            document_id: "60132e7286c0ba24512cca3c",
            key: "src",
            data:{
                name: "Avatar Doc",
                domains: ["cocreate.app", "server.cocreate.app", "ws.cocreate.app"],
                path: "/docs/avatar",
            }
        },
        {
            entry: "./docs/flip-item.html",
            collection: "files",
            document_id: "60132e7286c0ba24512cca3c",
            key: "src",
            data:{
                name: "Flip Item Doc",
                domains: ["cocreate.app", "server.cocreate.app", "ws.cocreate.app"],
                path: "/docs/flip-item",
            }
        },
    ],
   
    extract: {
        directory: "./src/",
        extensions: [
            "js",
            "css",
            "html"
        ],
        ignores: [
            "node_modules",
            "vendor",
            "bower_components",
            "archive"
        ],
    }
}
