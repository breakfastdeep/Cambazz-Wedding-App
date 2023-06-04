import React, { useState } from "react";
import { View, Text } from "react-native";
import { Calendar } from "react-native-calendars";
import Screen from "../components/Screen";
const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState("");

  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString);
  };

  return (
    <Screen>
      <Calendar
        onDayPress={handleDateSelect}
        markedDates={{ [selectedDate]: { selected: true } }}
        minDate={new Date()}
        theme={{
          selectedDayBackgroundColor: "blue",
          todayTextColor: "blue",
          arrowColor: "blue",
        }}
      />
      {selectedDate ? (
        <Text>{selectedDate} ausgewält</Text>
      ) : (
        <Text>Ausgewälte Datum</Text>
      )}
    </Screen>
  );
};

export default CalendarScreen;
