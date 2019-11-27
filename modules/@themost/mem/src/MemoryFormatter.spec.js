/**
 * MOST Web Framework 2.0 Codename Blueshift
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */

import {DataConfiguration, DataConfigurationStrategy, DefaultDataContext} from '@themost/data';
import {promisify} from 'es6-promisify';
import path from 'path';

describe('MemoryFormatter', () => {
    /**
     * @type {DataConfiguration}
     */
    let configuration;
    /**
     * @type DefaultDataContext
     */
    let context;
    beforeAll(() => {
        configuration = new DataConfiguration(path.resolve(__dirname, 'test/config'));
        configuration.setSourceAt('adapterTypes', [
            {
                "name": "Memory Data Adapter",
                "invariantName": "memory",
                "type": path.resolve("./modules/@themost/mem/src/MemoryAdapter")
            }
        ]);
        configuration.setSourceAt('adapters', [
            {
                "name": "local-storage",
                "invariantName": "memory",
                "default": true
            }
        ]);
        // reset data configuration strategy
        configuration.useStrategy(DataConfigurationStrategy, DataConfigurationStrategy);
        // set current configuration
        DataConfiguration.setCurrent(configuration);
    });
    beforeEach(() => {
        // create context
        context = new DefaultDataContext();
    });
    afterEach(async () => {
        // finalize context
        if (context) {
            await promisify(context.finalize.bind(context))();
        }
    });
    it('should use DataContext.model()', async () => {
        const model = context.model('Customers');
        expect(model).toBeTruthy();
    });
    it('should use DataModel.insert()', async () => {
        const model = context.model('Customers');
        // noinspection SpellCheckingInspection
        const newItem = {
            CustomerName: 'Gavin McDonald',
            ContactName: 'Alex McDonald',
            Address: '43 Essex Court',
            City: 'Bournemouth, Dorset',
            PostalCode: 'S81 2FY',
            Country: 'England'
        };
        await model.silent().insert(newItem);
        let item = await model.where('CustomerName').equal('Gavin McDonald').silent().getItem();
        expect(item).toBeTruthy();
        await model.remove(item);
        item = await model.where('CustomerName').equal('Gavin McDonald').silent().getItem();
        expect(item).toBeFalsy();
    });
    it('should use DataModel.save()', async () => {
        const model = context.model('Customers');
        // noinspection SpellCheckingInspection
        let item = {
            CustomerName: 'Gavin McDonald',
            ContactName: 'Alex McDonald',
            Address: '43 Essex Court',
            City: 'Bournemouth, Dorset',
            PostalCode: 'S81 2FY',
            Country: 'England'
        };
        await model.silent().insert(item);
        expect(item).toBeTruthy();
        item.Address = '45 Essex Court';
        await model.update(item);
        item = await model.where('CustomerName').equal('Gavin McDonald').silent().getItem();
        expect(item).toBeTruthy();
        expect(item.Address).toEqual('45 Essex Court');
        await model.remove(item);
        item = await model.where('CustomerName').equal('Gavin McDonald').silent().getItem();
        expect(item).toBeFalsy();
    });
    it('should use DataModel.save() with error', async () => {
        const model = context.model('Customers');
        // noinspection SpellCheckingInspection
        let item = {
            ContactName: 'Alex McDonald',
            Address: '43 Essex Court',
            City: 'Bournemouth, Dorset',
            PostalCode: 'S81 2FY',
            Country: 'England'
        };
        expectAsync(model.silent().insert(item)).toBeRejected();
        item = await model.where('ContactName').equal('Gavin McDonald').silent().getItem();
        expect(item).toBeFalsy();
    });
    it('should use associations', async () => {
        // noinspection SpellCheckingInspection
        let newCustomer = {
            CustomerName: 'Gavin McDonald',
            ContactName: 'Alex McDonald',
            Address: '43 Essex Court',
            City: 'Bournemouth, Dorset',
            PostalCode: 'S81 2FY',
            Country: 'England'
        };
        await context.model('Customers').silent().insert(newCustomer);

        const newOrder = {
            Customer: newCustomer,
            Employee: {
                EmployeeID: 5
            },
            OrderDate: new Date('1996-07-04'),
            Shipper: {
                ShipperID: 3
            }
        };
        await context.model('Orders').silent().insert(newOrder);

        const order = await context.model('Orders').where('OrderID').equal(newOrder.OrderID)
            .expand('Customer', 'Employee', 'Shipper').silent().getItem();
        expect(order).toBeTruthy();
        expect(order.Customer.CustomerName).toEqual('Gavin McDonald');
        expect(order.Employee.EmployeeID).toEqual(5);
        expect(order.Shipper.ShipperID).toEqual(3);

        await context.model('Orders').silent().remove(newOrder);
        await context.model('Customers').silent().remove(newCustomer);


    });

    it('should use date functions', async () => {

        let orders = await context.model('Orders')
            .where('OrderDate').getDay().equal(4)
            .silent()
            .getItems();
        expect(orders.length).toBeGreaterThanOrEqual(1);

        orders.forEach(order => {
            const value = order.OrderDate.getDay();
            expect(order.OrderDate.getDate()).toEqual(4) ;
        });

        orders = await context.model('Orders')
            .where('OrderDate').getMonth().equal(7)
            .silent()
            .getItems();
        expect(orders.length).toBeGreaterThanOrEqual(1);
        orders.forEach(order => {
            expect(order.OrderDate.getMonth()).toEqual(6);
        });

        orders = await context.model('Orders')
            .where('OrderDate').getYear().equal(1996)
            .silent()
            .getItems();
        expect(orders.length).toBeGreaterThanOrEqual(1);
        orders.forEach(order => {
            expect(order.OrderDate.getFullYear()).toEqual(1996);
        });

        orders = await context.model('Orders')
            .where('OrderDate').getFullYear().equal(1996)
            .silent()
            .getItems();
        expect(orders.length).toBeGreaterThanOrEqual(1);
        orders.forEach(order => {
            expect(order.OrderDate.getFullYear()).toEqual(1996);
        });


        orders = await context.model('Orders')
            .where('OrderDate').getHours().equal(14)
            .silent()
            .getItems();
        orders.forEach(order => {
            expect(order.OrderDate.getHours()).toEqual(14);
        });

        orders = await context.model('Orders')
            .where('OrderDate').getMinutes().equal(15)
            .silent()
            .getItems();
        orders.forEach(order => {
            expect(order.OrderDate.getMinutes()).toEqual(15);
        });

        orders = await context.model('Orders')
            .where('OrderDate').getSeconds().equal(45)
            .silent()
            .getItems();
        expect(orders.length).toEqual(0);

    });

    it('should use string functions', async () => {

        let customers = await context.model('Customers')
            .where('CustomerName').startsWith('To')
            .silent()
            .getItems();
        expect(customers.length).toBeGreaterThanOrEqual(1);

        customers = await context.model('Customers')
            .where('CustomerName').endsWith('Box')
            .silent()
            .getItems();
        expect(customers.length).toBeGreaterThanOrEqual(1);

        customers = await context.model('Customers')
            .where('CustomerName').contains('Spezial')
            .silent()
            .getItems();
        expect(customers.length).toBeGreaterThanOrEqual(1);

        customers = await context.model('Customers')
            .where('CustomerName').indexOf('Toms').equal(0)
            .silent()
            .getItems();
        expect(customers.length).toBeGreaterThanOrEqual(1);

        customers = await context.model('Customers')
            .where('CustomerName').substr(0, 4).equal('Toms')
            .silent()
            .getItems();
        expect(customers.length).toBeGreaterThanOrEqual(1);

        customers = await context.model('Customers')
            .where('CustomerName').concat(' Test').equal('The Cracker Box Test')
            .silent()
            .getItems();
        expect(customers.length).toBeGreaterThanOrEqual(1);

        customers = await context.model('Customers')
            .where('ContactName').length().equal(8)
            .silent()
            .getItems();
        expect(customers.length).toBeGreaterThanOrEqual(1);

        customers = await context.model('Customers')
            .where('CustomerName').notContains('T').equal(8)
            .silent()
            .getItems();
        expect(customers.length).toBeGreaterThanOrEqual(1);


    });

    it('should use DataModel.select()', async () => {

        let order = await context.model('Orders')
            .where('OrderID').equal(10248)
            .select('OrderID',
                'Customer/CustomerName as CustomerName',
                'Shipper/ShipperName as ShipperName')
            .silent().getItem();
        expect(order).toBeTruthy();
        expect(order.OrderID).toBeTruthy();
        expect(order.CustomerName).toBeTruthy();

        order = await context.model('Orders')
            .where('Shipper/ShipperName').equal('Federal Shipping')
            .select('OrderID',
                'Customer/CustomerName as CustomerName',
                'Shipper/ShipperName as ShipperName')
            .silent().getItem();
        expect(order).toBeTruthy();

        let customers = await context.model('Customers')
            .where('Orders/Shipper').equal('3')
            .silent()
            .getItems();
        expect(customers).toBeTruthy();

    });

    it('should use MemoryAdapter.lastIdentity()', async () => {
        const newUser = {
            Name: 'user1@example.com'
        };
        await context.model('Users').silent().insert(newUser);
        const user = await context.model('Users')
            .where('Name').equal('user1@example.com')
            .getItem();
        expect(user).toBeTruthy();
        await context.model('Users').silent().remove(newUser);
    });

    it('should use math functions', async () => {
        let items = await context.model('Product').where('Price').greaterThan(100).silent().getItems();
        expect(items.length).toBeGreaterThan(0);
        items.forEach( item => {
            expect(item.Price).toBeGreaterThan(100);
        });
        items = await context.model('Product').where('Price').greaterOrEqual(97).silent().getItems();
        expect(items.length).toBeGreaterThan(0);
        items.forEach( item => {
            expect(item.Price).toBeGreaterThanOrEqual(97);
        });
        items = await context.model('Product').where('Price').lowerThan(10).silent().getItems();
        expect(items.length).toBeGreaterThan(0);
        items.forEach( item => {
            expect(item.Price).toBeLessThan(10);
        });
        items = await context.model('Product').where('Price').lowerOrEqual(10).silent().getItems();
        expect(items.length).toBeGreaterThan(0);
        items.forEach( item => {
            expect(item.Price).toBeLessThanOrEqual(10);
        });

        items = await context.model('Product').where('Price').between(10, 15).silent().getItems();
        expect(items.length).toBeGreaterThan(0);
        items.forEach( item => {
            expect(item.Price).toBeGreaterThanOrEqual(10) && expect(item.Price).toBeLessThanOrEqual(15);
        });

        items = await context.model('Product').where('Price').floor().equal(12).silent().getItems();
        expect(items.length).toBeGreaterThan(0);
        items.forEach( item => {
            expect(Math.floor(item.Price)).toEqual(12);
        });

        items = await context.model('Product').where('Price').ceil().equal(13).silent().getItems();
        expect(items.length).toBeGreaterThan(0);
        items.forEach( item => {
            expect(Math.ceil(item.Price)).toEqual(13);
        });

        items = await context.model('Product').where('Price').multiply(1.2).lowerOrEqual(15).silent().getItems();
        expect(items.length).toBeGreaterThan(0);
        items.forEach( item => {
            expect(item.Price * 1.2).toBeLessThanOrEqual(15);
        });

        items = await context.model('Product').where('Price').subtract(5).lowerOrEqual(10).silent().getItems();
        expect(items.length).toBeGreaterThan(0);
        items.forEach( item => {
            expect(item.Price - 5).toBeLessThanOrEqual(10);
        });

        items = await context.model('Product').where('Price').add(5).lowerOrEqual(10).silent().getItems();
        expect(items.length).toBeGreaterThan(0);
        items.forEach( item => {
            expect(item.Price + 5).toBeLessThanOrEqual(10);
        });

        items = await context.model('Product').where('Price').divide(2).lowerThan(10).silent().getItems();
        expect(items.length).toBeGreaterThan(0);
        items.forEach( item => {
            expect(item.Price / 2).toBeLessThan(10);
        });

        items = await context.model('Product').where('Price').round(1).lowerThan(10).silent().getItems();
        expect(items.length).toBeGreaterThan(0);
        items.forEach( item => {
            expect(item.Price).toBeLessThan(10);
        });
    });

});
