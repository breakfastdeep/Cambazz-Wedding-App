import { View, Text, StyleSheet } from "react-native";
import { FAB, Portal, Provider } from "react-native-paper";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import ListingsScreen from "./ListingsScreen";
import MessagesScreen from "./MessagesScreen";
import { createStackNavigator } from "@react-navigation/stack";
import CreateWeddingScreen from "./CreateWeddingScreen";
import CreateWorkerScreen from "./CreateWorkerScreen";

const Stack = createStackNavigator();

function HomeScreen() {
  return <FABMenu />;
}

function FABMenu() {
  const [state, setState] = React.useState({ open: false });

  const onStateChange = ({ open }) => setState({ open });

  const { open } = state;

  const navigation = useNavigation();

  return (
    <Provider>
      <Portal>
        <FAB.Group
          open={open}
          icon={open ? "close" : "plus"}
          actions={[
            {
              icon: "heart-plus",
              label: "Hochzeit erstellen",
              onPress: () => navigation.navigate("CreateWedding"),
            },
            {
              icon: "account-plus",
              label: "Mitarbeiter anlegen",
              onPress: () => navigation.navigate("CreateWorker"),
            },
          ]}
          onStateChange={onStateChange}
          onPress={() => {
            if (open) {
            }
          }}
        />
      </Portal>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    backgroundColor: "#2196F3",
    bottom: 0,
    right: 0,
  },
});

export default HomeScreen;
