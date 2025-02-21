import React, { useState } from "react";
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator, 
  Alert 
} from "react-native";
import { Text, TextInput, Button, RadioButton, Card, Divider } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import database from "../database"; // Import the default export from database.js

const ImmunizationScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log("Route parameters:", params);
  const { memberId } = useLocalSearchParams();
  const parsedMemberId = memberId ? parseInt(memberId, 10) : null;
  console.log("memberId from route:", memberId);

  // Immunization States
  const [bcg, setBcg] = useState("");
  const [hepatitis, setHepatitis] = useState("");
  const [pentavalent, setPentavalent] = useState("");
  const [oralPolio, setOralPolio] = useState("");
  const [pneumococcal, setPneumococcal] = useState("");
  const [mmr, setMmr] = useState("");
  const [remarks, setRemarks] = useState("");

  // New state to track whether immunization data has been saved
  const [savedImmunizationId, setSavedImmunizationId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to save immunization data and sync to Supabase
  const handleSave = async () => {
    if (!parsedMemberId) {
      Alert.alert("Error", "Missing member ID.");
      return;
    }
    setLoading(true);
    const immunData = {
      memberid: parsedMemberId,
      bcg,
      hepatitis,
      pentavalent,
      oralPolio,
      pneumococcal,
      mmr,
      remarks,
    };
    console.log("📌 Saving immunization data:", immunData);
    
    // Insert the immunization data locally
    const immunizationId = await database.insertImmunization(immunData);
    if (immunizationId) {
      // Force an immediate sync so that the record is pushed to Supabase
      await database.syncWithSupabase();
      Alert.alert("Success", "Immunization data saved successfully!");
      setSavedImmunizationId(immunizationId);
    } else {
      Alert.alert("Error", "Failed to save immunization data.");
    }
    setLoading(false);
  };

  // Function to navigate to Add Member screen only after immunization data is saved
  const handleAddMember = () => {
    if (!savedImmunizationId) {
      Alert.alert("Warning", "Please save immunization data first before adding a new member.");
    } else {
      router.push("/addMember");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Fully Immunized Child</Text>

      {/* BCG */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subHeader}>BCG:</Text>
          <RadioButton.Group onValueChange={setBcg} value={bcg}>
            <View style={styles.radioContainer}>
              <RadioButton.Item label="Yes" value="Yes" color="#205C3B" />
              <RadioButton.Item label="No" value="No" color="#205C3B" />
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Hepatitis */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subHeader}>Hepatitis:</Text>
          <RadioButton.Group onValueChange={setHepatitis} value={hepatitis}>
            <View style={styles.radioContainer}>
              <RadioButton.Item label="Yes" value="Yes" color="#205C3B" />
              <RadioButton.Item label="No" value="No" color="#205C3B" />
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Pentavalent Vaccine */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subHeader}>Pentavalent Vaccine:</Text>
          <RadioButton.Group onValueChange={setPentavalent} value={pentavalent}>
            <View style={styles.radioContainer}>
              <RadioButton.Item label="Yes" value="Yes" color="#205C3B" />
              <RadioButton.Item label="No" value="No" color="#205C3B" />
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Oral Polio Vaccine */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subHeader}>Oral Polio Vaccine:</Text>
          <RadioButton.Group onValueChange={setOralPolio} value={oralPolio}>
            <View style={styles.radioContainer}>
              <RadioButton.Item label="Yes" value="Yes" color="#205C3B" />
              <RadioButton.Item label="No" value="No" color="#205C3B" />
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Pneumococcal Conjugate */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subHeader}>Pneumococcal Conjugate:</Text>
          <RadioButton.Group onValueChange={setPneumococcal} value={pneumococcal}>
            <View style={styles.radioContainer}>
              <RadioButton.Item label="Yes" value="Yes" color="#205C3B" />
              <RadioButton.Item label="No" value="No" color="#205C3B" />
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* MMR */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subHeader}>Measles, Mumps, Rubella (MMR):</Text>
          <RadioButton.Group onValueChange={setMmr} value={mmr}>
            <View style={styles.radioContainer}>
              <RadioButton.Item label="Yes" value="Yes" color="#205C3B" />
              <RadioButton.Item label="No" value="No" color="#205C3B" />
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Remarks */}
      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Remarks"
            mode="outlined"
            value={remarks}
            onChangeText={setRemarks}
            multiline
            numberOfLines={3}
            style={styles.input}
            theme={{ colors: { primary: "#205C3B" } }}
          />
        </Card.Content>
      </Card>

      {/* Buttons: Save and Add Member */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : "Save"}
        </Button>
        <Button
          mode="contained"
          style={styles.addButton}
          onPress={handleAddMember}
        >
          Add Member
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f9f9f9",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: "#444",
  },
  input: {
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  saveButton: {
    backgroundColor: "#A07D40",
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
  },
  addButton: {
    backgroundColor: "#205C3B",
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
  },
  card: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 3,
  },
});

export default ImmunizationScreen;
