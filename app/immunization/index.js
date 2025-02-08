import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, TextInput, Button, RadioButton } from "react-native-paper";
import { useRouter } from "expo-router";

const ImmunizationScreen = () => {
  const router = useRouter();

  const [bcg, setBcg] = useState("");
  const [hepatitis, setHepatitis] = useState("");
  const [pentavalent, setPentavalent] = useState("");
  const [oralPolio, setOralPolio] = useState("");
  const [pneumococcal, setPneumococcal] = useState("");
  const [mmr, setMmr] = useState("");
  const [remarks, setRemarks] = useState("");

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Fully Immunized Child</Text>

      {/* BCG */}
      <Text style={styles.subHeader}>BCG:</Text>
      <RadioButton.Group onValueChange={setBcg} value={bcg}>
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Yes" value="Yes" />
          <RadioButton.Item label="No" value="No" />
        </View>
      </RadioButton.Group>

      {/* Hepatitis */}
      <Text style={styles.subHeader}>Hepatitis:</Text>
      <RadioButton.Group onValueChange={setHepatitis} value={hepatitis}>
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Yes" value="Yes" />
          <RadioButton.Item label="No" value="No" />
        </View>
      </RadioButton.Group>

      {/* Pentavalent Vaccine */}
      <Text style={styles.subHeader}>Pentavalent Vaccine:</Text>
      <RadioButton.Group onValueChange={setPentavalent} value={pentavalent}>
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Yes" value="Yes" />
          <RadioButton.Item label="No" value="No" />
        </View>
      </RadioButton.Group>

      {/* Oral Polio Vaccine */}
      <Text style={styles.subHeader}>Oral Polio Vaccine:</Text>
      <RadioButton.Group onValueChange={setOralPolio} value={oralPolio}>
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Yes" value="Yes" />
          <RadioButton.Item label="No" value="No" />
        </View>
      </RadioButton.Group>

      {/* Pneumococcal Conjugate */}
      <Text style={styles.subHeader}>Pneumococcal Conjugate:</Text>
      <RadioButton.Group onValueChange={setPneumococcal} value={pneumococcal}>
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Yes" value="Yes" />
          <RadioButton.Item label="No" value="No" />
        </View>
      </RadioButton.Group>

      {/* MMR */}
      <Text style={styles.subHeader}>Measles, Mumps, Rubella (MMR):</Text>
      <RadioButton.Group onValueChange={setMmr} value={mmr}>
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Yes" value="Yes" />
          <RadioButton.Item label="No" value="No" />
        </View>
      </RadioButton.Group>

      {/* Remarks */}
      <TextInput
        label="Remarks"
        mode="outlined"
        value={remarks}
        onChangeText={setRemarks}
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Button mode="contained" style={styles.addButton}>
          + Add Member
        </Button>
        <Button mode="contained" style={styles.saveButton} >
          Review and Save
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "left" },
  subHeader: { fontSize: 16, fontWeight: "bold", marginTop: 16 },
  input: { marginBottom: 16 },
  radioContainer: { flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginBottom: 10 },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  addButton: { backgroundColor: "#205C3B", flex: 1, marginRight: 8 },
  saveButton: { backgroundColor: "#A07D40", flex: 1, marginLeft: 8 },
});

export default ImmunizationScreen;
