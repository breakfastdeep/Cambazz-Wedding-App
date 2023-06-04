import { StyleSheet, View } from "react-native";
import React from "react";
import { TextInput, Text, useTheme } from "react-native-paper";
import ErrorMessage from "./ErrorMessage";
import { useForm, Controller } from "react-hook-form";

export default function HookFormController({
  control,
  label,
  required,
  errors,
  value,
  ...otherProps
}) {
  const theme = useTheme();
  return (
    <>
      <Controller
        control={control}
        rules={{
          required: { required },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={label}
            mode="outlined"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            {...otherProps}
          />
        )}
        name={label}
      />
      {errors[label] && (
        <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
          {errors[label].message}
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({});
