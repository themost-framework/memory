/**
 * MOST Web Framework 2.0 Codename Blueshift
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */
declare interface AdapterExecuteCallback {
    ( error?: Error, result?: any ) : void;
}
declare interface TransactionFunctionCallback {
    ( error?: Error ) : void;
}

declare interface TransactionFunction {
    () : Promise<any>;
}

declare interface ExistsCallback {
    ( error?: Error, result?: boolean ) : void;
}

declare interface HasSequenceCallback {
    ( error?: Error, result?: boolean ) : void;
}

declare interface ColumnsCallback {
    ( error?: Error, result?: Array<MemoryAdapterColumn> ) : void;
}

declare interface VersionCallback {
    ( error?: Error, result?: string ) : void;
}

declare interface MemoryAdapterColumn {
    name: string,
    ordinal: number,
    type: string,
    size?: string;
    scale?: number;
    nullable?: boolean,
    primary?: boolean
}

declare interface MemoryAdapterTable {
    exists(callback: ExistsCallback): void;
    existsAsync(): Promise<boolean>;
    columns(callback: ColumnsCallback): void;
    columnsAsync(): Promise<Array<MemoryAdapterColumn>>;
    version(callback: VersionCallback): void;
    versionAsync(): Promise<string>;
    hasSequence(callback: HasSequenceCallback): void;
    hasSequenceAsync(): Promise<boolean>;
    indexes?: Array<MemoryAdapterTableIndex>
}

declare interface MemoryAdapterView {
    exists(callback: ExistsCallback): void;
    existsAsync(): Promise<boolean>;
    drop(callback: AdapterExecuteCallback): void;
    dropAsync(): Promise<void>;
    create(query: any, callback: AdapterExecuteCallback): void;
    createAsync(query: any): Promise<void>;
}

declare interface MemoryAdapterTableIndex {
    name: string;
    columns: Array<string>;
}

declare interface IndexesCallback {
    ( error?: Error, result?: Array<MemoryAdapterTableIndex> ) : void;
}

declare interface MemoryAdapterTableIndexes {
    list(callback: IndexesCallback): void;
    listAsync(): Promise<Array<MemoryAdapterTableIndex>>;
    drop(name: string, callback: AdapterExecuteCallback): void;
    dropAsync(name: string): Promise<void>;
    create(name: string, columns: Array<string>|string, callback: AdapterExecuteCallback): void;
    createAsync(name: string, columns: Array<string>|string): Promise<void>;
}

declare interface MemoryAdapterAlterColumn {
    name: string;
    type: string;
    nullable?: boolean;
    primary?: boolean;
    size?: string;
    scale?: number;
}

declare interface MemoryAdapterRemoveColumn {
    name: string;
}

declare interface MemoryAdapterMigration {
    appliesTo: string;
    model: string;
    description?: string;
    version: string;
    updated?: boolean;
    add: Array<MemoryAdapterAlterColumn>;
    remove?: Array<MemoryAdapterRemoveColumn>;
    change?: Array<MemoryAdapterAlterColumn>;
}

/**
 * @class
 */
export declare class MemoryAdapter {
    static formatType(field: MemoryAdapterColumn);
    static isDate(value: any);
    constructor(options: any);
    open(callback: AdapterExecuteCallback): void;
    openAsync(): Promise<void>;
    close(callback: AdapterExecuteCallback): void;
    closeAsync(): Promise<void>;
    prepare(sql: string, values?: Array<any>): string;
    executeInTransaction(transactionFunc: TransactionFunctionCallback, callback: AdapterExecuteCallback): void;
    executeInTransactionAsync(transactionFunc: TransactionFunction): Promise<void>;
    execute(query: any, values: Array<any>, callback: AdapterExecuteCallback): void;
    selectIdentity(entity: string, attribute: string, callback: AdapterExecuteCallback): void;
    selectIdentity(entity: string, attribute: string): Promise<any>;
    executeAsync(query: any, values?: Array<any>): Promise<any>;
    lastIdentity(callback: AdapterExecuteCallback): void;
    lastIdentityAsync(): Promise<any>;
    table(name: string): MemoryAdapterTable;
    view(name: string): MemoryAdapterView;
    indexes(table: string): MemoryAdapterTableIndexes;
    migrate(migration: MemoryAdapterMigration, callback: AdapterExecuteCallback): void;
    migrateAsync(migration: MemoryAdapterMigration): Promise<void>;
    createView(name: string, query: any, callback: AdapterExecuteCallback): void;
    createViewAsync(name: string, query: any): Promise<void>;
}

export declare function createInstance(options: any): MemoryAdapter;
