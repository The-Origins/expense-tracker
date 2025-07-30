import { Budget, BudgetItem, Expense } from "@/constants/common";
import db from "@/db/schema";
import { SQLiteBindParams } from "expo-sqlite";
import { nanoid } from "nanoid/non-secure";

export const getBudgets = async (limit?: number, filterExpired?: boolean) => {
  const results: Budget[] = await db.getAllAsync(
    `SELECT * FROM budgets ${filterExpired ? `WHERE end >= '${new Date().toISOString()}' ` : ""} ORDER BY current DESC ${limit ? `LIMIT ${limit} OFFSET 0` : ""} `
  );
  return results;
};

export const getBudget = async (id: string) => {
  const budget: Budget | null = await db.getFirstAsync(
    `SELECT * FROM budgets WHERE id = '${id}'`
  );
  return budget;
};

export const getCategories = async (budgetId: string) => {
  console.log("budgetId: ", budgetId);
  const results: BudgetItem[] = await db.getAllAsync(
    `SELECT * FROM budget_items WHERE budgetId = '${budgetId}' ORDER BY current DESC `
  );
  return results;
};

export const updateBudget = async (
  budget: Partial<Budget>,
  mode: "add" | "update"
) => {
  budget.id = budget.id || nanoid();
  let operations = [];

  if (budget.start && budget.end) {
    let categoriesCurrent: Record<string, number> = {};
    const [expenses, categories] = (await Promise.all([
      db.getAllAsync(
        `SELECT amount,category FROM expenses WHERE date >= '${budget.start}' AND date <= '${budget.end}' `
      ),
      db.getAllAsync(
        `SELECT category FROM budget_items WHERE budgetId = '${budget.id}'`
      ),
    ])) as [{ amount: number; category: string }[], { category: string }[]];

    let sum = 0;
    for (let expense of expenses) {
      sum += expense.amount;
      categoriesCurrent[expense.category] =
        categoriesCurrent[expense.category] || 0;
      categoriesCurrent[expense.category] += expense.amount;
    }
    budget.current = sum;
    budget.itemsTotal = 0;

    let query = "";
    for (let item of categories) {
      budget.itemsTotal += categoriesCurrent[item.category] || 0;
      query += ` UPDATE budget_items SET current = ${categoriesCurrent[item.category] || 0} WHERE category = '${item.category}' AND budgetId = '${budget.id}'; `;
    }
    console.log("query: ", query);
    operations.push(db.execAsync(query));
  }

  const keys = Object.keys(budget);
  const values = Object.values(budget);

  if (mode === "add") {
    budget.itemsTotal = 0;
    operations.push(
      db.runAsync(
        `INSERT into budgets (${keys.join(", ")}) VALUES (?${", ?".repeat(keys.length - 1)}) `,
        values
      )
    );
  } else {
    operations.push(
      db.runAsync(
        `UPDATE budgets SET ${keys.map((key) => `${key} = ?`)} WHERE id = '${budget.id}'`,
        values
      )
    );
  }

  await Promise.all(operations);
  return budget;
};

export const updateExpiredBudget = async (
  budgetIndex: number,
  budgets: Budget[]
) => {
  console.log("got here");

  const budget = budgets[budgetIndex];
  let startDate = new Date(budget.start);
  let endDate = new Date(budget.end);
  const diff = endDate.getTime() - startDate.getTime();
  startDate = new Date(endDate.setDate(endDate.getDate() + 1));
  endDate = new Date(startDate.getTime() + diff);
  budget.start = startDate.toISOString();
  budget.end = endDate.toISOString();

  const newBudget = await updateBudget(budget, "update");
  console.log(newBudget)
  budgets[budgetIndex] = newBudget as Budget;
  return budgets;
};

export const updateBudgetItem = async (
  budget: Partial<Budget>,
  item: Partial<BudgetItem>,
  mode: "add" | "update",
  previousItem?: Partial<BudgetItem>
) => {
  let operations = [];
  item.id = item.id || nanoid();
  if (budget.start && budget.end && item.category) {
    const expenses: { amount: number }[] = await db.getAllAsync(
      `SELECT amount FROM expenses WHERE date >= '${budget.start}' AND date <= '${budget.end}' AND category = '${item.category}'`
    );
    item.current = expenses.reduce((sum, item) => sum + item.amount, 0);
  }

  if (
    budget.id &&
    budget.total !== undefined &&
    budget.itemsTotal !== undefined &&
    item.total !== undefined
  ) {
    if (mode === "add") {
      budget.itemsTotal += item.total;
      operations.push(
        db.runAsync(
          `INSERT INTO budget_items (id, budgetId, category, current, total ) VALUES (?, ?, ?, ?, ?)`,
          [
            item.id,
            budget.id,
            item.category,
            item.current,
            item.total,
          ] as SQLiteBindParams
        )
      );
    } else {
      if (
        item.id &&
        item.total !== undefined &&
        previousItem &&
        previousItem.total !== undefined
      ) {
        budget.itemsTotal -= previousItem.total;
        budget.itemsTotal += item.total;

        console.log("item: ", item, "prev item: ", previousItem);
        operations.push(
          db.runAsync(
            `UPDATE budget_items SET ${Object.keys(item).map((key) => `${key} = ?`)} WHERE id = '${item.id}' `,
            Object.values(item)
          )
        );
      }
    }

    operations.push(
      db.runAsync(
        `UPDATE budgets SET itemsTotal = ${budget.itemsTotal} WHERE id = '${budget.id}'`
      )
    );

    if (budget.itemsTotal > budget.total) {
      budget.total = budget.itemsTotal;
      operations.push(
        db.runAsync(
          `UPDATE budgets SET total = ${budget.total} WHERE id = '${budget.id}' `
        )
      );
    }
  }

  await Promise.all(operations);
  console.log(item, budget);
  return { item, budget };
};

export const updateBudgetsAndItems = async (
  expense: Partial<Expense>,
  action: "delete" | "add" = "add"
) => {
  let budgets: { id: string }[] = await db.getAllAsync(
    `SELECT id FROM budgets WHERE start <= '${expense.date}'  AND end >=  '${expense.date}'`
  );

  let ids: string[] = budgets.map((item) => `'${item.id}'`);

  if (ids.length) {
    await db.execAsync(
      `UPDATE budgets SET current = current ${action === "add" ? "+ " : "- "}${expense.amount} WHERE id IN (${ids});
      UPDATE budget_items SET current = current ${action === "add" ? "+ " : "- "}${expense.amount} WHERE budgetId IN (${ids}) AND category = '${expense.category}'
      `
    );
  }
};

export const deleteBudgets = async (selected: Set<string>) => {
  const ids = [...selected];
  await Promise.all([
    db.runAsync(
      `DELETE FROM budgets WHERE id IN (? ${`, ?`.repeat(ids.length - 1)})`,
      ids
    ),
    db.runAsync(
      `DELETE FROM budget_items WHERE budgetId IN (? ${`, ?`.repeat(ids.length - 1)})`,
      ids
    ),
  ]);
};

export const deleteBudgetItems = async (selected: Set<string>) => {
  const ids = [...selected];
  await db.runAsync(
    `DELETE FROM budget_items WHERE id IN (? ${`, ?`.repeat(ids.length - 1)})`,
    ids
  );
};
