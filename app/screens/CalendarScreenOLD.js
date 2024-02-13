import { StyleSheet, Text, View } from "react-native";
import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  ExpandableCalendar,
  AgendaList,
  CalendarProvider,
  WeekCalendar,
  Agenda,
  Calendar,
  LocaleConfig,
} from "react-native-calendars";
import { firestore, auth } from "../config/firebase/firebase";

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

import moment from "moment";

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

const CalendarScreen = () => {
  const [items, setItems] = useState({});
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  let firstAppointment;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    //find current user
    const user = auth.currentUser;

    // getting all weddings for use from firebase
    const weddingsCollectionRef = collection(firestore, "weddings");
    const querySnapshot = await getDocs(query(weddingsCollectionRef));

    const events = {};
    const marked = {};
    const dates = [];
    querySnapshot.forEach((doc) => {
      //object construction from firebase data
      const {
        startDatum,
        startZeit,
        ort,
        beschreibung,
        damat,
        gelin,
        workers,
      } = doc.data();

      workers.forEach((worker) => {
        if (worker.id === user.uid) {
          const moment = require("moment");

          const parts = startDatum.split(".");
          const formattedDate = moment(
            `${parts[2]}-${parts[1]}-${parts[0]}`,
            "YYYY-MM-DD"
          );
          const isoDateString = formattedDate.format("YYYY-MM-DD");
          dates.push(isoDateString);
          if (!events[isoDateString]) {
            events[isoDateString] = [];
          }
          const positions = worker.positions;
          events[isoDateString].push({
            ort,
            beschreibung,
            startZeit,
            positions,
            damat,
            gelin,
            isoDateString,
          });

          if (!marked[isoDateString]) {
            marked[isoDateString] = {
              marked: true,
              selectedDotColor: "red",
              dotColor: "yellow",
            };
          }
        }
      });
    });

    setItems(events);
    setMarkedDates(marked);
    dates.sort();
    const today = moment().format("YYYY-MM-DD");
    const firstAppointment = dates.find((date) => date >= today);

    if (firstAppointment) {
      setSelectedDate(firstAppointment);
    }
  };

  const renderAgendaItem = (item) => {
    let avatarColor;
    // Customize the color based on the "ort" value
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
        // Max amount of months allowed to scroll to the future. Default = 50
        futureScrollRange={3}
        selected={selectedDate}
        // If disabledByDefault={true} dates flagged as not disabled will be enabled. Default = false
        disabledByDefault={true}
        // If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make sure to also set the refreshing prop correctly
        onRefresh={() => fetchData()}
        // Set this true while waiting for new data from a refresh
        refreshing={false}
        // Add a custom RefreshControl component, used to provide pull-to-refresh functionality for the ScrollView
        refreshControl={null}
        // Agenda theme
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
  calendar: {
    marginBottom: 10,
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

//================================================
/*
const CalendarScreen = (props) => {
  const { weekView } = props;
  const marked = useRef(getMarkedDates());
  const theme = useRef(getTheme());
  const todayBtnTheme = useRef({
    todayButtonTextColor: themeColor,
  });

  //const onDateChanged = useCallback((date, updateSource) => {
  //  console.log("ExpandableCalendarScreen onDateChanged: ", date, updateSource);
  //}, []);

  //const onMonthChange = useCallback(({ dateString }) => {
  //  console.log("ExpandableCalendarScreen onMonthChange: ", dateString);
  //}, []);

  const renderItem = useCallback(({ item }) => {
    return <AgendaItem item={item} />;
  }, []);

  return (
    <CalendarProvider
      date={ITEMS[1]?.title}
      //onDateChanged={onDateChanged}
      //onMonthChange={onMonthChange}
      showTodayButton
      // disabledOpacity={0.6}
      theme={todayBtnTheme.current}
      // todayBottomMargin={16}
    >
      {weekView ? (
        <WeekCalendar
          testID={testIDs.weekCalendar.CONTAINER}
          firstDay={1}
          markedDates={marked.current}
        />
      ) : (
        <ExpandableCalendar
          testID={testIDs.expandableCalendar.CONTAINER}
          // horizontal={false}
          // hideArrows
          // disablePan
          // hideKnob
          //initialPosition={ExpandableCalendar.positions.OPEN}
          //calendarStyle={styles.calendar}
          // headerStyle={styles.header} // for horizontal only
          // disableWeekScroll
          theme={theme.current}
          // disableAllTouchEventsForDisabledDays
          firstDay={1}
          markedDates={marked.current}
          leftArrowImageSource={leftArrowIcon}
          rightArrowImageSource={rightArrowIcon}
          animateScroll
          //closeOnDayPress={false}
        />
      )}
      <AgendaList
        sections={ITEMS}
        renderItem={renderItem}
        scrollToNextEvent
        sectionStyle={styles.section}
        dayFormat={"yyyy-MM-d"}
      />
    </CalendarProvider>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  calendar: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  header: {
    backgroundColor: "lightgrey",
  },
  section: {
    backgroundColor: lightThemeColor,
    color: "grey",
    textTransform: "capitalize",
  },
});
*/

//===========================================
/*
const CalendarScreen = (props) => {
  
  
  
  const [items, setItems] = useState({});
  const loadItems = (day) => {
    const items = items || {};
    setTimeout(() => {
      for (let i = -15; i < 85; i++) {
        const time = day.timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = timeToString(time);

        if (!items[strTime]) {
          items[strTime] = [];

          const numItems = Math.floor(Math.random() * 3 + 1);
          for (let j = 0; j < numItems; j++) {
            items[strTime].push({
              name: "Item for " + strTime + " #" + j,
              height: Math.max(50, Math.floor(Math.random() * 150)),
              day: strTime,
            });
          }
        }
      }

      const newItems = {};
      Object.keys(items).forEach((key) => {
        newItems[key] = items[key];
      });
      setItems(newItems);
    }, 1000);
  };
  return (
    <>
      <Agenda
        items={items}
        loadItemsForMonth={loadItems}
        selected={"2022-07-16"}
      />
    </>
  );
  
};

const timeToString = (time) => {
  const date = new Date(time);
  return date.toISOString().split("T")[0];
};
*/
//======================================

export default CalendarScreen;
