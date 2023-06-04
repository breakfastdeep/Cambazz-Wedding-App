import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export default function HookFormButtons({ onPress }) {
  const { goBack } = useNavigation();
  return (
    <View style={{ flex: 1, justifyContent: "flex-end", margin: 20 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Button mode="contained" onPress={() => goBack()}>
          Abbrechen
        </Button>
        <Button loading={false} mode="contained" onPress={onPress}>
          Anlegen
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
