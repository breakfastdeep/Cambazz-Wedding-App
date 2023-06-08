import { View, Text, StyleSheet } from "react-native";
import { FAB, Portal, Provider } from "react-native-paper";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import ListingsScreen from "./ListingsScreen";
import MessagesScreen from "./MessagesScreen";
import { createStackNavigator } from "@react-navigation/stack";
import CreateWeddingScreen from "./CreateWeddingScreen";
import CreateWorkerScreen from "./CreateWorkerScreen";
import { firestore, auth } from "../config/firebase/firebase";
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
import { onAuthStateChanged } from "firebase/auth";

const Stack = createStackNavigator();
function HomeScreen() {
  const [isAdmin, setIsAdmin] = useState(false); // Track admin status

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const usersCollectionRef = collection(firestore, "users");
      const q = query(usersCollectionRef, where("rolle", "==", "admin"));
      getDocs(q)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            console.log(doc.data());
            if (user.uid === doc.id) {
              console.log("User is an admin");
              setIsAdmin(true);
            }
          });
        })
        .catch((error) => {
          console.log("Error getting documents:", error);
        });
    }
  }, []);

  return <>{isAdmin && <FABMenu />}</>;
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
