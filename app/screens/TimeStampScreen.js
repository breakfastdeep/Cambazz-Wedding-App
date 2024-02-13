import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Card, Button, Dialog } from "react-native-paper";
import { collection, query, getDocs, doc, updateDoc } from "firebase/firestore";
import { auth, firestore } from "../config/firebase/firebase";
import moment from "moment";

const TimeStampScreen = ({ weddingsData }) => {
  const [event, setEvent] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isKommenDialogVisible, setKommenDialogVisible] = useState(false);
  const [isGehenDialogVisible, setGehenDialogVisible] = useState(false);
  const [isGehenButtonDisabled, setIsGehenButtonDisabled] = useState(true);
  const [isKommenButtonDisabled, setIsKommenButtonDisabled] = useState(true);
  const [isKBVisible, setIsKBVisible] = useState(false);
  const [isGBVisible, setIsGBVisible] = useState(false);
  const [differenceTime, setDifferenceTime] = useState(null);

  let timeout; // Declare the timeout variable

  useEffect(() => {
    fetchData();
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);

      const user = auth.currentUser;
      const weddingsCollectionRef = collection(firestore, "weddings");
      const querySnapshot = await getDocs(query(weddingsCollectionRef));
      const today = moment().format("YYYY-MM-DD");
      let foundEvent = null;

      if (!querySnapshot) {
        throw new Error("Query snapshot is undefined");
      }

      querySnapshot.forEach((doc) => {
        const weddingData = doc.data();
        const worker = weddingData.workers.find((w) => w.id === user.uid);

        if (worker) {
          const workerStartDatum = moment(
            worker.startDatum,
            "DD.MM.YYYY"
          ).format("YYYY-MM-DD");

          if (workerStartDatum === today) {
            foundEvent = { ...weddingData, workerEvent: worker };
          }
        }
      });

      // Update the event state variable
      setEvent(foundEvent);

      if (!foundEvent) {
        console.warn("No event found for the user on this day.");
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchData();
  };

  const showKommenDialog = () => {
    setKommenDialogVisible(true);
  };

  const hideKommenDialog = () => {
    setKommenDialogVisible(false);
  };

  const showGehenDialog = () => {
    setGehenDialogVisible(true);
  };

  const hideGehenDialog = () => {
    setGehenDialogVisible(false);
  };

  const handleKommen = async () => {
    const user = auth.currentUser;
    const weddingsCollectionRef = collection(firestore, "weddings");
    const querySnapshot = await getDocs(weddingsCollectionRef);

    querySnapshot.forEach(async (queryDoc) => {
      const weddingData = queryDoc.data();
      const workerIndex = weddingData.workers.findIndex(
        (worker) => worker.id === user.uid
      );

      if (workerIndex !== -1 && weddingData.id === event.id) {
        const worker = weddingData.workers[workerIndex];
        const startTime = moment().format("HH:mm:ss");

        if (!worker.timeStamp) {
          worker.timeStamp = { startTime };
        } else {
          worker.timeStamp.startTime = startTime;
        }

        await updateDoc(doc(firestore, "weddings", event.id), weddingData);
        return;
      }
    });

    setIsKBVisible(true);
    timeout = setTimeout(() => {
      setIsKBVisible(false);
    }, 10000);
    setIsKommenButtonDisabled(true);
    setIsGehenButtonDisabled(true);
    hideKommenDialog();
  };

  const handleGehen = async () => {
    const user = auth.currentUser;
    const weddingsCollectionRef = collection(firestore, "weddings");
    const querySnapshot = await getDocs(weddingsCollectionRef);

    querySnapshot.forEach(async (queryDoc) => {
      const weddingData = queryDoc.data();
      const workerIndex = weddingData.workers.findIndex(
        (worker) => worker.id === user.uid
      );

      if (workerIndex !== -1 && weddingData.id === event.id) {
        const worker = weddingData.workers[workerIndex];
        const endTime = moment().format("HH:mm:ss");

        if (!worker.timeStamp) {
          worker.timeStamp = { endTime };
        } else {
          worker.timeStamp.endTime = endTime;
        }
        const startMoment = moment(worker.timeStamp.startTime, "HH:mm:ss");
        const endMoment = moment(worker.timeStamp.endTime, "HH:mm:ss");
        const difference = moment
          .duration(endMoment.diff(startMoment))
          .subtract(1, "hours");
        const formattedDifference = moment
          .utc(difference.asMilliseconds())
          .format("HH:mm:ss");
        const localFormattedDifference = moment(
          formattedDifference,
          "HH:mm:ss"
        ).format("HH:mm:ss");
        setDifferenceTime(localFormattedDifference);
        await updateDoc(doc(firestore, "weddings", event.id), weddingData);
        return;
      }
    });

    setIsGBVisible(true);
    setIsKommenButtonDisabled(true);
    setIsGehenButtonDisabled(true);

    hideGehenDialog();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.cardContainer}>
          <Card style={styles.card}>
            <Card.Content>
              {event ? (
                <>
                  <Text style={styles.hochzeit}>
                    Hochzeit: {event.damat} & {event.gelin}
                  </Text>
                  <Text style={styles.input}>Saal: {event.ort}</Text>
                  <Text style={styles.input}>StartZeit: {event.startZeit}</Text>
                </>
              ) : (
                <Text style={styles.noEventText}>
                  Heute keine Hochzeit gefunden
                </Text>
              )}
              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  style={styles.button}
                  onPress={showKommenDialog}
                  disabled={isKommenButtonDisabled}
                >
                  Kommen
                </Button>
                <View style={styles.buttonSpacer} />
                <Button
                  mode="contained"
                  style={styles.button}
                  onPress={showGehenDialog}
                  disabled={isGehenButtonDisabled}
                >
                  Gehen
                </Button>
              </View>
            </Card.Content>
          </Card>
          {isKBVisible && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.confirmText}>
                  <Text style={styles.textBold}>Kommen Buchung</Text> is
                  erfolgreich durchgeführt.
                </Text>
              </Card.Content>
            </Card>
          )}

          {isGBVisible && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.confirmText}>
                  <Text style={styles.textBold}>Gehen Buchung</Text> is
                  erfolgreich durchgeführt.
                </Text>
                <Text>
                  Arbeitzeit: <Text>{differenceTime}</Text>
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      <Dialog visible={isKommenDialogVisible} onDismiss={hideKommenDialog}>
        <Dialog.Title> Buchung</Dialog.Title>
        <Dialog.Content>
          <Text>Kommen-Buchung durchführen?</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideKommenDialog}>Nein</Button>
          <Button onPress={handleKommen}>Ja</Button>
        </Dialog.Actions>
      </Dialog>

      <Dialog visible={isGehenDialogVisible} onDismiss={hideGehenDialog}>
        <Dialog.Title>Gehen Buchung durchführen</Dialog.Title>
        <Dialog.Content>
          <Text>Gehen-Buchung durchführen?</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideGehenDialog}>Nein</Button>
          <Button onPress={handleGehen}>Ja</Button>
        </Dialog.Actions>
      </Dialog>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    marginHorizontal: 16,
  },
  card: {
    width: "100%",
    marginBottom: 16,
  },
  hochzeit: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 16,
  },
  input: {
    textAlign: "center",
    marginBottom: 16,
  },
  noEventText: {
    textAlign: "center",
    marginBottom: 16,
    color: "red",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    height: 40,
  },
  buttonText: {
    fontSize: 16,
  },
  buttonSpacer: {
    width: 8,
  },

  confirmText: {
    textAlign: "center",
    marginBottom: 16,
    color: "green",
  },

  textBold: {
    fontWeight: "bold",
  },
});

export default TimeStampScreen;
