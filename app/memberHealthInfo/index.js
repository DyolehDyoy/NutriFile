import React, { useState } from "react";
import { insertMemberHealthInfo } from "../database"; // Import function
import { useLocalSearchParams, useRouter } from "expo-router"; // ✅ Import for getting memberId

import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  RadioButton,
  Card,
  Divider,
} from "react-native-paper";

const MemberHealthInfoScreen = () => {
  const router = useRouter();
  const { memberId } = useLocalSearchParams(); // ✅ Get memberId from navigation params

  // Convert memberId to an integer (avoid issues with string values)
  const parsedMemberId = memberId ? parseInt(memberId, 10) : null;

  // Existing states
  const [philHealth, setPhilHealth] = useState("");
  const [familyPlanning, setFamilyPlanning] = useState("");
  const [smoker, setSmoker] = useState("");
  const [alcoholDrinker, setAlcoholDrinker] = useState("");

  // Physical Activity Radio + Text Input
  const [physicalActivity, setPhysicalActivity] = useState("");
  const [specificPhysicalActivity, setSpecificPhysicalActivity] = useState("");

  // Morbidity Radio + Text Input
  const [morbidity, setMorbidity] = useState("");
  const [specify, setSpecify] = useState("");

  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    console.log("parsedMemberId:", parsedMemberId);

    try {
      if (!parsedMemberId) {
        console.log("❌ No parsedMemberId, returning");
        Alert.alert("Error", "Missing member ID. Please try again.");
        return;
      }

      console.log("✅ Setting loading to true now...");
      setLoading(true);
      console.log("✅ Loading set to true, continuing...");

      // If the user typed something in the text field, we always override the radio choice.
      let finalPhysicalActivity = physicalActivity.trim();
      if (specificPhysicalActivity.trim()) {
        finalPhysicalActivity = specificPhysicalActivity.trim();
      }

      let finalMorbidity = morbidity.trim();
      if (specify.trim()) {
        finalMorbidity = specify.trim();
      }

      const healthData = {
        memberid: parsedMemberId,
        philHealth,
        familyPlanning,
        smoker,
        alcoholdrinker: alcoholDrinker,
        physicalActivity: finalPhysicalActivity,
        morbidity: finalMorbidity,
      };

      console.log("📌 HealthData object created:", healthData);

      const healthInfoId = await insertMemberHealthInfo(healthData);
      console.log("✅ insertMemberHealthInfo returned:", healthInfoId);

      if (healthInfoId) {
        console.log(`✅ Member health info saved with ID: ${healthInfoId}`);
        Alert.alert("Success", "Health information saved successfully!");
        router.push("/immunization");
        console.log("✅ Pushed to /immunization");
      } else {
        console.log("❌ insertMemberHealthInfo returned null/undefined");
        Alert.alert("Error", "Failed to save health info.");
      }

      setLoading(false);
      console.log("✅ Loading set to false, handleNext finished.");
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
          <Text style={styles.subHeader}>
            Family Planning (For reproductive age only)
          </Text>
          <RadioButton.Group
            onValueChange={setFamilyPlanning}
            value={familyPlanning}
          >
            <View style={styles.radioContainer}>
              <RadioButton.Item label="Yes" value="Yes" />
              <RadioButton.Item label="No" value="No" />
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Lifestyle: Smoking & Alcohol Consumption */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subHeader}>Smoker</Text>
          <RadioButton.Group onValueChange={setSmoker} value={smoker}>
            <View style={styles.radioContainer}>
              <RadioButton.Item label="Yes" value="Yes" />
              <RadioButton.Item label="No" value="No" />
            </View>
          </RadioButton.Group>

          <Divider style={styles.divider} />

          <Text style={styles.subHeader}>Alcohol drinker</Text>
          <RadioButton.Group
            onValueChange={setAlcoholDrinker}
            value={alcoholDrinker}
          >
            <View style={styles.radioContainer}>
              <RadioButton.Item label="Yes" value="Yes" />
              <RadioButton.Item label="No" value="No" />
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Physical Activity */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subHeader}>Physical Activity</Text>
          <RadioButton.Group
            onValueChange={setPhysicalActivity}
            value={physicalActivity}
          >
            <View style={styles.radioContainer}>
              <RadioButton.Item label="Yes" value="Yes" />
              <RadioButton.Item label="No" value="No" />
            </View>
          </RadioButton.Group>

          {/* If user selected "Yes", show text input for the actual activity */}
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

      {/* Morbidity (Health Conditions) */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subHeader}>Morbidity (Diabetes, Hypertension, TB, etc.)</Text>
          <RadioButton.Group onValueChange={setMorbidity} value={morbidity}>
            <View style={styles.radioContainer}>
              <RadioButton.Item label="Presence" value="Presence" />
              <RadioButton.Item label="Absence" value="Absence" />
            </View>
          </RadioButton.Group>

          {/* If "Presence", let the user specify the condition */}
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

      {/* Next Button */}
      <Button
        mode="contained"
        style={styles.button}
        disabled={loading}
        onPress={() => {
          console.log("🔍 Button pressed: handleNext starting...");
          handleNext();
        }}
      >
        {loading ? <ActivityIndicator color="white" /> : "Save & Next"}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subHeader: { fontSize: 16, fontWeight: "bold", marginTop: 10 },
  input: { marginTop: 8, marginBottom: 12 },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: 5,
  },
  divider: { marginVertical: 10 },
  button: { marginTop: 20, padding: 10 },
  card: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 2,
  },
});

export default MemberHealthInfoScreen;
