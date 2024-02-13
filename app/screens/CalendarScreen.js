import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { auth, firestore } from "../config/firebase/firebase";
import moment from "moment";
import { Agenda, CalendarProvider, LocaleConfig } from "react-native-calendars";
import { Avatar, Card } from "react-native-paper";
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

LocaleConfig.locales["de"] = {
  monthNames: [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ],
  monthNamesShort: [
    "Jan.",
    "Feb.",
    "März",
    "Apr.",
    "Mai",
    "Juni",
    "Juli",
    "Aug.",
    "Sept.",
    "Okt.",
    "Nov.",
    "Dez.",
  ],
  dayNames: [
    "Sonntag",
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag",
  ],
  dayNamesShort: ["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."],
};

LocaleConfig.defaultLocale = "de";

const CalendarScreen = ({ weddingsData }) => {
  const [items, setItems] = useState({});
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setRefreshing(true);

      const user = auth.currentUser;

      if (!user) {
        setRefreshing(false); // Make sure to stop refreshing
        throw new Error("User not authenticated");
      }

      const weddingsCollectionRef = collection(firestore, "weddings");
      const querySnapshot = await getDocs(query(weddingsCollectionRef));

      if (
        !querySnapshot ||
        !querySnapshot.docs ||
        !Array.isArray(querySnapshot.docs)
      ) {
        setRefreshing(false); // Make sure to stop refreshing
        throw new Error("Keine Hochzeit gefunden"); // Handle the case where no weddings are found
      }

      const events = {};
      const marked = {};
      const dates = [];

      querySnapshot.docs.forEach((doc) => {
        const {
          startDatum,
          startZeit,
          ort,
          beschreibung,
          damat,
          gelin,
          workers,
        } = doc.data();

        if (Array.isArray(workers)) {
          workers.forEach((worker) => {
            if (worker.id === user.uid) {
              const formattedDate = moment(startDatum, "DD.MM.YYYY").format(
                "YYYY-MM-DD"
              );

              dates.push(formattedDate);

              if (!events[formattedDate]) {
                events[formattedDate] = [];
              }

              events[formattedDate].push({
                ort,
                beschreibung,
                startZeit,
                positions: worker.positions,
                damat,
                gelin,
                isoDateString: formattedDate,
              });

              console.log(events);

              if (!marked[formattedDate]) {
                marked[formattedDate] = {
                  marked: true,
                  selectedDotColor: "red",
                  dotColor: "yellow",
                };
              }
            }
          });
        }
      });

      setItems(events);
      setMarkedDates(marked);

      dates.sort();
      const today = moment().format("YYYY-MM-DD");
      const firstAppointment = dates.find((date) => date >= today);

      if (firstAppointment) {
        setSelectedDate(firstAppointment);
      }
    } catch (error) {
      console.error("Error in fetchData:", error);
      setRefreshing(false); // Make sure to stop refreshing when the data fetching is done
    }
  };

  const renderAgendaItem = (item) => {
    let avatarColor;

    switch (item.ort) {
      case "RB":
        avatarColor = "red";
        break;
      case "GP":
        avatarColor = "yellow";
        break;
      case "KS":
        avatarColor = "orange";
        break;
      case "KP":
        avatarColor = "green";
        break;
      default:
        avatarColor = "black";
        break;
    }

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemLeftContainer}>
          <Text style={styles.itemTitle}>{item.startZeit}</Text>
          <Text style={styles.itemText}>
            {item.gelin} & {item.damat}
          </Text>
          <Text style={styles.itemText}>{item.beschreibung}</Text>
          <Text style={styles.itemText}>{item.positions}</Text>
        </View>
        <View style={styles.itemRightContainer}>
          <Avatar.Text
            label={item.ort}
            size={40}
            style={[styles.itemAvatar, { backgroundColor: avatarColor }]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Agenda
        items={items}
        renderItem={renderAgendaItem}
        renderEmptyData={() => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.message}>
                An diesem Tag keine Hochzeiten gefunden.
              </Text>
            </Card.Content>
          </Card>
        )}
        pastScrollRange={3}
        futureScrollRange={3}
        selected={selectedDate}
        disabledByDefault={true}
        onRefresh={() => fetchEvents()}
        refreshing={refreshing}
        theme={{
          agendaDayTextColor: "black",
          agendaDayNumColor: "blue",
          agendaTodayColor: "red",
          agendaKnobColor: "blue",
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  itemTitle: {
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "left",
  },
  itemText: {
    textAlign: "left",
    marginTop: 2,
  },
  itemLeftContainer: {
    flex: 1,
    justifyContent: "center",
  },
  itemRightContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  itemAvatar: {},
  card: {
    margin: 16,
    borderRadius: 4,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 16,
  },
});

export default CalendarScreen;
