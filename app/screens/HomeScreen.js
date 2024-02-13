import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from "react-native";
import {
  Card,
  List,
  Portal,
  Modal,
  Button,
  Provider,
  FAB,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, firestore } from "../config/firebase/firebase";

function HomeScreen({ route }) {
  const { weddingsData } = route.params;
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [weddingsLoaded, setWeddingsLoaded] = useState(false);

  // Function to handle card press and open the modal
  const handleCardPress = (event) => {
    setSelectedEvent(event);
    setVisible(true);
  };

  // Function to close the modal
  const hideModal = () => {
    setVisible(false);
    setSelectedEvent(null);
  };

  const fetchEvents = async () => {
    setRefreshing(true);
    const user = auth.currentUser;
    const usersCollectionRef = collection(firestore, "users");
    const q = query(usersCollectionRef, where("rolle", "==", "admin"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      if (user.uid === doc.id) {
        setIsAdmin(true);
      }
    });

    if (user) {
      const weddingsCollectionRef = collection(firestore, "weddings");
      const querySnapshot = await getDocs(query(weddingsCollectionRef));

      const currentDate = moment();

      const filteredEvents = [];

      querySnapshot.forEach((doc) => {
        const {
          startDatum,
          startZeit,
          ort,
          beschreibung,
          damat,
          gelin,
          workers,
          id,
        } = doc.data();

        // Check if startDatum is defined and a non-empty string
        if (
          startDatum &&
          typeof startDatum === "string" &&
          startDatum.trim() !== ""
        ) {
          const parts = startDatum.split(".");
          if (parts.length === 3) {
            const formattedDate = moment(
              `${parts[2]}-${parts[1]}-${parts[0]}`,
              "YYYY-MM-DD"
            );
            const isoDateString = formattedDate.format("YYYY-MM-DD");

            if (formattedDate.isSameOrAfter(currentDate, "day")) {
              workers.forEach((worker) => {
                if (worker.id === user.uid) {
                  const positions = worker.positions;
                  filteredEvents.push({
                    isoDateString,
                    startZeit,
                    ort,
                    beschreibung,
                    damat,
                    gelin,
                    positions,
                    id,
                  });
                }
              });
            }
          }
        }
      });

      filteredEvents.sort((a, b) =>
        a.isoDateString.localeCompare(b.isoDateString)
      );

      setEvents(filteredEvents.slice(0, 2));
    }
    setWeddingsLoaded(true);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const navigation = useNavigation();

  return (
    <Provider>
      {isAdmin && (
        <Portal>
          <FABMenu navigation={navigation} />
        </Portal>
      )}
      <List.Section>
        <List.Subheader>Aktuelle Hochzeiten</List.Subheader>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {weddingsLoaded && events.length > 0
            ? events.map((eventWedding) => (
                <List.Item
                  key={eventWedding.id}
                  onPress={() => handleCardPress(eventWedding)}
                  title={eventWedding.isoDateString}
                  description={`Hochzeit: ${eventWedding.damat} & ${eventWedding.gelin}`}
                  left={(props) => <List.Icon {...props} icon="ring" />}
                />
              ))
            : null}
        </ScrollView>
      </List.Section>

      {/* Modal to show event details */}
      <Portal>
        <Modal visible={visible} onDismiss={hideModal}>
          <Card>
            <Card.Title
              title={selectedEvent ? selectedEvent.isoDateString : ""}
              subtitle={selectedEvent ? selectedEvent.startZeit : ""}
            />
            <Card.Content>
              <View>
                <Text>{selectedEvent ? selectedEvent.startDatum : ""}</Text>
                <Text>
                  Hochzeit:
                  {selectedEvent ? selectedEvent.damat : ""} &{" "}
                  {selectedEvent ? selectedEvent.gelin : ""}
                </Text>
                <Text>Saal: {selectedEvent ? selectedEvent.ort : ""}</Text>
                <Text>
                  Position: {selectedEvent ? selectedEvent.positions : ""}
                </Text>
                <Text>
                  Beschreibung:{" "}
                  {selectedEvent ? selectedEvent.beschreibung : ""}
                </Text>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button onPress={hideModal}>Schließen</Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
    </Provider>
  );
}

function FABMenu() {
  const [state, setState] = useState({ open: false });

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

export default HomeScreen;
