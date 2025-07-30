import db from "@/db/schema";

export const getPreferences = async (...preferences: string[]) => {
  const results: { key: string; value: string }[] = await db.getAllAsync(
    `SELECT * FROM preferences ${preferences.length ? `WHERE key IN (?${", ?".repeat(preferences.length - 1)})` : ""}`,
    preferences
  );

  let record = results.reduce(
    (obj, result) => {
      obj[result.key] = result.value;
      return obj;
    },
    {} as Record<string, string>
  );
  return record;
};

export const setPreferences = async (preferences: Record<string, string>) => {
  const keys = Object.keys(preferences);
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `DELETE FROM preferences WHERE key IN (?${`, ?`.repeat(keys.length - 1)})`
    );

    let query = "";
    for (let key of keys) {
      query += `INSERT INTO preferences (key, value) VALUES ('${key}' ,'${preferences[key]}');`;
    }
    console.log("query: ", query);
    await db.execAsync(query);
  });
};
