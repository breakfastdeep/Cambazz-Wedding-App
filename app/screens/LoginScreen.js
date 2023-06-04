import React from "react";
import { ImageBackground, View, StyleSheet, Image, Button } from "react-native";
import colors from "../config/colors";
import * as Yup from "yup";
import { signInWithEmailAndPassword } from "firebase/auth";
import { EMAIL_SUFFIX, auth } from "../config/firebase/firebase";
import { AppForm, AppFormField, SubmitButton } from "../components/forms";
import Toast from "react-native-toast-message";

const validationSchema = Yup.object().shape({
  username: Yup.string().required().min(3).label("Username"),
  password: Yup.string().required().min(4).label("Password"),
});

function LoginScreen(props) {
  return (
    <ImageBackground
      style={styles.background}
      source={require("../assets/bg_hz3.jpg")}
    >
      <AppForm
        initialValues={{ username: "", password: "" }}
        onSubmit={(values) => handleSignIn(values)}
        validationSchema={validationSchema}
      >
        <AppFormField
          autoCapitalize="none"
          autoCorrect={false}
          icon="human"
          name="username"
          placeholder="Benutzername"
        />
        <AppFormField
          autoCapitalize="none"
          autoCorrect={false}
          icon="lock"
          name="password"
          placeholder="Passwort"
          secureTextEntry
          textContentType="password"
        />
        <SubmitButton title="Einloggen" />
      </AppForm>
    </ImageBackground>
  );
}

handleSignIn = (values) => {
  const email = values.username + EMAIL_SUFFIX;
  const password = values.password;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      Toast.show({
        type: "success",
        text1: "Eingeloggen erfolgreich",
      });
    })
    .catch((error) => {
      Toast.show({
        type: "error",
        text1: "Benutzername oder Passwort falsch",
      });
    });
};
const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 60,
  },
});

export default LoginScreen;
