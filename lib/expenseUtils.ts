import { Expense } from "@/constants/common";
import db from "@/db/schema";
import { nanoid } from "nanoid/non-secure";
import { normalizeString } from "./appUtils";
import { addToCollection, removeFromCollection } from "./collectionsUtils";
import { updateStatistics } from "./statisticsUtils";

export const getExpenses = async ({
  search,
  collection,
  limit,
  page = 1,
  ids,
}: {
  search?: string;
  collection?: string;
  limit?: number;
  page?: number;
  ids?: string[];
}) => {
  let query: string = " SELECT * FROM expenses ";

  if (ids && ids.length) {
    query += ` WHERE id IN (${ids.map((id) => `'${id}'`)}) `;
  }

  if (collection) {
    if (collection !== "expenses") {
      query += ` ${ids?.length ? "AND" : "WHERE"} collection = '${collection}' `;
    } else {
      query += ` ${ids?.length ? "AND" : "WHERE"} collection != 'failed' AND collection != 'trash' `;
    }
  }

  if (search) {
    query += ` ${ids?.length || collection ? "AND" : "WHERE"} 
    (title LIKE '%${search}%'
    OR category LIKE '%${search}%'
    OR recipient LIKE '%${search}%'
    OR ref LIKE '%${search}%'
    OR collection LIKE '%${search}%'
    OR amount LIKE '%${search}%'
    OR date LIKE '%${search}%'
    OR receipt LIKE '%${search}%'
    ) 
    `;
  }

  query += ` 
  ORDER BY date ASC 
  `;

  if (page && limit) {
    const offset = (page - 1) * limit;
    query += ` LIMIT ${limit} OFFSET ${offset}`;
  }
  const expenses = await db.getAllAsync(query);
  return expenses;
};

export const deleteExpenses = async (
  collectionSelected: Set<number>,
  editedSelected: Set<number>,
  expenses: (Partial<Expense> | undefined)[],
  collections: Map<string, number> | null,
  mode: "collection" | "edited"
) => {
  expenses = Array.from(expenses);
  let selection: Set<number> = new Set();

  if (mode === "edited") {
    selection = new Set(editedSelected);
    editedSelected = new Set();
    collectionSelected = new Set(collectionSelected);
  } else {
    selection = new Set(collectionSelected);
    collectionSelected = new Set();
  }

  if (collections) {
    collections = new Map(collections);
  }

  await db.withTransactionAsync(async () => {
    let operations: Promise<void>[] = [];
    for (let item of selection) {
      const expense = expenses[item];
      if (expense) {
        operations.push(
          new Promise(async (resolve) => {
            await updateExpense(expense, "delete");

            if (collections && expense.collection) {
              collections.set(
                expense.collection,
                (collections.get(expense.collection) || 1) - 1
              );
              if (
                expense.collection !== "trash" &&
                expense.collection !== "failed"
              ) {
                collections.set("trash", (collections.get("trash") || 0) + 1);
                collections.set(
                  "expenses",
                  (collections.get("expenses") || 0) - 1
                );
              }
            }
            expenses[item] = undefined;
            resolve();
          })
        );

        if (mode === "edited") {
          collectionSelected.delete(item);
        }
      }
    }
    await Promise.all(operations);
  });

  return { expenses, collections, collectionSelected, editedSelected };
};

export const restoreExpenses = async (
  selected: Set<number>,
  expenses: (Partial<Expense> | undefined)[],
  collections: Map<string, number> | null
) => {
  expenses = Array.from(expenses);
  let ids: string[] = [];

  for (let index of selected) {
    ids.push(`'${expenses[index]?.id}'`);
    expenses[index] = undefined;
  }

  await db.execAsync(`
    UPDATE expenses SET collection = 'expenses' WHERE id IN (${ids});
    UPDATE collections SET count = count + ${selected.size} WHERE name = 'expenses';
    UPDATE collections SET count = count - ${selected.size} WHERE name = 'trash';
    `);

  if (collections) {
    collections = new Map(collections);
    collections.set(
      "expenses",
      (collections.get("expenses") || 0) + selected.size
    );
    collections.set(
      "trash",
      (collections.get("trash") || selected.size) - selected.size
    );
  }
  return { expenses, collections };
};

