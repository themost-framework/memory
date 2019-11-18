# themost-mem
MOST Web Framework in-memory data adapter for testing environments

This repository contains an in-memory data adapter for developing applications and services under [MOST Web Framework 2.0 Codename Blueshift](https://github.com/themost-framework/themost)

### Installation:

    npm install @themost/mem

### Application Configuration:

Add in-memory data data adapter to available adapter types:

    "adapterTypes": [
        ...
          { "name":"Memory Data Adapter", "invariantName": "memory", "type":"@themost/memory" }
        ...
        ],
    adapters: [
        ...
        { 
            "name":"local-storage", "invariantName":"memory", "default":true,
            "options": {
            }
        }
        ...
    ]
}

Note: If you are intending to use memory data adapter as the default adapter mark it as `"default": true` while setting application configuration.



