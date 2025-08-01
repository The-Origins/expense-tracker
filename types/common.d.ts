export type Scope = "today" | "this month" | "this year" | "all";

export type ExpensesFilter = "All" | "un-edited" | "Errors";

export type Expense = {
  id: string;
  title: string;
  category: string;
  recipient: string;
  ref: string;
  collection: string;
  amount: number;
  currency: string;
  date: string;
  receipt: string;
  image: string;
};

export type ExpenseForm = {
  title: string;
  category: string;
  amount: string;
  recipient: string;
  ref: string;
  receipt: string;
  date: Date;
  image: string;
};

export type ExpenseFormErrors = {
  title: string;
  category: string;
  amount: string;
  recipient: string;
  ref: string;
  receipt: string;
};

export type QueryParameters = {
  search?: string;
  collection?: string;
  limit?: number;
  page?: number;
  ids?: string[];
};

export type ReceiptModal = {
  open: boolean;
  receipt: string;
  image: string;
};

export type DateParts = {
  year?: number;
  month?: number;
  date?: number;
};

export type Status = {
  open: boolean;
  type: "loading" | "info" | "success" | "warning" | "error" | "confirm";
  title?: string;
  message?: string;
  handleClose: () => void;
  action: {
    title?: string;
    callback: () => void;
  };
};

export type BudgetForm = {
  total: string;
  title: string;
  start: Date;
  end: Date;
};

export type Statistic = {
  path: string;
  total: number;
};

export type StatisticsOption = { value: number; label: string };

export type Budget = {
  id: string;
  start: string;
  end: string;
  title: string;
  total: number;
  current: number;
  itemsTotal: number;
};

export type BudgetItem = {
  id: string;
  budgetId: string;
  category: string;
  total: number;
  current: number;
};

export type DictionaryItem = {
  id: string;
  recipient?: string;
  keyword?: string;
  title?: string;
  category?: string;
};

export type Notification = {
  id: string;
  type: "info" | "error";
  path: string;
  title: string;
  message: string;
  date: string;
  unread: boolean;
};
