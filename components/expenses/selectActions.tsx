import { Expense, Status } from "@/constants/common";
import { useAppProps } from "@/context/propContext";
import { updateCollections } from "@/lib/collectionsUtils";
import { restoreExpenses } from "@/lib/expenseUtils";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { View } from "react-native";
import StatusModal from "../statusModal";
import ExportModal from "./exportModal";
import MoveModal from "./moveModal";
import SelectAction from "./selectAction";

const SelectActions = ({
  collection,
  selected,
  resetSelected,
}: {
  collection: string;
  selected: Set<number>;
  resetSelected: () => void;
}) => {
  const router = useRouter();
  const appProps = useAppProps();

  const [status, setStatus] = useState<Status>({
    open: false,
    type: "info",
    handleClose() {},
    action: {
      callback() {},
    },
  });
  const [exportModal, setExportModal] = useState<boolean>(false);
  const [moveModal, setMoveModal] = useState<boolean>(false);

  const {
    expenses,
    setExpenses,
    collections,
    collectionNames,
    setCollections,
    setCollectionNames,
    collectionSelected,
    setExpenseIndex,
    handleDelete,
  } = useMemo<{
    expenses: (Partial<Expense> | undefined)[];
    setExpenses: React.Dispatch<
      React.SetStateAction<(Partial<Expense> | undefined)[]>
    >;
    setExpenseIndex: React.Dispatch<React.SetStateAction<number>>;
    collectionSelected: Set<number>;
    collections: Map<string, number> | null;
    collectionNames: string[];
    setCollectionNames: React.Dispatch<React.SetStateAction<string[]>>;
    setCollections: React.Dispatch<
      React.SetStateAction<Map<string, number> | null>
    >;
    handleDelete: (mode: "collection" | "edited") => Promise<void>;
  }>(
    () => ({
      expenses: appProps.expenses,
      setExpenses: appProps.setExpenses,
      collections: appProps.collections,
      collectionNames: appProps.collectionNames,
      setCollections: appProps.setCollections,
      setCollectionNames: appProps.setCollectionNames,
      collectionSelected: appProps.collectionSelected,
      setExpenseIndex: appProps.setExpenseIndex,
      handleDelete: appProps.handleDelete,
    }),
    [appProps]
  );

  const handleMove = () => {
    setMoveModal(true);
  };

  const handleMoveModalSubmit = async (newCollection: string) => {
    setStatus({
      open: true,
      type: "loading",
      title: "Updating",
      message: "Updating expenses",
      handleClose: handleStatusClose,
      action: {
        callback() {},
      },
    });

    try {
      const results = await updateCollections(
        selected,
        newCollection,
        collections,
        expenses,
        collection === "expenses"
      );
      setExpenses(results.expenses);
      if (collections) {
        setCollections(results.collections);
      }
      handleStatusClose();
      resetSelected();
    } catch (error) {
      setStatus({
        open: true,
        type: "error",
        title: "Error Occured",
        message: "An error occured while updating expenses",
        handleClose: handleStatusClose,
        action: {
          callback: handleStatusClose,
        },
      });
    }
  };

  const handleExport = () => {
    setExportModal(true);
  };
  const handleExportModalSubmit = (properties: Set<string>, format: string) => {
    resetSelected();
  };

  const handleEdit = () => {
    if (collectionSelected.size > 1) {
      router.navigate("/expenses/edit/main");
    } else {
      const index = collectionSelected.values().next().value;
      setExpenseIndex(index || 0);
      router.navigate({
        pathname: "/expenses/edit/expense",
        params: { mode: "edit" },
      });
    }
  };

  const handleStatusClose = () => {
    setStatus({
      open: false,
      type: "info",
      handleClose() {},
      action: {
        callback() {},
      },
    });
  };

  const handleRestore = async () => {
    setStatus({
      open: true,
      type: "loading",
      title: "Restoring items",
      message: "This may take a while",
      handleClose: handleStatusClose,
      action: {
        callback() {},
      },
    });

    const results = await restoreExpenses(selected, expenses, collections);
    setExpenses(results.expenses);
    if (collections) {
      setCollections(results.collections);
    }
    handleStatusClose();
    resetSelected();
  };

  const onDelete = () => {
    setStatus({
      open: true,
      type: "warning",
      title: "Delete?",
      message: "Are you sure you want to delete the selected items?",
      handleClose: handleStatusClose,
      action: {
        title: "Delete",
        async callback() {
          setStatus({
            open: true,
            type: "loading",
            title: "Deleting items",
            message: "This may take a while",
            handleClose: handleStatusClose,
            action: {
              callback() {},
            },
          });
          try {
            await handleDelete("collection");
            handleStatusClose();
            resetSelected();
          } catch (error) {
            console.log(error);
            setStatus({
              open: true,
              type: "error",
              title: "Error",
              message: "An error occured.",
              handleClose: handleStatusClose,
              action: { callback: handleStatusClose },
            });
          }
        },
      },
    });
  };

  return (
    <>
      <View className=" p-[10px] bg-paper-light rounded-[20px] flex-row justify-between gap-[20px] dark:bg-paper-dark ">
        {collection === "failed" ? (
          <SelectAction
            type={"delete"}
            handlePress={onDelete}
            disabled={selected.size < 1}
          />
        ) : collection === "trash" ? (
          <SelectAction
            type={"restore"}
            handlePress={handleRestore}
            disabled={selected.size < 1}
          />
        ) : (
          <SelectAction
            type={collection === "expenses" ? "collection" : "move"}
            handlePress={handleMove}
            disabled={selected.size < 1}
          />
        )}
        {collection === "failed" ? (
          <SelectAction
            type="edit"
            handlePress={handleEdit}
            disabled={selected.size < 1}
          />
        ) : collection === "trash" ? (
          <SelectAction
            type="delete"
            handlePress={onDelete}
            disabled={selected.size < 1}
          />
        ) : (
          <SelectAction
            type="export"
            handlePress={handleExport}
            disabled={selected.size < 1}
          />
        )}
        {collection === "trash" || collection === "failed" ? (
          <></>
        ) : (
          <>
            <SelectAction
              type="delete"
              handlePress={onDelete}
              disabled={selected.size < 1}
            />
            <SelectAction
              type="edit"
              handlePress={handleEdit}
              disabled={selected.size < 1}
            />
          </>
        )}
      </View>
      <ExportModal
        open={exportModal}
        handleClose={() => setExportModal(false)}
        handleSubmit={handleExportModalSubmit}
      />
      <MoveModal
        open={moveModal}
        collection={collection}
        handleClose={() => setMoveModal(false)}
        handleSubmit={handleMoveModalSubmit}
      />
      <StatusModal status={status} />
    </>
  );
};

export default SelectActions;
