import { StyleSheet, Text, View } from "react-native";
import testIDs from "../mocks/testIDS";
import React, { useRef, useMemo, useCallback } from "react";
import {
  ExpandableCalendar,
  AgendaList,
  CalendarProvider,
  WeekCalendar,
} from "react-native-calendars";
import { agendaItems, getMarkedDates } from "../mocks/agendaItems";
import AgendaItem from "../mocks/AgendaItem";
import { getTheme, themeColor, lightThemeColor } from "../mocks/theme";
import Screen from "../components/Screen";

const leftArrowIcon = require("../assets/previous.png");
const rightArrowIcon = require("../assets/next.png");
const ITEMS = agendaItems;
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
      <Screen>
        <Agenda
          items={items}
          loadItemsForMonth={loadItems}
          selected={"2017-05-16"}
        />
      </Screen>
    </>
  );
};

const timeToString = (time) => {
  const date = new Date(time);
  return date.toISOString().split("T")[0];
};

export default CalendarScreen;
