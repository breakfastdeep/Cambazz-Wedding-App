import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../config/firebase/firebase";
import { auth, firestore } from "../config/firebase/firebase";

import { StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import CalendarScreen from "./CalendarScreen";
import HomeScreen from "./HomeScreen";
import AccountNavigator from "../navigation/AccountNavigator";
import CreateWorkerScreen from "../screens/CreateWorkerScreen";
import CreateWeddingScreen from "./CreateWeddingScreen";
import TimeStampScreen from "./TimeStampScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

initializeApp(firebaseConfig);

function DashboardNavigator() {
  const [weddingsData, setWeddingsData] = useState([]);

  useEffect(() => {
    const fetchWeddingsData = async () => {
      const user = auth.currentUser;
      const weddingsCollectionRef = firestore.collection("weddings"); // Updated reference
      const querySnapshot = await weddingsCollectionRef.get(); // Updated to .get()
      const weddingsArray = [];

      querySnapshot.forEach((doc) => {
        const weddingData = doc.data();
        weddingsArray.push(weddingData);
      });

      setWeddingsData(weddingsArray);
    };

    fetchWeddingsData();
  }, []);

  return (
    <>
      <Tab.Navigator>
        <Tab.Screen
          name="start"
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
          component={() => <CalendarScreen weddingsData={weddingsData} />} // Pass the prop correctly
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
          name="zeitstempel"
          component={() => <TimeStampScreen weddingsData={weddingsData} />} // Pass the prop correctly
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
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ weddingsData: weddingsData }}
      />
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
