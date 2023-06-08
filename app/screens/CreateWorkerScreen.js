import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import * as Yup from "yup";

import { TextInput, Text, Provider, useTheme } from "react-native-paper";
import DropDown from "react-native-paper-dropdown";
import HookFormButtons from "../components/forms/HookFormButtons";

import { auth, EMAIL_SUFFIX, firestore } from "../config/firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useForm, Controller } from "react-hook-form";

import HookFormController from "../components/forms/HookFormController";
import { yupResolver } from "@hookform/resolvers/yup";
import { Toast } from "toastify-react-native";
import { PaperSelect } from "react-native-paper-select";

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
} from "firebase/firestore";
import { ScrollView } from "react-native-gesture-handler";

const CreateWorkerScreen = () => {
  const [activitiesData, setActivitiesData] = useState({
    value: "",
    list: [],
    selectedList: [],
    error: "",
  });
  const [usersData, setUsersData] = useState({
    value: "",
    list: [
      { _id: "1", value: "admin" },
      { _id: "2", value: "mitarbeiter" },
    ],
    selectedList: [],
    error: "",
  });

  const onSubmit = (values) => {
    console.log(values);
    const email = values.benutzername + EMAIL_SUFFIX;
    const password = values.passwort;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        values.userUid = userCredential.user.uid;
        addUser(values);

        Toast.success("Mitarbeiter konto erstellt", "bottom");

        reset();

        setActivitiesData({
          ...activitiesData,
          value: "",
          selectedList: [],
          error: "",
        });
        setUsersData({
          value: "",
          list: [
            { _id: "1", value: "admin" },
            { _id: "2", value: "mitarbeiter" },
          ],
          selectedList: [],
          error: "",
        });
      })
      .catch((error) => {
        Toast.error("Mitarbeiter konto nicht erstellt werden", "bottom");
        console.log(error.code);
        console.log(error.message);
      });
  };

  // Text Theme
  const theme = useTheme();

  //Register
  useEffect(() => {
    register("vorname");
    register("nachname");
    register("geburtsdatum");
    register("adresse");
    register("benutzername");
    register("passwort");
    register("rolle");
    register("activity");

    //Getting activities from Firebase
    const activitiesCollectionRef = collection(firestore, "activities");
    getDocs(activitiesCollectionRef).then((snapshot) => {
      const activities = [];
      // Setting activities
      snapshot.forEach((doc) => {
        activities.push({
          _id: doc.id,
          value: doc.data().activity,
        });
      });
      // Update State
      setActivitiesData({
        value: "",
        list: activities,
        selectedList: [],
        error: "",
      });
    });
  }, [register]);

  // Dropdown hooks
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  //Dropdown Handles
  const onDropdownOpen = () => {
    setOpen(true);
  };

  const onDropdownClose = () => {
    setOpen(false);
  };

  const onDropdownSelect = (item) => {
    setValue(item.value);
    setOpen(false);
  };

  // useForm Hooks
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      vorname: "",
      nachname: "",
      geburtsdatum: "",
      adresse: "",
      benutzername: "",
      passwort: "",
    },
  });

  return (
    <>
      <ScrollView>
        <Provider>
          <HookFormController
            label="vorname"
            control={control}
            required={true}
            errors={errors}
          />
          <HookFormController
            label="nachname"
            control={control}
            required={true}
            errors={errors}
          />
          <HookFormController
            label="geburtsdatum"
            control={control}
            required={true}
            errors={errors}
            right={<TextInput.Icon iconColor="#000" icon="calendar" />}
          />
          <HookFormController
            label="benutzername"
            control={control}
            required={true}
            errors={errors}
          />
          <HookFormController
            label="passwort"
            control={control}
            required={true}
            errors={errors}
            right={<TextInput.Icon iconColor="#000" icon="eye" />}
          />

          <Controller
            name="rolle"
            control={control}
            defaultValue=""
            rules={{ required: "Rolle auswählen ist erforderlich" }}
            render={({ field: { onChange } }) => (
              <PaperSelect
                label="Rolle auswählen"
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
          {errors.rolle && (
            <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
              {errors.rolle.message}
            </Text>
          )}
          {usersData.value === "mitarbeiter" && (
            <Controller
              name="activity"
              control={control}
              defaultValue=""
              rules={{ required: "Aktivität auswählen ist erforderlich" }}
              render={({ field: { onChange } }) => (
                <PaperSelect
                  label="Aktivität auswählen"
                  value={activitiesData.value}
                  onSelection={(value) => {
                    setActivitiesData({
                      ...activitiesData,
                      value: value.text,
                      selectedList: value.selectedList,
                      error: "",
                    });
                    onChange(value.text);
                  }}
                  arrayList={[...activitiesData.list]}
                  textInputMode="outlined"
                  selectedArrayList={[...activitiesData.selectedList]}
                  errorText={activitiesData.error}
                  multiEnable={true}
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
          )}

          {errors.activity && (
            <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
              {errors.activity.message}
            </Text>
          )}

          <HookFormController
            label="adresse"
            control={control}
            required={true}
            errors={errors}
            multiline
          />
          <HookFormButtons onPress={handleSubmit(onSubmit)} />
        </Provider>
      </ScrollView>
    </>
  );
};

//add user into firestore
const addUser = async (user) => {
  const {
    vorname,
    nachname,
    geburtsdatum,
    rolle,
    benutzername,
    passwort,
    activity,
    userUid,
  } = user;

  try {
    const userRef = doc(firestore, "users", userUid);
    if (activity === undefined) {
      await setDoc(userRef, {
        vorname,
        nachname,
        geburtsdatum,
        rolle,
        benutzername,
        passwort,
        userUid,
      });
    } else {
      await setDoc(userRef, {
        vorname,
        nachname,
        geburtsdatum,
        rolle,
        benutzername,
        passwort,
        activity,
        userUid,
      });
    }
    Toast.success("Mitarbeiter daten erfolgreich erstellt", "bottom");
  } catch (error) {
    console.error(error.message);
    console.error(error.code);
    Toast.error("Mitarbeiter daten konto nicht erstellt werden", "bottom");
  }
};

//validation
const schema = Yup.object().shape({
  benutzername: Yup.string().required("Pflichtfeld").label("benutzername"),
  passwort: Yup.string()
    .required("Pflichtfeld")
    .min(6, "kurz")
    .max(15, "lang")
    .label("passwort"),
  vorname: Yup.string().required("Pflichtfeld").min(3, "kurz").label("vorname"),
  nachname: Yup.string()
    .required("Pflichtfeld")
    .min(3, "kurz")
    .label("nachname"),
  geburtsdatum: Yup.string().matches(
    /^(0?[1-9]|[1-2][0-9]|3[0-1])\.(0?[1-9]|1[0-2])\.\d{4}$/,
    "TT.MM.JJJJ (nicht Pflichtfeld)"
  ),
  adresse: Yup.string().label("adresse"),
  rolle: Yup.string().required("mindestens eine Option auswählen").min(1),
});

const styles = StyleSheet.create({
  container: {
    padding: 10,
    margin: 10,
  },
  dateField: {
    flexDirection: "row",
    width: "100%",
    padding: 15,
    marginVertical: 10,
    borderRadius: 16,
  },
});
export default CreateWorkerScreen;
