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

  // Extract both householdId and memberId from route params
  const { householdId, memberId } = params;
  const parsedHouseholdId = householdId ? parseInt(householdId, 10) : null;
  const parsedMemberId = memberId ? parseInt(memberId, 10) : null;
  console.log("Parsed householdId from route:", parsedHouseholdId);
  console.log("Parsed memberId from route:", parsedMemberId);

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

  // Combined function: save immunization data and then navigate to AddMember screen
  const handleSaveImmunization = async () => {
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
      householdid: parsedHouseholdId, // Added householdid here
    };
    console.log("📌 Attempting to save immunization data:", immunData);
    
    // Insert the immunization data locally
    const immunizationId = await database.insertImmunization(immunData);
    if (immunizationId) {
      // Force an immediate sync so that the record is pushed to Supabase
      await database.syncWithSupabase();
      Alert.alert("Success", "Immunization data saved successfully!", [
        {
          text: "OK",
          onPress: () => {
            router.push({
              pathname: "/familymemberslist",
              params: { householdid: parsedHouseholdId },
            });
          },
        },
      ]);      
      
    } else {
      Alert.alert("Error", "Failed to save immunization data.");
    }
    setLoading(false);
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

      {/* Single Button: Save and Add New Member */}
      <View style={styles.buttonContainer}>
      <Button mode="contained" style={styles.saveButton} onPress={handleSaveImmunization}>
  {loading ? <ActivityIndicator color="white" /> : "Save"}
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
  buttonContainer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  saveButton: { backgroundColor: "#205C3B", paddingVertical: 12, paddingHorizontal: 16 },
  card: { marginBottom: 20, padding: 16, backgroundColor: "white", borderRadius: 12, elevation: 3 },
});

export default ImmunizationScreen;
