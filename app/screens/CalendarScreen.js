import { StyleSheet, Text, View } from "react-native";
import testIDs from "../mocks/testIDS";
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
import { agendaItems, getMarkedDates } from "../mocks/agendaItems";
import AgendaItem from "../mocks/AgendaItem";
import { getTheme, themeColor, lightThemeColor } from "../mocks/theme";
import Screen from "../components/Screen";

const leftArrowIcon = require("../assets/previous.png");
const rightArrowIcon = require("../assets/next.png");
const ITEMS = agendaItems;
import { firestore, auth } from "../config/firebase/firebase";

import { Avatar } from "react-native-paper";
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

const CalendarScreen = () => {
  const [items, setItems] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const user = auth.currentUser;
    const weddingsCollectionRef = collection(firestore, "weddings");
    const querySnapshot = await getDocs(query(weddingsCollectionRef));

    const events = {};
    const marked = {};

    querySnapshot.forEach((doc) => {
      const { startDatum, startZeit, ort, beschreibung, workers } = doc.data();
      console.log("Weddingsdata for Calendar: ", doc.data());
      console.log(startDatum);
      const moment = require("moment");

      const parts = startDatum.split(".");
      const formattedDate = moment(
        `${parts[2]}-${parts[1]}-${parts[0]}`,
        "YYYY-MM-DD"
      );
      const isoDateString = formattedDate.format("YYYY-MM-DD");
      console.log("date-format for agenda: ", isoDateString);
      if (!events[isoDateString]) {
        events[isoDateString] = [];
      }
      let positions = [];
      workers.forEach((worker) => {
        if (worker.id === user.uid) {
          positions = worker.positions;
        }
      });
      events[isoDateString].push({
        ort,
        beschreibung,
        startDatum,
        startZeit,
        positions,
      });

      if (!marked[isoDateString]) {
        marked[isoDateString] = { marked: true };
      }
    });

    setItems(events);
    setMarkedDates(marked);
  };

  const loadItemsForMonth = async (date) => {
    setSelectedDate(date.dateString);
    const startDate = new Date(date.year, date.month - 1, 1);
    const endDate = new Date(date.year, date.month, 0, 23, 59, 59);

    const eventsCollectionRef = collection(firestore, "weddings");
    const q = query(
      eventsCollectionRef,
      where("date", ">=", startDate),
      where("date", "<=", endDate)
    );
    const querySnapshot = await getDocs(q);

    const events = {};
    const marked = {};

    querySnapshot.forEach((doc) => {
      const { startDatum, ort, beschreibung } = doc.data();
      const parts = startDatum.split(".");
      const formattedDate = new Date(parts[2], parts[1] - 1, parts[0]);
      const isoDateString = formattedDate.toISOString().split("T")[0];

      if (!events[isoDateString]) {
        events[isoDateString] = [];
      }

      events[isoDateString].push({ title, description });

      if (!marked[isoDateString]) {
        marked[isoDateString] = { marked: true };
      }
    });

    setItems(events);
    setMarkedDates(marked);
  };

  const renderAgendaItem = (item) => {
    return (
      <View style={styles.itemContainer}>
        <Avatar.Text label={item.ort} size={40} style={styles.avatar} />
        <Text>{item.startZeit}</Text>
        <Text>{item.beschreibung}</Text>
        <Text>{item.positions}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Agenda
        items={items}
        renderItem={renderAgendaItem}
        renderEmptyData={() => <Text>Keine Hochzeit gefunden</Text>}
        pastScrollRange={3}
        // Max amount of months allowed to scroll to the future. Default = 50
        futureScrollRange={3}
        selected={"2023-08-23"}
        // If disabledByDefault={true} dates flagged as not disabled will be enabled. Default = false
        disabledByDefault={true}
        // If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make sure to also set the refreshing prop correctly
        onRefresh={() => console.log("refreshing...")}
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
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  itemTitle: {
    fontWeight: "bold",
    marginBottom: 5,
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
