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
     * @type NamedDataContext
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
            CustomerID: 1,
            CustomerName: 'Alfreds Futterkiste',
            ContactName: 'Maria Anders',
            Address: 'Obere Str. 57',
            City: 'Berlin',
            PostalCode: '12209',
            Country: 'Germany'
        };
        await model.silent().insert(newItem);
        let item = await model.where('CustomerID').equal(1).silent().getItem();
        expect(item).toBeTruthy();
        await model.remove(item);
        item = await model.where('CustomerID').equal(1).silent().getItem();
        expect(item).toBeFalsy();
    });
    it('should use DataModel.save()', async () => {
        const model = context.model('Customers');
        // noinspection SpellCheckingInspection
        const newItem = {
            CustomerID: 1,
            CustomerName: 'Alfreds Futterkiste',
            ContactName: 'Maria Anders',
            Address: 'Obere Str. 57',
            City: 'Berlin',
            PostalCode: '12209',
            Country: 'Germany'
        };
        await model.silent().insert(newItem);
        let item = await model.where('CustomerID').equal(1).silent().getItem();
        expect(item).toBeTruthy();
        item.City = 'Munich';
        await model.save(item);
        item = await model.where('CustomerID').equal(1).silent().getItem();
        expect(item).toBeTruthy();
        expect(item.City).toEqual('Munich');
        await model.remove(item);
        item = await model.where('CustomerID').equal(1).silent().getItem();
        expect(item).toBeFalsy();
    });
    it('should use associations', async () => {
        // noinspection SpellCheckingInspection
        const newCustomer = {
            CustomerID: 90,
            CustomerName: 'Wilman Kala',
            ContactName: 'Matti Karttunen',
            Address: 'Keskuskatu 45',
            City: 'Helsinki',
            PostalCode: '21240',
            Country: 'Finland'
        };
        await context.model('Customers').silent().insert(newCustomer);

        // INSERT INTO `orders` (`OrderID`, `CustomerID`, `EmployeeID`, `OrderDate`, `ShipperID`) VALUES
        // (10248, 90, 5, '1996-07-04', 3);
        const newOrder = {
            OrderID: 10248,
            Customer: 90,
            Employee: 5,
            OrderDate: new Date('1996-07-04'),
            Shipper: 3
        };
        await context.model('Orders').silent().insert(newOrder);

        const order = await context.model('Orders').where('OrderID').equal(10248)
            .expand('Customer', 'Employee', 'Shipper').silent().getItem();
        expect(order).toBeTruthy();
        expect(order.Customer.CustomerID).toEqual(90);
        expect(order.Employee.EmployeeID).toEqual(5);
        expect(order.Shipper.ShipperID).toEqual(3);

        await context.model('Customers').silent().remove(newCustomer);
        await context.model('Orders').silent().remove(newOrder);

    });

    it('should use date functions', async () => {

        // noinspection SpellCheckingInspection
        const newCustomer = {
            CustomerID: 90,
            CustomerName: 'Wilman Kala',
            ContactName: 'Matti Karttunen',
            Address: 'Keskuskatu 45',
            City: 'Helsinki',
            PostalCode: '21240',
            Country: 'Finland'
        };
        await context.model('Customers').silent().insert(newCustomer);


        // INSERT INTO `orders` (`OrderID`, `CustomerID`, `EmployeeID`, `OrderDate`, `ShipperID`) VALUES
        // (10248, 90, 5, '1996-07-04', 3);

        await context.model('Orders').silent().insert([
            {
                OrderID: 10248,
                Customer: 90,
                Employee: 5,
                OrderDate: new Date('1996-07-04 17:30:45'),
                Shipper: 3
            },
            {
                OrderID: 10249,
                Customer: 90,
                Employee: 5,
                OrderDate: new Date('1996-05-03 14:15:00'),
                Shipper: 3
            },
        ]);

        let orders = await context.model('Orders')
            .where('OrderDate').getDay().equal(4)
            .silent()
            .getItems();
        expect(orders.length).toEqual(1);

        orders = await context.model('Orders')
            .where('OrderDate').getMonth().equal(5)
            .silent()
            .getItems();
        expect(orders.length).toEqual(1);

        orders = await context.model('Orders')
            .where('OrderDate').getYear().equal(1996)
            .silent()
            .getItems();
        expect(orders.length).toEqual(2);

        orders = await context.model('Orders')
            .where('OrderDate').getFullYear().equal(1996)
            .silent()
            .getItems();
        expect(orders.length).toEqual(2);

        orders = await context.model('Orders')
            .where('OrderDate').getHours().equal(14)
            .silent()
            .getItems();
        expect(orders.length).toEqual(1);

        orders = await context.model('Orders')
            .where('OrderDate').getHours().equal(13)
            .silent()
            .getItems();
        expect(orders.length).toEqual(0);

        orders = await context.model('Orders')
            .where('OrderDate').getMinutes().equal(15)
            .silent()
            .getItems();
        expect(orders.length).toEqual(1);

        orders = await context.model('Orders')
            .where('OrderDate').getSeconds().equal(45)
            .silent()
            .getItems();
        expect(orders.length).toEqual(1);

        await context.model('Customers').silent().remove(newCustomer);
        await context.model('Orders').silent().remove([
            {
                OrderID: 10248
            },
            {
                OrderID: 10249
            }
        ]);

    });

    it('should use string functions', async () => {
        // add customers
        await context.model('Customers').silent().getItems();
        const insertStatements = [
            `INSERT INTO customers (CustomerID, CustomerName, ContactName, Address, City, PostalCode, Country) VALUES (78, 'The Cracker Box', 'Liu Wong', '55 Grizzly Peak Rd.', 'Butte', '59801', 'USA');`,
                `INSERT INTO customers (CustomerID, CustomerName, ContactName, Address, City, PostalCode, Country) VALUES (79, 'Toms Spezialitäten', 'Karin Josephs', 'Luisenstr. 48', 'Münster', '44087', 'Germany');`,
                `INSERT INTO customers (CustomerID, CustomerName, ContactName, Address, City, PostalCode, Country) VALUES (80, 'Tortuga Restaurante', 'Miguel Angel Paolino', 'Avda. Azteca 123', 'México D.F.', '05033', 'Mexico');`,
                `INSERT INTO customers (CustomerID, CustomerName, ContactName, Address, City, PostalCode, Country) VALUES (81, 'Tradição Hipermercados', 'Anabela Domingues', 'Av. Inês de Castro, 414', 'São Paulo', '05634-030', 'Brazil');`,
                `INSERT INTO customers (CustomerID, CustomerName, ContactName, Address, City, PostalCode, Country) VALUES (82, 'Trail''s Head Gourmet Provisioners', 'Helvetius Nagy', '722 DaVinci Blvd.', 'Kirkland', '98034', 'USA');`,
                `INSERT INTO customers (CustomerID, CustomerName, ContactName, Address, City, PostalCode, Country) VALUES (83, 'Vaffeljernet', 'Palle Ibsen', 'Smagsløget 45', 'Århus', '8200', 'Denmark');`,
                `INSERT INTO customers (CustomerID, CustomerName, ContactName, Address, City, PostalCode, Country) VALUES (84, 'Victuailles en stock', 'Mary Saveley', '2, rue du Commerce', 'Lyon', '69004', 'France');`
        ];
        for (let i = 0; i < insertStatements.length; i++) {
            await context.db.executeAsync(insertStatements[i], null);
        }

        let customers = await context.model('Customers')
            .where('CustomerName').startsWith('To')
            .silent()
            .getItems();
        expect(customers.length).toEqual(2);

        customers = await context.model('Customers')
            .where('CustomerName').endsWith('Box')
            .silent()
            .getItems();
        expect(customers.length).toEqual(1);

        customers = await context.model('Customers')
            .where('CustomerName').contains('Spezial')
            .silent()
            .getItems();
        expect(customers.length).toEqual(1);

        customers = await context.model('Customers')
            .where('CustomerName').indexOf('Toms').equal(0)
            .silent()
            .getItems();
        expect(customers.length).toEqual(1);

        customers = await context.model('Customers')
            .where('CustomerName').substr(0, 4).equal('Toms')
            .silent()
            .getItems();
        expect(customers.length).toEqual(1);

        customers = await context.model('Customers')
            .where('CustomerName').concat(' Test').equal('The Cracker Box Test')
            .silent()
            .getItems();
        expect(customers.length).toEqual(1);

        customers = await context.model('Customers')
            .where('ContactName').length().equal(8)
            .silent()
            .getItems();
        expect(customers.length).toEqual(1);

        customers = await context.model('Customers')
            .where('CustomerName').notContains('T').equal(8)
            .silent()
            .getItems();
        expect(customers.length).toEqual(2);

        // clear customers
        await context.db.executeAsync('DELETE FROM `Customers`', null);

    });

    it('should use DataModel.select()', async () => {

        // noinspection SpellCheckingInspection
        const newCustomer = {
            CustomerID: 90,
            CustomerName: 'Wilman Kala',
            ContactName: 'Matti Karttunen',
            Address: 'Keskuskatu 45',
            City: 'Helsinki',
            PostalCode: '21240',
            Country: 'Finland'
        };
        await context.model('Customers').silent().insert(newCustomer);

        // INSERT INTO `orders` (`OrderID`, `CustomerID`, `EmployeeID`, `OrderDate`, `ShipperID`) VALUES
        // (10248, 90, 5, '1996-07-04', 3);
        const newOrder = {
            OrderID: 10248,
            Customer: 90,
            Employee: 5,
            OrderDate: new Date('1996-07-04'),
            Shipper: 3
        };
        await context.model('Orders').silent().insert(newOrder);

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

        await context.model('Customers').silent().remove(newCustomer);
        await context.model('Orders').silent().remove(newOrder);

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
