import { DictionaryItem, Expense } from "@/constants/common";
import db from "@/db/schema";
import { nanoid } from "nanoid/non-secure";

export const getDictionaryRecipients = async (
  search?: string,
  page: number = 1,
  limit: number = 5
) => {
  const offset = (page - 1) * limit;
  const results: DictionaryItem[] = await db.getAllAsync(
    `SELECT * FROM dictionary ${search ? `WHERE recipient LIKE '%${search}%' OR category LIKE '%${search}%' OR title LIKE '%${search}%'` : ""} ORDER BY recipient DESC LIMIT ${limit} OFFSET ${offset}`
  );
  return results;
};

export const getDictionaryKeywords = async (
  search?: string,
  page: number = 1,
  limit: number = 5
) => {
  const offset = (page - 1) * limit;
  const results: DictionaryItem[] = await db.getAllAsync(
    `SELECT * FROM keywords ${search ? `WHERE keyword LIKE '%${search}%' OR category LIKE '%${search}%' OR title LIKE '%${search}%'` : ""} ORDER BY keyword DESC LIMIT ${limit} OFFSET ${offset}`
  );
  return results;
};

export const parseData = (
  data: {
    recipients: DictionaryItem[];
    keywords: DictionaryItem[];
  },
  collapsed: {
    keywords: boolean;
    recipients: boolean;
  }
) => {
  let filtered: {
    type: "keywords" | "recipients";
    data: number[];
  }[] = [];
  let ids: { keywords: string[]; recipients: string[] } = {
    keywords: [],
    recipients: [],
  };

  let names: { keywords: Set<string>; recipients: Set<string> } = {
    keywords: new Set(),
    recipients: new Set(),
  };

  const indices: {
    keywords: number[];
    recipients: number[];
  } = {
    keywords: [],
    recipients: [],
  };

  const maxLength = Math.max(data.keywords.length, data.recipients.length);

  for (let i = 0; i < maxLength; i++) {
    const keyword = data.keywords[i];
    const recipient = data.recipients[i];
    if (keyword && (!collapsed.keywords || i <= 5)) {
      indices.keywords.push(i);
      ids.keywords.push(keyword.id);
      if (keyword.keyword) {
        names.keywords.add(keyword.keyword);
      }
    }
    if (recipient && (!collapsed.recipients || i <= 5)) {
      indices.recipients.push(i);
      ids.recipients.push(recipient.id);
      if (recipient.recipient) {
        names.recipients.add(recipient.recipient);
      }
    }
  }

  filtered = [
    { type: "keywords", data: indices.keywords },
    { type: "recipients", data: indices.recipients },
  ];

  return { filtered, ids };
};

export const updateDictionaryItem = async (
  item: Partial<DictionaryItem>,
  type: "keyword" | "recipient",
  mode: "add" | "update"
) => {
  item.id = item.id || nanoid();
  if (mode === "add") {
    await db.runAsync(
      `INSERT OR IGNORE INTO ${type === "keyword" ? "keywords" : "dictionary"} (id, ${type}, title, category) VALUES (?, ?, ?, ?)`,
      item.id,
      item[type] || null,
      item.title || null,
      item.category || null
    );
  } else {
    await db.runAsync(
      `UPDATE ${type === "keyword" ? "keywords" : "dictionary"} SET ${Object.keys(item).map((key) => `${key} = ?`)} WHERE id = '${item.id}'`,
      Object.values(item)
    );
  }
  return item;
};

export const deleteDictionaryItems = async (
  keywordSelected: Set<string>,
  recipientSelected: Set<string>
) => {
  const query = `
  ${recipientSelected.size ? `DELETE FROM dictionary WHERE id IN (${[...recipientSelected].map((id) => `'${id}'`)});` : ""}
  ${keywordSelected.size ? `DELETE FROM keywords WHERE id IN (${[...keywordSelected].map((id) => `'${id}'`)});` : ""}
  `;
  await db.execAsync(query);
};
