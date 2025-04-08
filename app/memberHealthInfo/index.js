import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Text, TextInput, Button, RadioButton, Card, Divider } from "react-native-paper";
import database from "../database"; // Import your database module
import DateTimePicker from "@react-native-community/datetimepicker";

const MemberHealthInfoScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log("Route parameters:", params);

  // Extract as strings without converting to numbers
  const { householdId, memberId } = params;
  
  // Validate that we have full UUID strings (a typical UUID is ~36 characters)
  if (!householdId || typeof householdId !== "string" || householdId.length < 30) {
    Alert.alert("Error", "Missing or invalid householdId. Please try again.");
    router.back();
    return null;
  }
  if (!memberId || typeof memberId !== "string" || memberId.length < 30) {
    Alert.alert("Error", "Missing or invalid memberId. Please try again.");
    router.back();
    return null;
  }
  
  console.log("Parsed householdId from route:", householdId);
  console.log("Parsed memberId from route:", memberId);

  // States for health info
  const [philHealth, setPhilHealth] = useState("");
  const [familyPlanning, setFamilyPlanning] = useState("");
  const [lastMenstrualPeriod, setLastMenstrualPeriod] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [smoker, setSmoker] = useState("");
  const [alcoholDrinker, setAlcoholDrinker] = useState("");
  const [physicalActivity, setPhysicalActivity] = useState("");
  const [specificPhysicalActivity, setSpecificPhysicalActivity] = useState("");
  const [morbidity, setMorbidity] = useState("");
  const [specify, setSpecify] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    try {
      // memberId and householdId here are assumed to be the full UUID strings.
      setLoading(true);

      // If user typed something in the physical activity specific field, override the radio choice
      let finalPhysicalActivity = physicalActivity.trim();
      if (specificPhysicalActivity.trim()) {
        finalPhysicalActivity = specificPhysicalActivity.trim();
      }
      let finalMorbidity = morbidity.trim();
      if (specify.trim()) {
        finalMorbidity = specify.trim();
      }

      // Build the health data object using UUID keys.
      // Note: The keys must match what your database.insertMemberHealthInfo function expects.
      const healthData = {
        member_uuid: memberId,          // Full member UUID from route
        philhealth: philHealth,
        familyplanning: familyPlanning,
        lastmenstrualperiod: familyPlanning === "Yes" ? lastMenstrualPeriod || null : null,
        smoker: smoker,
        alcoholdrinker: alcoholDrinker,
        physicalactivity: finalPhysicalActivity,
        morbidity: finalMorbidity,
        household_uuid: householdId,    // Full household UUID from route
      };

      console.log("📌 HealthData object created:", healthData);

      // Insert into memberhealthinfo table
      const healthInfoId = await database.insertMemberHealthInfo(healthData);
      console.log("✅ insertMemberHealthInfo returned:", healthInfoId);

      if (healthInfoId) {
        await database.syncWithSupabase();
        Alert.alert("Success", "Health information saved successfully!");
        router.push({
          pathname: "/immunization",
          params: { memberId, householdId },
        });
      } else {
        Alert.alert("Error", "Failed to save health info.");
      }

      setLoading(false);
    } catch (err) {
      console.error("❌ Error inside handleNext:", err);
      Alert.alert("Error", "A runtime error occurred in handleNext.");
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Member Health Information</Text>

      {/* PhilHealth Membership */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subHeader}>PhilHealth Membership</Text>
          <RadioButton.Group onValueChange={setPhilHealth} value={philHealth}>
            <View style={styles.radioContainer}>
              <RadioButton.Item label="Yes" value="Yes" />
              <RadioButton.Item label="No" value="No" />
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Family Planning */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subHeader}>Family Planning (For reproductive age only)</Text>
          <RadioButton.Group onValueChange={setFamilyPlanning} value={familyPlanning}>
            <View style={styles.radioContainer}>
              <RadioButton.Item label="Yes" value="Yes" />
              <RadioButton.Item label="No" value="No" />
            </View>
          </RadioButton.Group>

          {familyPlanning === "Yes" && (
            <>
              <Divider style={styles.divider} />
              <Text style={styles.subHeader}>Last Menstrual Period</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <TextInput
                  mode="outlined"
                  label="Select Date"
                  value={lastMenstrualPeriod ? new Date(lastMenstrualPeriod).toDateString() : ""}
                  editable={false}
                  style={styles.input}
                  left={<TextInput.Icon icon="calendar" />}
                />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={lastMenstrualPeriod ? new Date(lastMenstrualPeriod) : new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const formattedDate = selectedDate.toISOString().split("T")[0];
                      console.log("📌 Selected LMP Date:", formattedDate);
                      setLastMenstrualPeriod(formattedDate);
                    }
                  }}
                />
              )}
            </>
          )}
        </Card.Content>
      </Card>

      {/* Physical Activity */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subHeader}>Physical Activity</Text>
          <RadioButton.Group onValueChange={setPhysicalActivity} value={physicalActivity}>
            <View style={styles.radioContainer}>
              <RadioButton.Item label="Yes" value="Yes" />
              <RadioButton.Item label="No" value="No" />
            </View>
          </RadioButton.Group>
          {physicalActivity === "Yes" && (
            <TextInput
              label="Specify physical activity"
              mode="outlined"
              value={specificPhysicalActivity}
              onChangeText={setSpecificPhysicalActivity}
              style={styles.input}
            />
          )}
        </Card.Content>
      </Card>

      {/* Morbidity */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subHeader}>Morbidity (Diabetes, Hypertension, TB, etc.)</Text>
          <RadioButton.Group onValueChange={setMorbidity} value={morbidity}>
            <View style={styles.radioContainer}>
              <RadioButton.Item label="Presence" value="Presence" />
              <RadioButton.Item label="Absence" value="Absence" />
            </View>
          </RadioButton.Group>
          {morbidity === "Presence" && (
            <TextInput
              label="Please specify condition"
              mode="outlined"
              value={specify}
              onChangeText={setSpecify}
              style={styles.input}
            />
          )}
        </Card.Content>
      </Card>

      <Button mode="contained" style={styles.button} disabled={loading} onPress={handleNext}>
        {loading ? <ActivityIndicator color="white" /> : "Save & Next"}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  subHeader: { fontSize: 16, fontWeight: "bold", marginTop: 10 },
  input: { marginTop: 8, marginBottom: 12 },
  radioContainer: { flexDirection: "row", alignItems: "center", justifyContent: "flex-start", marginVertical: 5 },
  divider: { marginVertical: 10 },
  button: { marginTop: 20, padding: 10 },
  card: { marginBottom: 16, padding: 10, backgroundColor: "white", borderRadius: 10, elevation: 2 },
});

export default MemberHealthInfoScreen;
