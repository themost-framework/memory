// eslint-disable-next-line no-unused-vars
import { DataApplication, DataConfigurationStrategy, DataCacheStrategy, DataContext } from '@themost/data';
import { createInstance } from '../src';
import fs from 'fs';

const testConnectionOptions = {
    'database': 'spec/db/local.db',
    'buffer': fs.readFileSync('spec/db/local.db')
};


class CancelTransactionError extends Error {
    constructor() {
        super();
    }
}

/**
 * @callback TestContextFunction
 * @param {DataContext} context
 * @returns {Promise<void>}
*/

class TestApplication extends DataApplication {
    constructor(cwd) {
        super(cwd);
        const dataConfiguration = this.configuration.getStrategy(DataConfigurationStrategy);
        // add adapter type
        const name = 'Data Memory Adapter';
        const invariantName = 'mem';
        Object.assign(dataConfiguration.adapterTypes, {
            mem: {
                name,
                invariantName,
                createInstance
            }
        });
        dataConfiguration.adapters.push({
            name: 'test',
            invariantName: 'mem',
            default: true,
            options: testConnectionOptions
        });
    }
    
    async finalize() {
        const service = this.getConfiguration().getStrategy(DataCacheStrategy);
        if (typeof service.finalize === 'function') {
            await service.finalize();
        }
    }

    /**
     * @param {TestContextFunction} func 
     */
    async executeInTestContext(func) {
        const context = this.createContext();
        try {
            await func(context);
        } catch (err) {
            await context.finalizeAsync();
            throw err;
        }
    }

    /**
     * @param {TestContextFunction} func 
     * @returns {Promise<void>}
     */
    executeInTestTransaction(func) {
        return this.executeInTestContext((context) => {
            return new Promise((resolve, reject) => {
                // start transaction
                context = this.createContext();
                // clear cache
                const configuration = context.getConfiguration();
                Object.defineProperty(configuration, 'cache', {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    value: { }
                });
                context.db.executeInTransaction((cb) => {
                    try {
                        func(context).then(() => {
                            return cb(new CancelTransactionError());
                        }).catch( (err) => {
                            return cb(err);
                        });
                    }
                    catch (err) {
                        return cb(err);
                    }
                }, (err) => {
                    context.finalizeAsync().finally(() => {
                        // if error is an instance of CancelTransactionError
                        if (err && err instanceof CancelTransactionError) {
                            return resolve();
                        }
                        if (err) {
                            return reject(err);
                        }
                        // exit
                        return resolve();
                    });
                });
            });
        });
    }
}

export {
    TestApplication
}
