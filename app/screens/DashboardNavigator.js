import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../config/firebase/firebase";
import { getFirestore } from "firebase/firestore";
import { FAB, Portal, Provider } from "react-native-paper";

import { StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import CalendarScreen from "./CalendarScreen";
import HomeScreen from "./HomeScreen";
import AccountNavigator from "../navigation/AccountNavigator";
import CreateWorkerScreen from "../screens/CreateWorkerScreen";
import CreateWeddingScreen from "../screens/CreateWeddingScreen";
import TimeStampScreen from "./TimeStampScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

function DashboardNavigator() {
  return (
    <>
      <Tab.Navigator>
        <Tab.Screen
          name="startSeite"
          component={HomeScreenStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" color={color} size={size} />
            ),
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="kalendar"
          component={CalendarScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="calendar-month"
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Zeitstempel"
          component={TimeStampScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="stamper"
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tab.Screen
          name="konto"
          component={AccountNavigator}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account"
                color={color}
                size={size}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
}

function HomeScreenStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CreateWedding" component={CreateWeddingScreen} />
      <Stack.Screen name="CreateWorker" component={CreateWorkerScreen} />
    </Stack.Navigator>
  );
}

export default DashboardNavigator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
