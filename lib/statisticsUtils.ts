import { colorCycle, tintColors } from "@/constants/colorSettings";
import db from "@/db/schema";
import { Expense, Statistic } from "@/types/common";

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
}) => {
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

  dataQuery += ` AND total > 0 ORDER BY value ASC `;

  let [statistics, data] = await Promise.all([
    db.getFirstAsync(statisticsQuery),
    db.getAllAsync(dataQuery),
  ]);
  let results = { statistics, data, scope } as {
    statistics: Statistic | null;
    data: Statistic[];
    scope: "year" | "month" | "date" | "";
  };
  return results;
};

export const getCategoryStatistics = async (
  timePath: string,
  category?: string
): Promise<Statistic[]> => {
  const results = await db.getAllAsync(
    `SELECT * FROM statistics WHERE (path LIKE '${timePath}/${category ? `${category}/expenses/%` : "categories/%"}') AND (total > 0 ) ORDER BY total DESC `
  );
  return results as Statistic[];
};

export const months = [
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

export const parseData = (
  dataArr: Statistic[],
  scope?: "year" | "month" | "date" | ""
) => {
  let labels = [""];
  let data = [0];
  let options: { value: number; label: string }[] = [];

  for (let item of dataArr) {
    let value = item.value;
    let label = String(value);

    if (scope === "month") {
      label = months[value];
    }
    if (!scope) {
      switch (value) {
        case 1:
          label = "morning";
          break;
        case 2:
          label = "afternoon";
          break;
        case 3:
          label = "evening";
          break;

        default:
          break;
      }
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
) => {
  let date = new Date(dateString);
  let [year, month, day, hour] = [
    date.getFullYear().toString(),
    date.getMonth().toString(),
    date.getDate().toString(),
    date.getHours(),
  ];
  // let weekStart = date.getDate() - date.getDay();
  // let weekEnd = weekStart + 6;

  let timeOfDay: "morning" | "afternoon" | "evening" =
    hour >= 6 && hour < 12
      ? "morning"
      : hour >= 12 && hour < 18
        ? "afternoon"
        : "evening";

  let values: Record<string, number> = {};

  let paths = ["all"];
  let path: string = "";
  const categoryPath = `/categories/${category}`;
  const expensePath = `/expenses/${expense}`;

  paths.push(`all${categoryPath}`, `all/${category}${expensePath}`);

  path = year;
  paths.push(`years/${path}`);
  values[`years/${path}`] = Number(year);
  paths.push(`${path}${categoryPath}`, `${path}/${category}${expensePath}`);
  paths.push(`${path}/months/${month}`);
  values[`${path}/months/${month}`] = Number(month);
  path += "/" + month;
  paths.push(`${path}${categoryPath}`, `${path}/${category}${expensePath}`);
  paths.push(`${path}/dates/${day}`);
  values[`${path}/dates/${day}`] = Number(day);
  path += "/" + day;
  paths.push(`${path}${categoryPath}`, `${path}/${category}${expensePath}`);
  paths.push(`${path}/times/${timeOfDay}`);
  values[`${path}/times/${timeOfDay}`] =
    timeOfDay === "morning" ? 1 : timeOfDay === "afternoon" ? 2 : 3;
  return { paths, values };
};

export const updateStatistics = (
  expense: Partial<Expense>,
  operations: Promise<any>[],
  mode: "add" | "delete" = "add"
) => {
  if (expense.date && expense.category && expense.title && expense.amount) {
    const { paths, values } = getStatisticsPaths(
      expense.date,
      expense.category,
      expense.title
    );

    let value: number = 0;

    for (let path of paths) {
      value = values[path] === undefined ? value : values[path];
      operations.push(
        db.execAsync(
          `${mode === "add" ? `INSERT OR IGNORE INTO statistics (path, value, total) VALUES ("${path}", "${value}", ${0});` : ""}
          UPDATE statistics SET total = total ${mode === "add" ? "+ " : "- "}${expense.amount} WHERE path="${path}";
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
      ? (tintColors[colorCycle[index % 3] as keyof typeof tintColors] as string)
      : tintColors.paper[theme];
  return { name, color, amount: item.total };
};
