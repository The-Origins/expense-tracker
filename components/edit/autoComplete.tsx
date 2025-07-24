import { normalizeString } from "@/lib/appUtils";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import InputField from "./inputField";

const AutoComplete = ({
  name,
  value,
  options,
  touched,
  error,
  changed,
  onChange,
}: {
  name: string;
  value: string;
  options: string[];
  touched: boolean;
  changed: boolean;
  error: string;
  onChange: (name: string, value: string) => void;
}) => {
  const [show, setShow] = useState<boolean>(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);

  const handleFocus = () => {
    setShow(true);
  };

  const handleBlur = () => {
    setShow(false);
    setFilteredOptions(options);
  };

  const handleChange = (change: string) => {
    if (!show) {
      setShow(true);
    }
    onChange(name, change);
    setFilteredOptions(
      options.filter((item) => item.includes(normalizeString(change)))
    );
  };

  const handleSelect = (option: string) => {
    onChange(name, option);
    setShow(false);
  };

  return (
    <View className=" flex-1 relative ">
      <InputField
        name="value"
        value={value}
        touched={touched}
        error={error}
        changed={changed}
        handleChange={handleChange}
        handleBlur={handleBlur}
        onFocus={handleFocus}
      />
      {show && (
        <View className=" absolute top-[100%] flex-col rounded-[20px] shadow shadow-divider bg-paper-light  dark:bg-paper-dark">
          {filteredOptions.map((option, index) => (
            <Pressable
              onPress={() => handleSelect(option)}
              key={index}
              className=" p-[10px] "
            ></Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

export default AutoComplete;
