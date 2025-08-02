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

    INSERT OR IGNORE INTO collections (name, count) VALUES ('expenses', 0);
    INSERT OR IGNORE INTO collections (name, count) VALUES ('failed', 0);
    INSERT OR IGNORE INTO collections (name, count) VALUES ('trash', 0);

    DROP TABLE statistics;
    CREATE TABLE IF NOT EXISTS statistics (
      path TEXT PRIMARY KEY,
      value INTEGER,
      total REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dictionary (
        id TEXT,
        recipient TEXT,
        title TEXT,
        category TEXT,
        PRIMARY KEY (id, recipient)
      );
    
      
    CREATE TABLE IF NOT EXISTS keywords (
        id TEXT,
        keyword TEXT,
        title TEXT,
        category TEXT,
        PRIMARY KEY (id, keyword)
      );

      
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        title TEXT,
        total REAL ,
        current REAL ,
        start TEXT,
        end TEXT,
        itemsTotal REAL
      );

      CREATE TABLE IF NOT EXISTS budget_items (
        id TEXT,
        budgetId TEXT,
        category TEXT ,
        total REAL ,
        current REAL ,
        PRIMARY KEY (id, budgetId)
      );

      
      CREATE TABLE IF NOT EXISTS preferences (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      type TEXT,
      path TEXT,
      title TEXT,
      message TEXT,
      date TEXT,
      unread BOOLEAN
      );

      INSERT OR IGNORE INTO notifications (id,type,path,title,message,date,unread ) VALUES ('1','info','/expenses/display/collections','new expenses','5 new expenses added today','2025-07-30T05:54:18.926Z',true);
      INSERT OR IGNORE INTO notifications (id,type,path,title,message,date,unread ) VALUES ('2','error','/expenses/display/collections','failed expenses','2 expenses failed','2025-07-30T06:54:18.926Z',false);
      `);
    console.log("end");
  } catch (error) {
    console.error(error);
  }
};

export default db;
