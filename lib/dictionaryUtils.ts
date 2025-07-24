import { DictionaryItem } from "@/constants/common";
import db from "@/db/schema";
import { nanoid } from "nanoid/non-secure";

export const updateDictionaryItem = async (
  item: DictionaryItem,
  type: "keyword" | "recipient",
  mode: "add" | "update"
) => {
  item.id = item.id || nanoid();
  if (mode === "add") {
    await db.runAsync(
      `INSERT INTO ${type === "keyword" ? "keywords" : "dictionary"} (id, ${type}, title, category) VALUES (?, ?, ?, ?)`,
      item.id,
      item[type] || null,
      item.title || null,
      item.category || null
    );
  } else {
    await db.runAsync(
      `UPDATE ${type === "keyword" ? "keywords" : "dictionary"} SET ${Object.keys(item).map((key) => `key = ?`)} WHERE id = '${item.id}'`,
      Object.values(item)
    );
  }
};

export const deleteDictionaryItems = async (
  selected: Set<string>,
  type: "keyword" | "recipient"
) => {
  const ids = [...selected];
  await db.runAsync(
    `DELETE FROM ${type === "keyword" ? "keywords" : "dictionary"} WHERE id IN (${ids.map((id) => `'${id}'`)})`
  );
};
