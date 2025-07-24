import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("data.db");

export const init = async () => {
  try {
    console.log("start");
    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        DELETE FROM expenses;
        CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        title TEXT,
        category TEXT,
        recipient TEXT,
        ref TEXT,
        collection TEXT,
        amount REAL,
        currency TEXT,
        date TEXT,
        receipt TEXT,
        image TEXT
      );

    DELETE FROM collections;
    CREATE TABLE IF NOT EXISTS collections (
    name TEXT PRIMARY KEY,
    count INTEGER NOT NULL
    );

    INSERT INTO collections (name, count) VALUES ('expenses', 0);
    INSERT INTO collections (name, count) VALUES ('failed', 0);
    INSERT INTO collections (name, count) VALUES ('trash', 0);

    DELETE FROM statistics;
    CREATE TABLE IF NOT EXISTS statistics (
      path TEXT PRIMARY KEY,
      total REAL NOT NULL
    );

    INSERT INTO statistics (path, total) VALUES ('test', 20);

    CREATE TABLE IF NOT EXISTS dictionary (
        recipient TEXT PRIMARY KEY,
        title TEXT,
        category TEXT
      );
    
      CREATE TABLE IF NOT EXISTS keywords (
        keyword TEXT PRIMARY KEY,
        title TEXT,
        category TEXT
      );

      DROP TABLE budget;
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        title TEXT,
        total REAL NOT NULL,
        current REAL NOT NULL,
        start TEXT,
        end TEXT,
        repeat BOOLEAN,
      );

      DROP TABLE budget_items;
      CREATE TABLE IF NOT EXISTS budget_items (
        id TEXT,
        budgetId TEXT,
        category TEXT NOT NULL,
        total REAL NOT NULL,
        current REAL NOT NULL
        PRIMARY KEY (id, budgetId)
      );

      CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT
      );
      `);
    console.log("end");
  } catch (error) {
    console.error(error);
  }
};

export default db;
