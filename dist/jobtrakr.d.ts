import { SQLiteDatabase } from "expo-sqlite";
import { JobDB } from "./job";
import { CategoryDB } from "./Category";
export type DBStatus = "Success" | "Error" | "NoChanges";
export declare class JobTrakrDB {
    private _db;
    private _dbName;
    private _customerId;
    private _jobDB;
    private _categoryDB;
    constructor(custId: number);
    DeleteDatabase: () => Promise<void>;
    CopyFileToDownloads: () => Promise<void>;
    OpenDatabase(): Promise<DBStatus>;
    GetDb(): SQLiteDatabase | null;
    CreateAutoIncrementTable(): void;
    GetJobDB(): JobDB;
    GetCategoryDB(): CategoryDB;
}
