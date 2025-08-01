import { Scope } from "@/types/common";
import React, { useMemo } from "react";
import { Pressable } from "react-native";
import ThemedText from "../themedText";

const ScopeChip = ({
  scope,
  value,
  setScope,
}: {
  scope: Scope;
  value: Scope;
  setScope: React.Dispatch<React.SetStateAction<Scope>>;
}) => {
  const active = useMemo(() => scope === value, [scope, value]);

  return (
    <Pressable
      onPress={() => setScope(value)}
      className={`flex-1 p-[5px] items-center rounded-[20px] ${active ? "bg-black dark:bg-white" : "border border-black dark:border-white"}`}
    >
      <ThemedText reverse={active} className={`capitalize`}>
        {value}
      </ThemedText>
    </Pressable>
  );
};

export default ScopeChip;
