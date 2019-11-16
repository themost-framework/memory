/**
 * MOST Web Framework 2.0 Codename Blueshift
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {MemoryContainer} from './MemoryContainer';
/**
 * @class
 */
export class MemoryAdapter {
    /**
     * @param {*} options
     */
    constructor(options) {
        Object.defineProperty(this, 'db', {
            configurable: true,
            enumerable: false,
            value: options.name
        });
        Object.defineProperty(this, 'connectionOptions', {
            configurable: true,
            enumerable: false,
            value: options.options
        });
    }

    /**
     * Opens a database connection
     * @param {Function} callback
     */
    open(callback) {
        if (this.rawConnection != null) {
            //the connection is already opened
            return callback();
        }
        this.rawConnection = new MemoryContainer(this.db);
        return callback();
    }

}
