import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dialog,
  Paragraph,
  Button,
} from "react-native";
import * as Yup from "yup";
import moment from "moment";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  TextInput,
  Provider,
  useTheme,
  Button as PaperButton,
  Headline,
  List,
  Switch,
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Toast } from "toastify-react-native";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { auth, EMAIL_SUFFIX, firestore } from "../config/firebase/firebase";

const CreateWeddingScreen = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [isFotoshootingOn, setIsFotoshootingOn] = useState(false);
  const [isSaalFotoOn, setIsSaalFotoOn] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState({
    value: "",
    list: [],
    selectedList: [],
    error: "",
  });
  const [positions, setPositions] = useState({
    value: "",
    list: [],
    selectedList: [],
    error: "",
  });
  const [isUserAndPositionSubmitted, setUserAndPositionSubmitted] =
    useState(false);
  const [paperUsersList, setPaperUserList] = useState([]);
  const [expanded, setExpanded] = useState(true);

  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("");
  const [showTime, setTimeShow] = useState(false);
  const [showDate, setDateShow] = useState(false);
  const [time, setTimeState] = useState(() => {
    const defaultTime = new Date();
    defaultTime.setHours(17, 0);
    return defaultTime;
  });

  const theme = useTheme();

  useEffect(() => {
    register("ort");
    register("gelin");
    register("damat");
    register("beschreibung");
    register("mitarbeiter");
    register("positions");

    // Set Paper Select Data
    let isMounted = true;

    // Getting positions from Firebase
    const positionsCollectionRef = collection(firestore, "positions");
    getDocs(positionsCollectionRef).then((snapshot) => {
      const positions = [];
      snapshot.forEach((doc) => {
        positions.push({
          _id: doc.id,
          value: doc.data().position,
        });
      });
      setPositions({ value: "", list: positions, selectedList: [], error: "" });
    });

    //Getting locations from Firebase
    const locationsCollectionRef = collection(firestore, "locations");
    getDocs(locationsCollectionRef).then((snapshot) => {
      const locations = [];
      snapshot.forEach((doc) => {
        locations.push({ _id: doc.data()._id, value: doc.data().location });
      });
      locations.sort((a, b) => a._id - b._id);
      setLocations({ value: "", list: locations, selectedList: [], error: "" });
    });

    //Getting users from Firebase
    const usersCollectionRef = collection(firestore, "users");
    const q = query(usersCollectionRef, where("rolle", "!=", "admin"));
    getDocs(q).then((querySnapshot) => {
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({
          _id: doc.id,
          value: doc.data().vorname + " " + doc.data().nachname,
        });
      });
      setUsersData({ value: "", list: users, selectedList: [], error: "" });
    });

    return () => {
      unsubscribe();
    };
  }, [register]);

  const schema = Yup.object().shape({
    ort: Yup.string().required("Pflichtfeld"),
    mitarbeiter: Yup.string()
      .required("mindestens eine Option auswählen")
      .min(1),
    positions: Yup.string().required("mindestens eine Option auswählen").min(1),
  });

  const handleDeleteItem = (_id) => {
    const paperUser = paperUsersList.find((user) => user._id === _id);
    const currentPaperUsersList = paperUsersList.filter(
      (user) => user._id !== _id
    );
    setPaperUserList(currentPaperUsersList);

    const newUser = {};
    for (const key in paperUser) {
      if (key !== "positions") {
        newUser[key] = paperUser[key];
      }
    }

    setUsersData((prevUsersData) => ({
      ...prevUsersData,
      list: [...prevUsersData.list, newUser],
      selectedList: [],
      error: "",
    }));

    if (currentPaperUsersList.length === 0) setUserAndPositionSubmitted(false);
    setShowDialog(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => deleteItem(item._id)}>
      <Text>{item.value}</Text>
    </TouchableOpacity>
  );

  const selectValidator = (value) => {
    if (!value || value.length <= 0) {
      return "Eine Option auswählen.";
    }
    return "";
  };

  const [usersData, setUsersData] = useState({
    value: "",
    list: [],
    selectedList: [],
    error: "",
  });

  const showDatepicker = () => {
    setMode("date");
    setDateShow(true);
  };

  const showTimepicker = () => {
    setMode("time");
    setTimeShow(true);
  };

  const onSubmit = (values) => {
    addWedding(values);
  };

  const addWedding = async (wedding) => {
    const { ort, beschreibung, damat, gelin } = wedding;

    const workers = [];
    paperUsersList.forEach((user) => {
      const name = user.value;
      const id = user._id;
      const positions = user.positions;
      const isAccepted = true;
      workers.push({ id, name, positions, isAccepted });
    });

    const startZeit = moment(time).format("HH:mm");
    const startDatum = date.toLocaleDateString();

    try {
      const weddingsRef = collection(firestore, "weddings");
      const docRef = await addDoc(weddingsRef, {
        ort,
        beschreibung,
        startZeit,
        startDatum,
        gelin,
        damat,
        isSaalFotoOn,
        isFotoshootingOn,
        workers,
      });

      const weddingRef = doc(firestore, "weddings", docRef.id);
      await updateDoc(weddingRef, {
        id: docRef.id,
      });
      reset();

      setLocations({
        ...locations,
        value: "",
        selectedList: [],
        error: "",
      });

      setUsersData({
        ...usersData,
        value: "",
        selectedList: [],
        error: "",
      });

      setIsSaalFotoOn(false);
      setIsFotoshootingOn(false);
      setUserAndPositionSubmitted(false);
      setPaperUserList(usersData);
      Toast.success("Hochzeit wurde erfolgreich erstellt", "bottom");
    } catch (error) {
      console.error(error.message);
      console.error(error.code);
      Toast.error("Hochzeit konnte nicht erstellt werden", "bottom");
    }
  };

  const handlePress = () => setExpanded(!expanded);

  return (
    <>
      <Provider>
        <ScrollView>
          <Headline>Hochzeit Angaben</Headline>
          <Controller
            name="ort"
            control={control}
            defaultValue=""
            rules={{ required: "Ort auswählen ist erforderlich" }}
            render={({ field: { onChange } }) => (
              <PaperSelect
                label="Ort auswählen"
                value={locations.value}
                onSelection={(value) => {
                  setLocations({
                    ...locations,
                    value: value.text,
                    selectedList: value.selectedList,
                    error: "",
                  });
                  onChange(value.text);
                }}
                arrayList={[...locations.list]}
                selectedArrayList={[...locations.selectedList]}
                errorText={locations.error}
                containerStyle={{ flex: 1 }}
                multiEnable={false}
                textInputMode="outlined"
                dialogButtonLabelStyle={{
                  padding: 10,
                  borderRadius: 5,
                }}
                searchPlaceholder="Suchen"
                modalCloseButtonText="Abbrechen"
                modalDoneButtonText="Auswählen"
              />
            )}
          />
          {errors.ort && (
            <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
              {errors.ort.message}
            </Text>
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Controller
              control={control}
              name="datum"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="datum"
                  mode="outlined"
                  editable={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={date.toLocaleDateString()}
                  right={
                    <TextInput.Icon
                      iconColor="#000"
                      icon="calendar"
                      onPress={showDatepicker}
                    />
                  }
                  style={{ width: "60%", opacity: 1 }} // Set the width to 70%
                />
              )}
            />
            {errors.datum && (
              <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                {errors.datum.message}
              </Text>
            )}
            <Controller
              control={control}
              name="zeitController"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="zeit"
                  is24Hour={true}
                  mode="outlined"
                  editable={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={moment(time).format("HH:mm")}
                  right={
                    <TextInput.Icon
                      iconColor="#000"
                      icon="clock"
                      onPress={showTimepicker}
                    />
                  }
                  style={{ width: "40%", opacity: 1 }} // Set the width to 30%
                />
              )}
            />
            {errors.zeitController && (
              <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                {errors.zeitController.message}
              </Text>
            )}
            {showDate && (
              <Controller
                name="datum"
                control={control}
                render={({ field: { onChange } }) => {
                  const handleDateChange = (event, selectedDate) => {
                    const currentDate = selectedDate || date;
                    setDateShow(Platform.OS === "ios");
                    if (selectedDate) {
                      setDate(currentDate);

                      onChange(currentDate);
                    }
                  };
                  return (
                    <DateTimePicker
                      testID="dateTimePicker"
                      value={date}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                    />
                  );
                }}
              />
            )}

            {showTime && (
              <Controller
                name="zeit"
                control={control}
                render={({ field: { onChange } }) => {
                  const handleTimeChange = (event, selectedTime) => {
                    const currentTime = selectedTime || time;
                    setTimeShow(Platform.OS === "ios");
                    if (selectedTime) {
                      setTimeState(currentTime);

                      onChange(currentTime);
                    }
                  };
                  return (
                    <DateTimePicker
                      testID="dateTimePicker"
                      value={time}
                      mode="time"
                      display="default"
                      format="HH:mm"
                      locale="en_GB"
                      is24Hour={true}
                      onChange={handleTimeChange}
                    />
                  );
                }}
              />
            )}
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 0.5 }}>
              <Controller
                control={control}
                name="gelin"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="gelin"
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    right={
                      <TextInput.Icon iconColor="#000" icon="gender-female" />
                    }
                  />
                )}
              />
            </View>

            {errors.gelin && (
              <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                {errors.gelin.message}
              </Text>
            )}

            <View style={{ flex: 0.5 }}>
              <Controller
                control={control}
                name="damat"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="damat"
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    right={
                      <TextInput.Icon iconColor="#000" icon="gender-male" />
                    }
                  />
                )}
              />
              {errors.damat && (
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.error }}
                >
                  {errors.damat.message}
                </Text>
              )}
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Text style={{ marginRight: 8 }}>Fotoshooting</Text>
              <Controller
                name="shooting"
                control={control}
                defaultValue={false} // Use a default value of false
                render={({ field: { onChange } }) => (
                  <Switch
                    value={isFotoshootingOn}
                    onValueChange={(value) => {
                      setIsFotoshootingOn(value);
                      onChange(value); // This sets the form field value
                    }}
                    label="Fotoshooting"
                  />
                )}
              />
            </View>

            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Text style={{ marginRight: 8 }}>Saal Foto</Text>
              <Controller
                name="saalfoto"
                control={control}
                defaultValue={false} // Use a default value of false
                render={({ field: { onChange } }) => (
                  <Switch
                    value={isSaalFotoOn}
                    onValueChange={(value) => {
                      setIsSaalFotoOn(value);
                      onChange(value); // This sets the form field value
                    }}
                    label="Saal Foto"
                  />
                )}
              />
            </View>
          </View>

          <HookFormController
            label="beschreibung"
            control={control}
            required={true}
            errors={errors}
            multiline
          />
          <Headline>Mitarbeiter hinzufügen</Headline>
          <Controller
            name="mitarbeiter"
            control={control}
            defaultValue=""
            rules={{ required: "Mitarbeiter auswählen ist erforderlich" }}
            render={({ field: { onChange } }) => (
              <PaperSelect
                label="Mitarbeiter auswählen"
                value={usersData.value}
                onSelection={(value) => {
                  setUsersData({
                    ...usersData,
                    value: value.text,
                    selectedList: value.selectedList,
                    error: "",
                  });
                  onChange(value.text);
                }}
                arrayList={[...usersData.list]}
                textInputMode="outlined"
                selectedArrayList={[...usersData.selectedList]}
                errorText={usersData.error}
                multiEnable={false}
                checkboxColor="blue"
                checkboxLabelStyle={{ color: "black", fontWeight: "700" }}
                dialogButtonLabelStyle={{
                  padding: 10,
                  borderRadius: 5,
                }}
                searchPlaceholder="Suchen"
                modalCloseButtonText="Abbrechen"
                modalDoneButtonText="Auswählen"
              />
            )}
          />
          {errors.mitarbeiter && (
            <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
              {errors.mitarbeiter.message}
            </Text>
          )}
          <Controller
            name="positions"
            control={control}
            defaultValue=""
            rules={{ required: "Position auswählen ist erforderlich" }}
            render={({ field: { onChange } }) => (
              <PaperSelect
                label="Position(en) auswählen"
                value={positions.value}
                onSelection={(value) => {
                  setPositions({
                    ...positions,
                    value: value.text,
                    selectedList: value.selectedList,
                    error: "",
                  });
                  onChange(value.text);
                }}
                arrayList={[...positions.list]}
                selectedArrayList={[...positions.selectedList]}
                errorText={positions.error}
                containerStyle={{ flex: 1 }}
                multiEnable={true}
                textInputMode="outlined"
                dialogButtonLabelStyle={{
                  padding: 10,
                  borderRadius: 5,
                }}
                searchPlaceholder="Suchen"
                modalCloseButtonText="Abbrechen"
                modalDoneButtonText="Auswählen"
              />
            )}
          />
          {errors.positions && (
            <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
              {errors.positions.message}
            </Text>
          )}
          <PaperButton
            style={styles.button}
            labelStyle={styles.text}
            mode={"outlined"}
            onPress={() => {
              const usersDataError = selectValidator(usersData.value);
              const positionError = selectValidator(positions.value);
              if (usersDataError || positionError) {
                setPositions({ ...positions, error: positionError });
                setUsersData({ ...usersData, error: usersDataError });
                return;
              }

              //find user from selectedList
              const selectedValues = usersData.selectedList.map(
                (user) => user.value
              );

              // add positions to for selectedUser in selectedList
              usersData.selectedList
                .filter((user) => selectedValues.includes(user.value))
                .forEach((user) => {
                  user.positions = positions.value.split(",");
                });

              // copy selectedList in paperUsersList
              setPaperUserList([...paperUsersList, ...usersData.selectedList]);

              // remove selectedUser from List
              usersData.list = usersData.list.filter(
                (user) => !selectedValues.includes(user.value)
              );

              usersData.selectedList = [];
              usersData.value = "";
              positions.value = "";
              //update userData

              setUsersData(usersData);

              // copy the values of usersData

              console.log("PaperUserList: ", paperUsersList);
              console.log("UsersData after remove User", usersData);

              //show the selected user list
              setUserAndPositionSubmitted(true);
            }}
          >
            Mitarbeiter Hinzufügen
          </PaperButton>

          {isUserAndPositionSubmitted && (
            <List.Section>
              <List.Accordion
                title="Hinzugefügte Mitarbeiter(n)"
                left={(props) => <List.Icon {...props} icon="account" />}
                expanded={expanded}
                onPress={handlePress}
              >
                {paperUsersList.map((userData) => (
                  <List.Item
                    key={userData._id}
                    title={userData.value}
                    description={userData.positions}
                    right={(props) => (
                      <>
                        <TouchableOpacity
                          onPress={() => {
                            setDeleteItem(userData);
                            setShowDialog(true);
                          }}
                        >
                          <List.Icon {...props} icon="delete" />
                        </TouchableOpacity>
                      </>
                    )}
                  />
                ))}
              </List.Accordion>
            </List.Section>
          )}

          <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
            <Dialog.Title>{deleteItem && `${deleteItem.value}`}</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                Sind Sie sicher, dass Sie diesen Mitarbeiter löschen möchten?
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowDialog(false)}>Abbrechen</Button>
              <Button
                onPress={() => handleDeleteItem(deleteItem._id)}
                style={{ color: "red" }}
              >
                Löschen
              </Button>
            </Dialog.Actions>
          </Dialog>

          <HookFormButtons onPress={handleSubmit(onSubmit)} />
        </ScrollView>
      </Provider>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    margin: 10,
  },
  dateField: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});

export default CreateWeddingScreen;
