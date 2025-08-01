import db from "@/db/schema";
import { Expense } from "@/types/common";

export const fetchCollections = async (collection?: string) => {
  let query = `SELECT * FROM collections`;
  if (collection) {
    query += ` WHERE name = '${collection}' `;
  }
  query += " ORDER BY count DESC ";
  return await db.getAllAsync(query);
};

export const addToCollection = async (collection: string) => {
  await db.execAsync(`
        INSERT OR IGNORE INTO collections (name, count) VALUES ('${collection}', 0);
        UPDATE collections SET count = count + 1 WHERE name = '${collection}';
        `);
};

export const removeFromCollection = async (collection: string) => {
  await db.runAsync(`
        UPDATE collections SET count = count - 1 WHERE name = '${collection}'
        `);
};

export const createCollection = async (collection: string) => {
  await db.runAsync(`
        INSERT OR IGNORE INTO collections (name, count) VALUES ('${collection}', 0);`);
};

export const deleteCollections = async (
  selected: Set<string>,
  collections: Map<string, number>,
  collectionNames: string[]
) => {
  collections = new Map(collections);
  const selectedStr = [...selected].map((item) => `'${item}'`).join(", ");
  await db.execAsync(`
    UPDATE expenses SET collection = 'expenses' WHERE collection IN (${selectedStr});
    DELETE FROM collections WHERE name IN (${selectedStr})
    `);

  collectionNames = collectionNames.filter((name) => {
    if (selected.has(name)) {
      collections.delete(name);
      return false;
    } else {
      return true;
    }
  });

  return {
    collections,
    collectionNames,
  };
};

export const updateCollections = async (
  selected: Set<number>,
  collection: string,
  collections: Map<string, number> | null,
  expenses: (Partial<Expense> | undefined)[],
  isExpenses: boolean = false
) => {
  expenses = Array.from(expenses);
  if (collections) {
    collections = new Map(collections);
  }

  await db.withTransactionAsync(async () => {
    let operations = [];
    let ids: string[] = [];
    for (let item of selected) {
      const expense = expenses[item];

      if (expense && expense.collection) {
        ids.push(expense.id || "");
        if (expense.collection !== "expenses") {
          operations.push(removeFromCollection(expense.collection || ""));
          if (collections) {
            collections.set(
              expense.collection,
              (collections.get(expense.collection) || 1) - 1
            );
          }
        }

        if (isExpenses) {
          expense.collection = collection;
        } else {
          expenses[item] = undefined;
        }
      }
    }
    operations.push(
      db.execAsync(`
      UPDATE expenses SET collection = '${collection}' WHERE id IN (${ids.map((id) => `'${id}'`)});
      UPDATE collections SET count = count + ${ids.length} WHERE name = '${collection}'
      `)
    );
    if (collections) {
      collections.set(
        collection,
        (collections.get(collection) || 0) + ids.length
      );
    }
    await Promise.all(operations);
  });

  return { expenses, collections };
};
