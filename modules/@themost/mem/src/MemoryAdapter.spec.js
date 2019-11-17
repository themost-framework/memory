import {MemoryAdapter} from "./MemoryAdapter";
import {promisify} from 'es6-promisify';

describe('MemoryAdapter', ()=> {
   it('should create instance', () => {
      const adapter = new MemoryAdapter({
         name: "memory-db"
      });
      expect(adapter).toBeTruthy();
   });
   it('should MemoryAdapter.open()', async () => {
      const adapter = new MemoryAdapter({
         name: "memory-db"
      });
      await adapter.openAsync();
      expect(adapter.rawConnection).toBeTruthy();
   });
   it('should MemoryAdapter.close()', async () => {
      const adapter = new MemoryAdapter({
         name: "memory-db"
      });
      await adapter.openAsync();
      await adapter.closeAsync();
      expect(adapter.rawConnection).toBeFalsy();
   });
   it('should MemoryAdapter.table().exists()', async () => {
      const adapter = new MemoryAdapter({
         name: "memory-db"
      });
      await adapter.openAsync();
      const result = await adapter.table('Table1').existsAsync();
      expect(result).toBeFalsy();
      await adapter.closeAsync();
   });

   it('should MemoryAdapter.migrate()', async () => {
      const adapter = new MemoryAdapter({
         name: "memory-db"
      });
      await adapter.openAsync();
      await adapter.migrateAsync({
         model: 'Table1',
         appliesTo: 'Table1',
         version: '1.0',
         add: [
             {
               name: 'id',
               primary: true,
               type: 'Counter'
            },
            {
               name: 'name',
               nullable: false,
               type: 'Text'
            }
         ]
      });
      const exists = await adapter.table('Table1').existsAsync();
      expect(exists).toBeTruthy();
      // validate migrations table
      let result = await adapter.table('migrations').existsAsync();
      expect(result).toBeTruthy();
      // drop Table1
      await adapter.executeAsync('DROP TABLE `Table1`');
      result = await adapter.table('Table1').existsAsync();
      expect(result).toBeFalsy();
      // drop migrations
      await adapter.executeAsync('DROP TABLE `migrations`');
      MemoryAdapter.supportMigrations = false;
      // close
      await adapter.closeAsync();
   });

   it('should MemoryAdapter.table().columns()', async () => {
      const adapter = new MemoryAdapter({
         name: 'memory-db'
      });
      await adapter.openAsync();
      let exists = await adapter.table('Table1').existsAsync();
      expect(exists).toBeFalsy();
      await adapter.migrateAsync({
         model: 'Table1',
         appliesTo: 'Table1',
         version: '1.0',
         add: [
            {
               name: 'id',
               primary: true,
               type: 'Counter'
            },
            {
               name: 'name',
               nullable: false,
               type: 'Text'
            }
         ]
      });
      exists = await adapter.table('Table1').existsAsync();
      expect(exists).toBeTruthy();
      const columns = await adapter.table('Table1').columnsAsync();
      expect(columns).toBeTruthy();
      expect(columns.length).toEqual(2);
      await adapter.executeAsync('DROP TABLE `Table1`');
      // drop migrations
      await adapter.executeAsync('DROP TABLE `migrations`');
      MemoryAdapter.supportMigrations = false;
      await adapter.closeAsync();
   });

   it('should MemoryAdapter.indexes()', async () => {
      const adapter = new MemoryAdapter({
         name: 'memory-db'
      });
      await adapter.openAsync();
      let exists = await adapter.table('Table1').existsAsync();
      expect(exists).toBeFalsy();
      await adapter.migrateAsync({
         model: 'Table1',
         appliesTo: 'Table1',
         version: '1.0',
         add: [
            {
               name: 'id',
               primary: true,
               type: 'Counter'
            },
            {
               name: 'name',
               nullable: false,
               type: 'Text'
            }
         ]
      });
      exists = await adapter.table('Table1').existsAsync();
      expect(exists).toBeTruthy();
      await adapter.indexes('Table1').createAsync('IX_NAME', [ 'name' ]);
      let list = await adapter.indexes('Table1').listAsync();
      expect(list).toBeTruthy();
      expect(list.length).toEqual(1);
      expect(list[0]).toEqual({
         name: 'IX_NAME',
         columns: [
             'name'
         ]
      });
      await adapter.indexes('Table1').dropAsync('IX_NAME');
      list = await adapter.indexes('Table1').listAsync();
      expect(list).toBeTruthy();
      expect(list.length).toEqual(0);
      await adapter.executeAsync('DROP TABLE `Table1`');
      // drop migrations
      await adapter.executeAsync('DROP TABLE `migrations`');
      MemoryAdapter.supportMigrations = false;
      await adapter.closeAsync();
   });

});
