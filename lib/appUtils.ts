export const normalizeString = (str: string) => {
  return str.replace(/\s+/g, " ").trim().toLowerCase();
};

export const formatAmount = (amount: number, max: number = 1000) => {
  let suffix = "";
  if (amount > max) {
    if (amount > 1000000000) {
      suffix = "B";
      amount = amount / 1000000000;
    } else if (amount > 1000000) {
      suffix = "M";
      amount = amount / 1000000;
    } else if (amount > 1000) {
      suffix = "K";
      amount = amount / 1000;
    }
  }

  return (
    amount.toLocaleString(undefined, { maximumFractionDigits: 1 }) + suffix
  );
};

export const getDateSuffix = (date: string) => {
  const lastChar = date.slice(-1);
  switch (lastChar) {
    case "1":
      return "st";
    case "2":
      return "nd";
    case "3":
      return "rd";

    default:
      return "th";
  }
};
