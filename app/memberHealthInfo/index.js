import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, TextInput, Button, RadioButton } from "react-native-paper";
import { useRouter } from "expo-router";

const MemberHealthInfoScreen = () => {
  const router = useRouter();

  const [philHealth, setPhilHealth] = useState("");
  const [familyPlanning, setFamilyPlanning] = useState("");
  const [smoker, setSmoker] = useState("");
  const [alcoholDrinker, setAlcoholDrinker] = useState("");
  const [physicalActivity, setPhysicalActivity] = useState("");
  const [morbidity, setMorbidity] = useState("");
  const [specify, setSpecify] = useState("");

  return (
    <ScrollView style={styles.container}>

      {/* PhilHealth Membership */}
      <Text style={styles.subHeader}>PhilHealth Membership:</Text>
      <RadioButton.Group onValueChange={setPhilHealth} value={philHealth}>
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Yes" value="Yes" />
          <RadioButton.Item label="No" value="No" />
        </View>
      </RadioButton.Group>

      {/* Family Planning (for reproductive age only) */}
      <Text style={styles.subHeader}>Family Planning: (For reproductive age only)</Text>
      <RadioButton.Group onValueChange={setFamilyPlanning} value={familyPlanning}>
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Yes" value="Yes" />
          <RadioButton.Item label="No" value="No" />
        </View>
      </RadioButton.Group>

      {/* Smoker */}
      <Text style={styles.subHeader}>Smoker:</Text>
      <RadioButton.Group onValueChange={setSmoker} value={smoker}>
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Yes" value="Yes" />
          <RadioButton.Item label="No" value="No" />
        </View>
      </RadioButton.Group>

      {/* Alcohol Drinker */}
      <Text style={styles.subHeader}>Alcohol Drinker:</Text>
      <RadioButton.Group onValueChange={setAlcoholDrinker} value={alcoholDrinker}>
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Yes" value="Yes" />
          <RadioButton.Item label="No" value="No" />
        </View>
      </RadioButton.Group>

      {/* Physical Activity */}
      <Text style={styles.subHeader}>Physical Activity:</Text>
      <RadioButton.Group onValueChange={setPhysicalActivity} value={physicalActivity}>
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Yes" value="Yes" />
          <RadioButton.Item label="No" value="No" />
        </View>
      </RadioButton.Group>

      {/* Specify Field */}
      <TextInput label="Please specify" mode="outlined" value={specify} onChangeText={setSpecify} style={styles.input} />

      {/* Morbidity */}
      <Text style={styles.subHeader}>Morbidity: (Diabetes, Hypertension, TB, etc.)</Text>
      <RadioButton.Group onValueChange={setMorbidity} value={morbidity}>
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Presence" value="Presence" />
          <RadioButton.Item label="Absence" value="Absence" />
        </View>
      </RadioButton.Group>

      {/* Specify Field for Morbidity */}
      <TextInput label="Please specify" mode="outlined" value={specify} onChangeText={setSpecify} style={styles.input} />

      {/* Next Button */}
      <Button mode="contained" style={styles.button} onPress={() => router.push("/immunization")}>
       Next
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  subHeader: { fontSize: 16, fontWeight: "bold", marginTop: 16 },
  input: { marginBottom: 16 },
  radioContainer: { flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginBottom: 10 },
  button: { marginTop: 20 },
});

export default MemberHealthInfoScreen;
