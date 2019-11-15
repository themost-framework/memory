import {Args} from "@themost/common";

export class MemoryContainer {
    /**
     * @param {string} name
     * @returns *
     */
    getCollection(name) {
        Args.notNull(name, 'Collection Name');
        if (this.hasOwnProperty(name) === false) {
            // create one
            this[name] = [];
        }
        return this[name];
    }
}
