/**
 * MOST Web Framework 2.0 Codename Blueshift
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
import {SqlFormatter} from '@themost/query';
import {Args} from '@themost/common';

/**
 * Gets the first property of an object
 * @param {*} any
 * @returns {string}
 */
function getOwnPropertyKey(any) {
    for (let key in any) {
        if (any.hasOwnProperty(key)) {
            return key;
        }
    }
}

/**
 * @class
 */
export class MemoryFormatter extends SqlFormatter {
    constructor() {
        super();
    }
    escape(value, unquoted) {
        return value;
    }
    escapeConstant(value, unquoted) {
        return value;
    }

    /**
     * @param query
     * @returns {*}
     */
    formatInsert(query) {
        /**
         * @param {MemoryContainer} container
         */
        return (container) => {
            // get collection
            const key = getOwnPropertyKey(query.$insert);
            Args.notNull(key, 'Collection');
            // get items
            const itemToInsert = query.$insert[key];
            // get target collection
            const collection = container.getCollection(key);
            if (Array.isArray(itemToInsert)) {
                collection.push.apply(collection, itemToInsert);
            }
            else if (typeof itemToInsert === 'object') {
                collection.push(itemToInsert);
            }
            else {
                throw new Error('Invalid items to insert. Expected an object or an array of objects.')
            }
        };
    }

}
