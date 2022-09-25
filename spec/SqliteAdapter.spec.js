import { QueryExpression } from '@themost/query';
import { MemoryFormatter } from '../src';
import { TestApplication } from './TestApplication';

describe('SqliteAdapter', () => {
    /**
     * @type {TestApplication}
     */
    let app;
    beforeAll(async () => {
        app = new TestApplication(__dirname);
    });
    beforeEach(async () => {
        //
    });
    afterAll(async () => {
        await app.finalize();
    });
    afterEach(async () => {
        //
    });
    
    it('should check table', async () => {
        await app.executeInTestTransaction(async (context) => {
            const exists = await context.db.table('Table1').existsAsync();
            expect(exists).toBeFalsy();
        });
    });

    it('should create table', async () => {
        await app.executeInTestTransaction(async (context) => {
            const db = context.db;
            let exists = await db.table('Table1').existsAsync();
            expect(exists).toBeFalsy();
            await context.db.table('Table1').createAsync([
                {
                    name: 'id',
                    type: 'Counter',
                    primary: true,
                    nullable: false
                },
                {
                    name: 'name',
                    type: 'Text',
                    size: 255,
                    nullable: false
                },
                {
                    name: 'description',
                    type: 'Text',
                    size: 255,
                    nullable: true
                }
            ]);
            exists = await db.table('Table1').existsAsync();
            expect(exists).toBeTruthy();
            // get columns
            const columns = await db.table('Table1').columnsAsync();
            expect(columns).toBeInstanceOf(Array);
            let column = columns.find((col) => col.name === 'id');
            expect(column).toBeTruthy();
            expect(column.nullable).toBeFalsy();
            column = columns.find((col) => col.name === 'description');
            expect(column).toBeTruthy();
            expect(column.nullable).toBeTruthy();
            expect(column.size).toBe(255);
            await db.executeAsync(`DROP TABLE ${new MemoryFormatter().escapeName('Table1')}`);
        });
    });

    it('should create view', async () => {

        await app.executeInTestTransaction(async (context) => {
            const db = context.db;
            let exists = await db.table('Table1').existsAsync();
            expect(exists).toBeFalsy();
            await db.table('Table1').createAsync([
                {
                    name: 'id',
                    type: 'Counter',
                    primary: true,
                    nullable: false
                },
                {
                    name: 'name',
                    type: 'Text',
                    size: 255,
                    nullable: false
                },
                {
                    name: 'description',
                    type: 'Text',
                    size: 255,
                    nullable: true
                }
            ]);
            exists = await db.table('Table1').existsAsync();
            expect(exists).toBeTruthy();

            exists = await db.view('View1').existsAsync();
            expect(exists).toBeFalsy();

            const query = new QueryExpression().select('id', 'name', 'description').from('Table1');
            await db.view('View1').createAsync(query);

            exists = await db.view('View1').existsAsync();
            expect(exists).toBeTruthy();

            await db.view('View1').dropAsync();

            exists = await db.view('View1').existsAsync();
            expect(exists).toBeFalsy();
        });
    });

    it('should create index', async () => {
        await app.executeInTestTransaction(async (context) => {
            const db = context.db;
            let exists = await db.table('Table1').existsAsync();
            expect(exists).toBeFalsy();
            await db.table('Table1').createAsync([
                {
                    name: 'id',
                    type: 'Counter',
                    primary: true,
                    nullable: false
                },
                {
                    name: 'name',
                    type: 'Text',
                    size: 255,
                    nullable: false
                },
                {
                    name: 'description',
                    type: 'Text',
                    size: 255,
                    nullable: true
                }
            ]);
            exists = await db.table('Table1').existsAsync();
            expect(exists).toBeTruthy();

            let list = await db.indexes('Table1').listAsync();
            expect(list).toBeInstanceOf(Array);
            exists = list.findIndex((index) => index.name === 'idx_name') < 0;

            await db.indexes('Table1').createAsync('idx_name', [
                'name'
            ]);

            list = await db.indexes('Table1').listAsync();
            expect(list).toBeInstanceOf(Array);
            exists = list.findIndex((index) => index.name === 'idx_name') >= 0;
            expect(exists).toBeTruthy();

            await db.indexes('Table1').dropAsync('idx_name');

            list = await db.indexes('Table1').listAsync();
            expect(list).toBeInstanceOf(Array);
            exists = list.findIndex((index) => index.name === 'idx_name') >= 0;
            expect(exists).toBeFalsy();

            await db.executeAsync(`DROP TABLE ${new MemoryFormatter().escapeName('Table1')}`);
        });
    });
});
