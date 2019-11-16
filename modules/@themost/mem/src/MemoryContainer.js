import {Args} from "@themost/common";

const MEMORY_CONTAINERS = {};

export class MemoryContainer {
    constructor(containerName) {
        if (MEMORY_CONTAINERS.hasOwnProperty(containerName) === false) {
            Object.defineProperty(MEMORY_CONTAINERS, containerName, {
               enumerable: true,
               configurable: true,
               value: {}
            });
        }
        this.name = containerName;
    }
    /**
     * @param {string} name
     * @returns *
     */
    getCollection(name) {
        Args.notNull(name, 'Collection Name');
        if (MEMORY_CONTAINERS[this.name].hasOwnProperty(name) === false) {
            // create one
            MEMORY_CONTAINERS[this.name][name] = [];
        }
        return MEMORY_CONTAINERS[this.name][name];
    }
}