export const groupExpenseSections = (
  expenses: (Partial<Expense> | undefined)[]
) => {
  let groups: { id: string; data: number[] }[] = [];
  let groupIndex: Record<string, number> = {};
  let indicies: number[] = [];

  for (let i = 0; i < expenses.length; i++) {
    const expense = expenses[i];
    if (!expense) {
      continue;
    }
    const id = expense.date ? new Date(expense.date).toDateString() : "#";
    if (groupIndex[id] === undefined) {
      groupIndex[id] = groups.length;
      groups.push({ id, data: [i] });
    } else {
      groups[groupIndex[id]].data.push(i);
    }
    indicies.push(i);
  }
  return { groups, indicies };
};

export const updateExpense = async (
  expense: Partial<Expense>,
  mode: "add" | "delete" | "update" = "add",
  previousExpense?: Partial<Expense>
) => {
  const operations: Promise<any>[] = [];
  let isTrash = expense.collection === "trash";
  let isFailed = expense.collection === "failed";
  if (mode === "delete" && expense.id) {
    operations.push(
      db.runAsync(
        `
        ${isTrash || isFailed ? "DELETE FROM expenses" : "UPDATE expenses SET collection = 'trash'"} WHERE id = ?
        `,
        expense.id
      )
    );
    if (expense.collection) {
      operations.push(removeFromCollection(expense.collection));
      if (!isTrash && !isFailed) {
        operations.push(addToCollection("trash"));
        operations.push(removeFromCollection("expenses"));
      }
    }
  } else {
    expense.id = expense.id || nanoid();
    const keys = Object.keys(expense);
    const values = Object.values(expense);
    if (mode === "add") {
      operations.push(
        db.runAsync(
          `INSERT INTO expenses (${keys.join(", ")}) VALUES ( ?${", ?".repeat(keys.length - 1)})`,
          values
        )
      );
      if (expense.collection) {
        operations.push(addToCollection(expense.collection));
        if (!isFailed) {
          operations.push(addToCollection("expenses"));
        }
      }
    }
    if (mode === "update" && expense.id) {
      operations.push(
        db.runAsync(
          `
            UPDATE expenses SET ${keys.map((key) => `${key} = ?`)} WHERE id='${expense.id}'
            `,
          values
        )
      );
    }
  }
  console.log("prev: ", previousExpense, "new: ", expense);
  if (!isTrash && !isFailed) {
    if (
      mode === "delete" ||
      (mode === "update" &&
        previousExpense &&
        (previousExpense.amount ||
          previousExpense.title ||
          previousExpense.category))
    ) {
      console.log("deleted");
      updateStatistics(previousExpense || expense, operations, "delete");
    }

    if (
      mode === "add" ||
      (mode === "update" &&
        previousExpense &&
        (expense.amount || expense.title || expense.category))
    ) {
      console.log("added");
      updateStatistics({ ...previousExpense, ...expense }, operations);
    }
  }
  await Promise.all(operations);
};

export const parseReceipts = async (receiptString: string) => {
  const expenses: Partial<Expense>[] = [];
  const receipts: string[] = await new Promise((resolve, reject) => {
    const data = receiptString.split(
      /(?=(\b(?=[A-Z\d]{10}\b)(?=[A-Z\d]*\d)(?=[A-Z\d]*[A-Z])[A-Z\d]{10}))/
    );
    resolve(data);
  });

  await db.withTransactionAsync(async () => {
    const operations = [];
    for (let i = 0; i < receipts.length; i++) {
      let ref = receipts[i];
      let receipt: string;

      if (/^(?=.*\d)[A-Z\d]{10}$/.test(ref)) {
        receipt = receipts[i + 1];
        i++;
        operations.push(handleReceipt(ref, receipt, expenses));
      }
    }
    await Promise.all(operations);
  });
  return expenses;
};

