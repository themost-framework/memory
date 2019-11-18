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
    it('should use date values', async () => {
        const model = context.model('Employees');
        // noinspection SpellCheckingInspection
        const newItem = {
            EmployeeID: 1,
            LastName: 'Davolio',
            FirstName: 'Nancy',
            BirthDate: new Date('1968-12-08'),
            Photo: 'EmpID1.pic',
            Notes: 'Education includes a BA in psychology from Colorado State University. ' +
                'She also completed (The Art of the Cold Call). Nancy is a member of \'' +
            'Toastmasters International\'.'
        };
        await model.silent().insert(newItem);
        let item = await model.where('EmployeeID').equal(1).silent().getItem();
        expect(item).toBeTruthy();
        await model.remove(item);
        item = await model.where('EmployeeID').equal(1).silent().getItem();
        expect(item).toBeFalsy();
    });
    it('should use associations', async () => {
        // noinspection SpellCheckingInspection
        const newEmployee = {
            EmployeeID: 5,
            LastName: 'Buchanan',
            FirstName: 'Steven',
            BirthDate: new Date('1955-03-04'),
            Photo: 'EmpID5.pic',
            Notes: 'Steven Buchanan graduated from St. Andrews University, Scotland, with a BSC degree. ' +
                'Upon joining the company as a sales representative, he spent 6 months in an orientation ' +
                'program at the Seattle office and then returned to his permanent post in London, ' +
                'where he was promoted to sales manager. Mr. Buchanan has completed the courses \'' +
            'Successful Telemarketing\''
        };
        await context.model('Employees').silent().insert(newEmployee);
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

        // INSERT INTO `shippers` (`ShipperID`, `ShipperName`, `Phone`) VALUES
        // (1, 'Speedy Express', '(503) 555-9831'),
        //     (2, 'United Package', '(503) 555-3199'),
        //     (3, 'Federal Shipping', '(503) 555-9931');

        const newShipper = {
            ShipperID: 3,
            ShipperName: 'Federal Shipping',
            Phone: '(503) 555-9931'
        };
        await context.model('Shippers').silent().insert(newShipper);

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

        await context.model('Employees').silent().remove(newEmployee);
        await context.model('Customers').silent().remove(newCustomer);
        await context.model('Shippers').silent().remove(newShipper);
        await context.model('Orders').silent().remove(newOrder);

    });

    it('should use date functions', async () => {
        // noinspection SpellCheckingInspection
        const newEmployee = {
            EmployeeID: 5,
            LastName: 'Buchanan',
            FirstName: 'Steven',
            BirthDate: new Date('1955-03-04'),
            Photo: 'EmpID5.pic',
            Notes: 'Steven Buchanan graduated from St. Andrews University, Scotland, with a BSC degree. ' +
                'Upon joining the company as a sales representative, he spent 6 months in an orientation ' +
                'program at the Seattle office and then returned to his permanent post in London, ' +
                'where he was promoted to sales manager. Mr. Buchanan has completed the courses \'' +
                'Successful Telemarketing\''
        };
        await context.model('Employees').silent().insert(newEmployee);
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

        // INSERT INTO `shippers` (`ShipperID`, `ShipperName`, `Phone`) VALUES
        // (1, 'Speedy Express', '(503) 555-9831'),
        //     (2, 'United Package', '(503) 555-3199'),
        //     (3, 'Federal Shipping', '(503) 555-9931');

        const newShipper = {
            ShipperID: 3,
            ShipperName: 'Federal Shipping',
            Phone: '(503) 555-9931'
        };
        await context.model('Shippers').silent().insert(newShipper);

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

        await context.model('Employees').silent().remove(newEmployee);
        await context.model('Customers').silent().remove(newCustomer);
        await context.model('Shippers').silent().remove(newShipper);
        await context.model('Orders').silent().remove([
            {
                OrderID: 10248
            },
            {
                OrderID: 10249
            }
        ]);

    });

    it('should use DataModel.select()', async () => {
        // noinspection SpellCheckingInspection
        const newEmployee = {
            EmployeeID: 5,
            LastName: 'Buchanan',
            FirstName: 'Steven',
            BirthDate: new Date('1955-03-04'),
            Photo: 'EmpID5.pic',
            Notes: 'Steven Buchanan graduated from St. Andrews University, Scotland, with a BSC degree. ' +
                'Upon joining the company as a sales representative, he spent 6 months in an orientation ' +
                'program at the Seattle office and then returned to his permanent post in London, ' +
                'where he was promoted to sales manager. Mr. Buchanan has completed the courses \'' +
                'Successful Telemarketing\''
        };
        await context.model('Employees').silent().insert(newEmployee);
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

        // INSERT INTO `shippers` (`ShipperID`, `ShipperName`, `Phone`) VALUES
        // (1, 'Speedy Express', '(503) 555-9831'),
        //     (2, 'United Package', '(503) 555-3199'),
        //     (3, 'Federal Shipping', '(503) 555-9931');

        const newShipper = {
            ShipperID: 3,
            ShipperName: 'Federal Shipping',
            Phone: '(503) 555-9931'
        };
        await context.model('Shippers').silent().insert(newShipper);

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

        const order = await context.model('Orders')
            .where('OrderID').equal(10248)
            .select('OrderID',
                'CustomerID/CustomerName as CustomerName')
            .silent().getItem();
        expect(order).toBeTruthy();
        expect(order.OrderID).toBeTruthy();
        expect(order.CustomerName).toBeTruthy();

        await context.model('Employees').silent().remove(newEmployee);
        await context.model('Customers').silent().remove(newCustomer);
        await context.model('Shippers').silent().remove(newShipper);
        await context.model('Orders').silent().remove(newOrder);

    });

});
