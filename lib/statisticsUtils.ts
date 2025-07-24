import { colorCycle, tintColors } from "@/constants/colorSettings";
import { Expense, Statistic } from "@/constants/common";
import db from "@/db/schema";

export const getTimeStatistics = async ({
  year,
  month,
  week,
  date,
}: {
  year?: number | string;
  month?: number | string;
  week?: string;
  date?: number | string;
}): Promise<{
  statistics: Statistic | null;
  data: Statistic[];
  scope: "year" | "month" | "date" | "";
}> => {
  let scope = "";
  let statisticsQuery = "SELECT * FROM statistics WHERE path = ";
  let dataQuery = "SELECT * FROM statistics WHERE path LIKE ";
  if (year) {
    if (month) {
      if (week) {
      } else {
        if (date) {
          statisticsQuery += `'${year}/${month}/dates/${date}'`;
          dataQuery += `'${year}/${month}/${date}/times/%'`;
        } else {
          scope = "date";
          statisticsQuery += `'${year}/months/${month}'`;
          dataQuery += `'${year}/${month}/dates/%'`;
        }
      }
    } else {
      scope = "month";
      statisticsQuery += `'years/${year}'`;
      dataQuery += `'${year}/months/%'`;
    }
  } else {
    scope = "year";
    statisticsQuery += `'all'`;
    dataQuery += `'years/%'`;
  }
  let [statistics, data] = await Promise.all([
    db.getFirstAsync(statisticsQuery),
    db.getAllAsync(dataQuery),
  ]);
  let results = { statistics, data, scope } as {
    scope: "year" | "month" | "date" | "";
    statistics: Statistic | null;
    data: Statistic[];
  };
  return results;
};

export const getCategoryStatistics = async (
  timePath: string,
  category?: string
): Promise<Statistic[]> => {
  const results = await db.getAllAsync(
    `SELECT * FROM statistics WHERE path LIKE '${timePath}/${category ? `${category}/expenses/%` : "categories/%"}' `
  );
  return results as Statistic[];
};

export const parseData = (
  dataArr: Statistic[],
  scope?: "year" | "month" | "date" | ""
) => {
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "November",
    "December",
  ];
  let labels = [""];
  let data = [0];
  let options: { value: number; label: string }[] = [];

  for (let item of dataArr) {
    let [label] = item.path.split("/").slice(-1);
    let value = Number(label);
    if (scope === "month") {
      label = months[value];
    }
    labels.push(label);
    data.push(item.total);
    options.push({ label, value });
  }
  labels.push("");
  data.push(0);

  return { labels, data, options };
};

export const getStatisticsPaths = (
  dateString: string,
  category: string,
  expense: string
): string[] => {
  let date = new Date(dateString);
  let [year, month, day, hour] = [
    date.getFullYear().toString(),
    date.getMonth().toString(),
    date.getDate().toString(),
    date.getHours(),
  ];
  // let weekStart = date.getDate() - date.getDay();
  // let weekEnd = weekStart + 6;

  let timeOfDay =
    hour >= 6 && hour < 12
      ? "morning"
      : hour >= 12 && hour < 18
        ? "afternoon"
        : "evening";

  let paths = ["all"];
  let path: string = "";
  const categoryPath = `/categories/${category}`;
  const expensePath = `/expenses/${expense}`;

  paths.push(`all${categoryPath}`, `all/${category}${expensePath}`);

  path = year;
  paths.push(`years/${path}`);
  paths.push(`${path}${categoryPath}`, `${path}/${category}${expensePath}`);
  paths.push(`${path}/months/${month}`);
  path += "/" + month;
  paths.push(`${path}${categoryPath}`, `${path}/${category}${expensePath}`);
  paths.push(`${path}/dates/${day}`);
  path += "/" + day;
  paths.push(`${path}${categoryPath}`, `${path}/${category}${expensePath}`);
  paths.push(`${path}/times/${timeOfDay}`);
  return paths;
};

export const updateStatistics = (
  expense: Partial<Expense>,
  operations: Promise<any>[],
  mode: "add" | "delete" = "add"
) => {
  if (expense.date && expense.category && expense.title && expense.amount) {
    const paths = getStatisticsPaths(
      expense.date,
      expense.category,
      expense.title
    );
    console.log("mode: ", mode, "paths: ", paths);
    for (let path of paths) {
      operations.push(
        db.execAsync(
          `${mode === "add" ? `INSERT OR IGNORE INTO statistics (path, total) VALUES ('${path}', ${0});` : ""}
          UPDATE statistics SET total = total ${mode === "add" ? "+ " : "- "}${expense.amount} WHERE path='${path}';
               `
        )
      );
    }
  }
};

export const parseExpenseStatistic = (
  index: number,
  item: Statistic,
  highlight: number | null,
  theme: "light" | "dark"
) => {
  const [name] = item.path.split("/").slice(-1);
  const color =
    !highlight || highlight === index + 1
      ? (tintColors[
          colorCycle[
            (index % 3) as keyof typeof colorCycle
          ] as keyof typeof tintColors
        ] as string)
      : tintColors.paper[theme];
  return { name, color, amount: item.total };
};