const handleReceipt = async (
  ref: string,
  receipt: string,
  expenses: Partial<Expense>[]
) => {
  receipt = ref + normalizeString(receipt).substring(ref.length);
  if (!/(sent to|paid to|you bought|withdraw)/i.test(receipt)) {
    return;
  }

  let data: Partial<Expense> = await new Promise((resolve, reject) => {
    const result = parseReceipt(receipt);
    resolve(result);
  });

  data = {
    ...data,
    id: nanoid(),
    ref,
    receipt,
    currency: "Ksh",
    ...(await fetchExpenseInfo(data.recipient)),
  };

  if (data.amount === undefined || !data.date || !data.recipient) {
    data.collection = "failed";
  } else {
    data.collection = data.category;
  }
  await updateExpense(data);
  expenses.push(data);
};

const parseReceipt = (receipt: string) => {
  const recipientMatch = receipt.match(
    /to\s+([A-Z0-9\s'/-]+?)(?=\s+on|\.)|from (.+?) new/i
  );
  const amountMatch = receipt.match(/ksh(\d{1,3}(,\d{3})*(\.\d{2})?)/i);
  const transactionCostMatch = receipt.match(
    /transaction cost, ksh(\d{1,3}(,\d{3})*(\.\d{2})?)/i
  );
  const airtimeMatch = receipt.match(
    /you bought ksh\d{1,3}(,\d{3})*(\.\d{2})? of airtime/i
  );
  const dateMatch = receipt.match(/on (\d{1,2}\/\d{1,2}\/\d{2,4})/);
  const timeMatch = receipt.match(/at (\d{1,2}:\d{2} (?:am|pm))/i);

  const recipient: string | undefined =
    recipientMatch?.[1]?.trim() ||
    recipientMatch?.[2]?.trim() ||
    (airtimeMatch ? "safaricom" : undefined);

  const amount: number | undefined =
    Number(amountMatch?.[1].replace(/,/g, "")) +
      Number(transactionCostMatch?.[1].replace(/,/g, "") || 0) || undefined;

  let date = dateMatch?.[1] || null;
  let time = timeMatch?.[1] || null;

  if (time) {
    let [hour, rest] = time.split(":");
    const [minute, ampm] = rest.split(" ");

    hour =
      ampm === "pm"
        ? hour === "12"
          ? "12"
          : String(Number(hour) + 12)
        : hour === "12"
          ? `00`
          : ("0" + hour).slice(-2);
    time = `${hour}:${minute}`;
  }

  if (date) {
    const [day, month, year] = date.split("/");
    date = `${("20" + year).slice(-4)}-${("0" + month).slice(-2)}-${(
      "0" + day
    ).slice(-2)}`;
  }

  let dateTime = undefined;

  if (date && time) {
    const newDate = new Date(`${date}T${time}`);
    if (newDate instanceof Date && !isNaN(Number(newDate))) {
      dateTime = newDate.toISOString();
    }
  }

  return {
    amount,
    recipient,
    date: dateTime,
  };
};

export const fetchExpenseInfo = async (recipient?: string) => {
  if (!recipient) {
    return { title: "", category: "unknown" };
  }

  const dictionaryResult: any = await db.getFirstAsync(
    "SELECT * FROM dictionary WHERE recipient = ? ",
    recipient
  );

  if (dictionaryResult) {
    return {
      title: dictionaryResult.title,
      category: dictionaryResult.category,
    };
  }

  const keywordResult: any = await db.getFirstAsync(
    "SELECT * FROM keywords WHERE ? LIKE '%' || keyword || '%';",
    recipient
  );

  if (keywordResult) {
    return {
      title: keywordResult.title,
      category: keywordResult.category,
    };
  }

  let accountIndex = recipient.indexOf("for account");
  let title = "";

  if (accountIndex !== -1) {
    accountIndex += 12;
    title = recipient.substring(accountIndex);
  } else {
    title = recipient.split(" ").slice(0, 2).join(" ");
  }
  return {
    title,
    category: "unknown",
  };
};
