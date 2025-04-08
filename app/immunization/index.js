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
import database from "../database";

const ImmunizationScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log("Route parameters:", params);

  // Use the route parameters as strings (no parseInt here)
  const { householdId, memberId } = params;
  console.log("HouseholdId from route:", householdId);
  console.log("MemberId from route:", memberId);

  // Immunization states
  const [bcg, setBcg] = useState("");
  const [hepatitis, setHepatitis] = useState("");
  const [pentavalent, setPentavalent] = useState("");
  const [oralPolio, setOralPolio] = useState("");
  const [pneumococcal, setPneumococcal] = useState("");
  const [mmr, setMmr] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper function to save immunization data locally (and sync if online)
  const saveImmunizationData = async () => {
    // Instead of using parsedMemberId and parsedHouseholdId, use the raw strings:
    if (!memberId) {
      Alert.alert("Error", "Missing member ID.");
      return false;
    }
    if (!householdId) {
      Alert.alert("Error", "Missing household ID.");
      return false;
    }
    setLoading(true);

    // Build the immunization data object using the proper keys:
    const immunData = {
      member_uuid: memberId,          // full UUID string
      bcg,
      hepatitis,
      pentavalent,
      oralPolio,
      pneumococcal,
      mmr,
      remarks,
      household_uuid: householdId,      // full UUID string
    };
    console.log("📌 Attempting to save immunization data:", immunData);

    // Insert the immunization data locally
    const immunizationId = await database.insertImmunization(immunData);
    if (immunizationId) {
      // Attempt to sync immediately with Supabase
      await database.syncWithSupabase();
      setLoading(false);
      return true;
    } else {
      setLoading(false);
      return false;
    }
  };

  // Handler: Save the data and then show an alert prompt with two options.
  const handleSaveAndPromptNext = async () => {
    const success = await saveImmunizationData();
    if (success) {
      Alert.alert(
        "Success",
        "Immunization data has been saved successfully! What would you like to do next?",
        [
          {
            text: "Add Another Member",
            onPress: () =>
              router.push({
                pathname: "/addMember",
                params: { householdId }, // Pass householdId as the UUID string
              }),
          },
          {
            text: "Dashboard",
            onPress: () =>
              router.push({
                pathname: "/dashboard",
                params: { householdId },
              }),
          },
        ]
      );
    } else {
      Alert.alert("Error", "Failed to save immunization data.");
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

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          style={styles.primaryButton}
          onPress={handleSaveAndPromptNext}
          disabled={loading}
          buttonColor="#205C3B"
        >
          {loading ? <ActivityIndicator color="white" /> : "Save Immunization Data"}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  subHeader: { fontSize: 18, fontWeight: "600", marginTop: 16, marginBottom: 8, color: "#444" },
  input: { marginTop: 8, marginBottom: 12, backgroundColor: "#fff" },
  radioContainer: { flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginVertical: 8 },
  buttonContainer: { marginTop: 24, alignItems: "center" },
  primaryButton: { backgroundColor: "#205C3B", paddingVertical: 12, paddingHorizontal: 16, width: "90%" },
  card: { marginBottom: 20, padding: 16, backgroundColor: "white", borderRadius: 12, elevation: 3 },
});

export default ImmunizationScreen;
