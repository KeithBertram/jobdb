import { BuildUniqueId } from "./dbutils";
export class CategoryDB {
    _db;
    _tableName = "categories";
    _userId;
    constructor(db, custId) {
        this._db = db;
        this._userId = custId;
    }
    // Create a table if it does not exist
    CreateCategoryTable() {
        this._db?.execSync(`CREATE TABLE IF NOT EXISTS ${this._tableName} (_id INTEGER PRIMARY KEY, ` +
            "JobId INTEGER, " +
            "Code TEXT, " +
            "CategoryName TEXT, " +
            "StartDate Date, " +
            "EstPrice NUMBER, " +
            "CategoryStatus TEXT)");
        return "Success";
    }
    async CreateCategory(id, cat) {
        if (!this._db) {
            return "Error";
        }
        console.log("Creating category:", cat);
        let status = "Error";
        await this._db.withExclusiveTransactionAsync(async (tx) => {
            console.log("preparing statement for category");
            const statement = await tx.prepareAsync(`INSERT INTO ${this._tableName} (_id, Code, JobId, CategoryName, EstPrice, CategoryStatus) ` +
                " VALUES ($_id, $Code, $JobId, $CategoryName, $EstPrice, $CategoryStatus)");
            console.log("CreateCategory statement created");
            try {
                cat._id = await BuildUniqueId(tx, this._userId);
                id.value = cat._id;
                console.log("BuildUniqueId for category returned :", cat._id);
                if (cat._id > -1n) {
                    await statement.executeAsync(cat._id?.toString(), cat.Code, cat.JobId ? cat.JobId.toString() : null, cat.CategoryName, cat.EstPrice ? cat.EstPrice.toString() : null, cat.CategoryStatus);
                    status = "Success";
                }
            }
            catch (error) {
                status = "Error";
                console.error("Error creating category:", error);
            }
            finally {
                statement.finalizeAsync();
            }
        });
        return status;
    }
    async UpdateCategory(cat) {
        if (!this._db) {
            return "Error";
        }
        let status = "Error";
        console.log("Updating category:", cat._id);
        await this._db.withExclusiveTransactionAsync(async (tx) => {
            console.log("Inside withExclusiveTransactionAsync for category:", cat._id);
            const statement = await tx.prepareAsync(`update ${this._tableName} set ` +
                " jobId = $JobId, code = $Code, categoryname = $CategoryName, " +
                " EstPrice = $EstPrice, categoryStatus = $CategoryStatus" +
                " where _id = $_id");
            console.log("Updating category statement created for:", cat._id);
            try {
                let result = await statement.executeAsync(cat.JobId ? cat.JobId.toString() : null, cat.Code, cat.CategoryName, cat.EstPrice ? cat.EstPrice.toString() : null, cat.CategoryStatus, cat._id ? cat._id.toString() : null);
                if (result.changes > 0) {
                    console.log(`Category updated: ${cat._id}. Changes = ${result.changes}`);
                    status = "Success";
                }
                else {
                    console.log(`Category updated: ${cat._id}. Changes = ${result.changes}`);
                    status = "NoChanges";
                }
            }
            catch (error) {
                console.error("Error updating category:", error);
                status = "Error";
            }
            finally {
                statement.finalizeAsync();
            }
        });
        console.log("Returning from update statement:", cat._id);
        return status;
    }
    async DeleteCategory(id) {
        if (!this._db) {
            return "Error";
        }
        let status = "Error";
        console.log("Deleting category:", id);
        await this._db.withExclusiveTransactionAsync(async (tx) => {
            console.log("Inside withExclusiveTransactionAsync for category:", id);
            const statement = await tx.prepareAsync(`delete from ${this._tableName} where _id = $id`);
            console.log("Delete category statement created for:", id);
            try {
                let result = await statement.executeAsync(id ? id.toString() : null);
                if (result.changes > 0) {
                    console.log(`Category deleted: ${id}. Changes = ${result.changes}`);
                    status = "Success";
                }
                else {
                    console.log(`Category deleted: ${id}. Changes = ${result.changes}`);
                    status = "NoChanges";
                }
            }
            catch (error) {
                console.error("Error deleting category:", error);
                status = "Error";
            }
            finally {
                statement.finalizeAsync();
            }
        });
        console.log("Returning from delete statement:", id);
        return status;
    }
    async FetchAllCategories(jobId, categories) {
        if (!this._db) {
            return "Error";
        }
        let status = "Error";
        await this._db.withExclusiveTransactionAsync(async (tx) => {
            const statement = await this._db?.prepareAsync(`select _id, jobid, code, categoryname, EstPrice, CategoryStatus from ${this._tableName} where JobId = $JobId`);
            try {
                const result = await statement?.executeAsync(jobId.toString());
                if (result) {
                    await result.getAllAsync().then((rows) => {
                        for (const row of rows) {
                            categories.push({
                                _id: BigInt(row._id),
                                JobId: BigInt(row.JobId),
                                Code: row.Code,
                                CategoryName: row.CategoryName,
                                EstPrice: row.EstPrice,
                                CategoryStatus: row.CategoryStatus,
                            });
                        }
                    });
                }
                status = "Success";
            }
            catch (error) {
                console.error("Error fetching categories:", error);
                status = "Error";
            }
            finally {
                statement?.finalizeAsync();
            }
        });
        return status;
    }
}
