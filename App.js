import LoginScreen from "./app/screens/LoginScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import ToastManager from "toastify-react-native";
//adding firebase libraries

import { auth, firestore } from "./app/config/firebase/firebase";
import DashboardNavigator from "./app/screens/DashboardNavigator";
//import * as Notifications from "expo-notifications";
//import Constants from "expo-constants";
import messaging from "@react-native-firebase/messaging";

import {
  doc,
  setDoc,
  addDoc,
  getDoc,
  getFirestore,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

const Stack = createStackNavigator();
function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(false);

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
  };

  //Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  //firebase subscribing
  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);

    /*
    // Subscribe to Firebase Realtime Database changes
    const databaseRef = collection(firestore, "weddings");
    console.log(databaseRef);
    databaseRef.on("value", handleDatabaseChange);

    const fetchData = async () => {
      try {
        const q = query(
          collection(firestore, "weddings"),
          where("isInitial", "==", true)
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          // doc.id doc.data()
          // doc.data() is never undefined for query doc snapshots
        });
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };
    fetchData();
    */

    if (requestUserPermission()) {
      // return fcm token for the device
      messaging()
        .getToken()
        .then((token) => {
          console.log(token);
        });
    } else {
      console.log("Failed token status: ", authStatus);
    }

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(async (remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "Notification caused app to open from quit state:",
            remoteMessage.notification
          );
          //setInitialRoute(remoteMessage.data.type); // e.g. "Settings"
        }
        setLoading(false);
      });

    // getInitialNotification: When the application is opened from a quit state.
    // onNotificationOpenedApp: When the application is running, but in the background.
    // Assume a message-notification contains a "type" property in the data payload of the screen to open
    messaging().onNotificationOpenedApp(async (remoteMessage) => {
      console.log(
        "Notification caused app to open from background state:",
        remoteMessage.notification
      );
      //navigation.navigate(remoteMessage.data.type);
    });

    // Register background handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("Message handled in the background!", remoteMessage);
    });

    const unsubscribeFCM = messaging().onMessage(async (remoteMessage) => {
      Alert.alert("A new FCM message arrived!", JSON.stringify(remoteMessage));
    });

    return () => {
      // Unsubscribe from Firebase Realtime Database changes
      // databaseRef.off("value", handleDatabaseChange);
      subscriber;
      unsubscribeFCM;
    };
  }, []);

  if (initializing) return null;

  if (!user) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={DashboardNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default () => {
  return (
    <NavigationContainer>
      <App />
      <Toast />
      <ToastManager />
    </NavigationContainer>
  );
};
