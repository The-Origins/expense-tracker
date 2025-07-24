import { Budget, BudgetItem, Expense } from "@/constants/common";
import db from "@/db/schema";
import { nanoid } from "nanoid/non-secure";

export const getBudgets = async () => {
  const results: Budget[] = await db.getAllAsync(
    `SELECT * FROM budgets ORDER BY start `
  );
  return results;
};

export const getCategories = async (budgetId: string) => {
  const results: BudgetItem[] = await db.getAllAsync(
    `SELECT * FROM budget_items WHERE budgetId = '${budgetId}' ORDER BY category `
  );
  return results;
};

export const updateBudget = async (
  budget: Partial<Budget>,
  mode: "add" | "update"
) => {
  budget.id = budget.id || nanoid();
  if (budget.start && budget.end) {
    const expenses: number[] = await db.getAllAsync(
      `SELECT amount FROM expenses WHERE date >= '${budget.start}' AND date <= '${budget.end}' `
    );
    budget.current = expenses.reduce((sum, value) => sum + value, 0);
  }
  if (mode === "add") {
    await db.runAsync(
      `INSERT into budgets (id, start, end, title, total, current, repeat) VALUES (?, ?, ?, ?, ?, ?, ?) `,
      budget.id || null,
      budget.start || null,
      budget.end || null,
      budget.title || null,
      budget.total || null,
      budget.current || null,
      budget.repeat || null
    );
  } else {
    await db.runAsync(
      `UPDATE budgets SET ${Object.keys(budget).map((key) => `${key} = ?`)}`,
      Object.values(budget)
    );
  }
  return budget;
};

export const updateBudgetItem = async (
  budget: Partial<Budget>,
  item: Partial<BudgetItem>,
  mode: "add" | "update"
) => {
  if (budget.start && budget.end && item.category) {
    const expenses: number[] = await db.getAllAsync(
      `SELECT amount FROM expenses WHERE date >= '${budget.start}' AND date <= '${budget.end}' AND category = '${item.category}'`
    );
    item.current = expenses.reduce((sum, value) => sum + value, 0);
  }
  if (budget.id) {
    if (mode === "add") {
      await db.runAsync(
        `INSERT INTO budget_items (id, budgetId, category, current, total ) VALUES (?, ?, ?, ?, ?)`,
        nanoid(),
        budget.id,
        item.category || null,
        item.current || null,
        item.total || null
      );
    } else {
      if (item.id) {
        await db.runAsync(
          `UPDATE budget_items SET ${Object.keys(item).map((key) => `${key} = ?`)} WHERE id = '${item.id}' `,
          Object.values(item)
        );
      }
    }
  }
  return item;
};

export const updateBudgetsAndItems = async (
  expense: Partial<Expense>,
  action: "delete" | "add" = "add"
) => {
  await db.execAsync(`
        UPDATE budgets SET current = current ${action === "add" ? "+ " : "- "}${expense.amount} WHERE '${expense.date}' >= start AND '${expense.date}' <= end;
        UPDATE buget_categories SET current = current ${action === "add" ? "+ " : "- "}${expense.amount} WHERE category = '${expense.category}'
        `);
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
