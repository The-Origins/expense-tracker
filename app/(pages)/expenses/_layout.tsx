import { AppPropsProvider } from "@/context/propContext";
import { fetchCollections } from "@/lib/collectionsUtils";
import { deleteExpenses, getExpenses } from "@/lib/expenseUtils";
import { Expense, QueryParameters } from "@/types/common";
import { Slot } from "expo-router";
import React, { useEffect, useState } from "react";

const ExpensesLayout = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [edited, setEdited] = useState<Set<number>>(new Set());
  const [expenseIndex, setExpenseIndex] = useState<number>(0);
  const [collections, setCollections] = useState<Map<string, number> | null>(
    null
  );
  const [collectionNames, setCollectionNames] = useState<string[]>([]);
  const [expenses, setExpenses] = useState<(Partial<Expense> | undefined)[]>(
    []
  );
  const [collectionSelected, setCollectionSelected] = useState<Set<number>>(
    new Set()
  );
  const [editSelected, setEditSelected] = useState<Set<number>>(new Set());

  const [queryParameters, setQueryParameters] =
    useState<QueryParameters | null>(null);

  useEffect(() => {
    if (queryParameters) {
      setLoading(true);
      const fetchExpenses = async () => {
        console.log("fetched");
        const data = await getExpenses({
          search: queryParameters?.search,
          collection: queryParameters?.collection,
          limit: queryParameters?.limit,
          page: queryParameters?.page,
          ids: queryParameters?.ids,
        });
        setExpenses(data as (Partial<Expense> | undefined)[]);
        setLoading(false);
      };
      fetchExpenses();
    } else {
      setLoading(false);
    }
  }, [queryParameters]);

  const getCollections = async () => {
    console.log("collections fetched");
    let collectionsMap: Map<string, number> = new Map();
    let names: string[] = [];

    const data: { name: string; count: number }[] =
      (await fetchCollections()) as any;
    for (let item of data) {
      collectionsMap.set(item.name, item.count);
      if (
        item.name !== "expenses" &&
        item.name !== "failed" &&
        item.name !== "trash"
      ) {
        names.push(item.name);
      }
    }
    setCollections(collectionsMap);
    setCollectionNames(names);
  };

  const handleDelete = async (mode: "collection" | "edited") => {
    const result = await deleteExpenses(
      collectionSelected,
      editSelected,
      expenses,
      collections,
      mode
    );
    setExpenses(result.expenses);
    setCollectionSelected(result.collectionSelected);
    setEditSelected(result.editedSelected);
    if (collections) {
      setCollections(result.collections);
    }
  };

  return (
    <AppPropsProvider
      value={{
        loading,
        setLoading,
        queryParameters,
        setQueryParameters,
        collectionSelected,
        setCollectionSelected,
        editSelected,
        setEditSelected,
        edited,
        setEdited,
        expenses,
        setExpenses,
        collections,
        setCollections,
        collectionNames,
        setCollectionNames,
        expenseIndex,
        setExpenseIndex,
        handleDelete,
        getCollections,
      }}
    >
      <Slot />
    </AppPropsProvider>
  );
};

export default ExpensesLayout;
