module.exports = {
    "sourceMaps": true,
    "retainLines": true,
    "presets": [
        [
            '@babel/preset-env',
            {
                "targets": {
                    "node": 'current'
                }
            }
        ]
    ],
};;
