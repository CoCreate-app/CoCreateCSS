module.exports = {
    "organization_id": "",
    "key": "",
    "host": "",
    "directories": [
        {
            "entry": "./docs",
            "array": "files",
            "object": {
                "name": "{{name}}",
                "src": "{{source}}",
                "host": [
                    "*"
                ],
                "directory": "docs",
                "path": "/docs/CoCreateCSS/{{path}}",
                "pathname": "{{pathname}}",
                "content-type": "{{content-type}}",
                "public": "true"
            }
        },
        {
            "entry": "./dist",
            "exclude": [
                ".txt", ".js"
            ],
            "array": "files",
            "object": {
                "name": "{{name}}",
                "src": "{{source}}",
                "host": [
                    "*"
                ],
                "directory": "{{directory}}",
                "path": "{{path}}",
                "pathname": "{{pathname}}",
                "content-type": "{{content-type}}",
                "public": "true"
            }
        },
    ]
}