import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Platform } from "react-native";
import { Text, TextInput, Button, RadioButton } from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { createTables, insertHousehold } from "../database"; // Import database functions

const NewHouseholdForm = () => {
  const router = useRouter();

  // Form State
  const [sitio, setSitio] = useState("");
  const [householdNumber, setHouseholdNumber] = useState("");
  const [dateOfVisit, setDateOfVisit] = useState(new Date()); // ✅ Default to today
  const [showDatePicker, setShowDatePicker] = useState(false); // ✅ Manage Date Picker visibility
  const [toilet, setToilet] = useState("");
  const [sourceOfWater, setSourceOfWater] = useState("");
  const [sourceOfIncome, setSourceOfIncome] = useState("");
  const [foodProduction, setFoodProduction] = useState("");
  const [membership4Ps, setMembership4Ps] = useState("");

  useEffect(() => {
    createTables(); // Ensure tables are created when the component mounts
  }, []);

  // ✅ Function to check for empty fields
  const validateForm = () => {
    if (!sitio || !householdNumber || !dateOfVisit || !toilet || !sourceOfWater || !sourceOfIncome || !foodProduction || !membership4Ps) {
      Alert.alert("Missing Fields", "Please fill in all the required fields before proceeding.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return; // ✅ Stop if fields are empty

    // ✅ Format the date before saving (YYYY-MM-DD)
    const formattedDate = dateOfVisit.toISOString().split("T")[0];

    const data = { 
      sitio, 
      householdNumber, 
      dateOfVisit: formattedDate,  // ✅ Save formatted date
      toilet, 
      sourceOfWater, 
      sourceOfIncome, 
      foodProduction, 
      membership4Ps 
    };

    const householdId = await insertHousehold(data);  // ✅ Save locally first

    if (householdId) {
      Alert.alert("Success", "Household data saved successfully!");

      console.log("🚀 Syncing to Supabase...");
      
      await syncWithSupabase();  // ✅ Ensure sync before navigating
      
      // ✅ Navigate to mealPattern/index.js
      router.push(`/mealPattern?householdId=${householdId}`);
    } else {
      Alert.alert("Error", "Failed to save household data.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Household Information</Text>
      <TextInput label="Sitio/Purok" mode="outlined" value={sitio} onChangeText={setSitio} style={styles.input} />
      <TextInput label="Household No." mode="outlined" value={householdNumber} onChangeText={setHouseholdNumber} style={styles.input} />

      {/* ✅ Clickable Date Picker Field */}
      <Text style={styles.subHeader}>Date of Visit:</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          mode="outlined"
          value={dateOfVisit.toDateString()} // ✅ Display formatted date
          editable={false} // ❌ Prevent manual input
          style={styles.input}
          left={
            <TextInput.Icon 
              icon="calendar" 
              onPress={() => setShowDatePicker(true)} // ✅ Clicking the icon also opens calendar
            />
          }
        />
      </TouchableOpacity>

      {/* ✅ Built-in Date Picker for Expo */}
      {showDatePicker && (
        <DateTimePicker
          value={dateOfVisit}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDateOfVisit(selectedDate);
            }
          }}
        />
      )}

      {/* Toilet */}
      <Text style={styles.subHeader}>Toilet:</Text>
      <RadioButton.Group onValueChange={setToilet} value={toilet}>
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Presence" value="Presence" />
          <RadioButton.Item label="Absence" value="Absence" />
        </View>
      </RadioButton.Group>

      {/* Source of Water */}
      <Text style={styles.subHeader}>Source of Water</Text>
      <RNPickerSelect
        onValueChange={(value) => setSourceOfWater(value)}
        items={[
          { label: "Spring", value: "Spring" },
          { label: "DCWD", value: "DCWD" },
          { label: "Tabay", value: "Tabay" },
        ]}
        style={pickerSelectStyles}
      />

      {/* Source of Income */}
      <Text style={styles.subHeader}>Source of Income</Text>
      <RNPickerSelect
        onValueChange={(value) => setSourceOfIncome(value)}
        items={[
          { label: "Farming", value: "Farming" },
          { label: "Fishing", value: "Fishing" },
          { label: "Business", value: "Business" },
          { label: "Other", value: "Other" },
        ]}
        style={pickerSelectStyles}
      />

      {/* Food Production */}
      <Text style={styles.subHeader}>Food Production (Vegetable Garden/Raised Animals for Food):</Text>
      <RadioButton.Group onValueChange={setFoodProduction} value={foodProduction}>
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Yes" value="Yes" />
          <RadioButton.Item label="No" value="No" />
        </View>
      </RadioButton.Group>

      {/* Membership to 4Ps */}
      <Text style={styles.subHeader}>Membership to 4Ps:</Text>
      <RadioButton.Group onValueChange={setMembership4Ps} value={membership4Ps}>
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Yes" value="Yes" />
          <RadioButton.Item label="No" value="No" />
        </View>
      </RadioButton.Group>

      {/* Save & Next Button */}
      <Button mode="contained" style={styles.button} onPress={handleSave}>
        Save & Next
      </Button>
    </ScrollView>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#ffff" },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  subHeader: { fontSize: 16, fontWeight: "bold", marginTop: 16 },
  input: { marginBottom: 16 },
  radioContainer: { 
    flexDirection: "row", 
    alignItems: "center",
    gap: 5, 
  },
  button: { marginTop: 20 },
});

// Styles for the dropdown menu
const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    color: "black",
    backgroundColor: "white",
    marginBottom: 16,
  },
  inputAndroid: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    color: "black",
    backgroundColor: "white",
    marginBottom: 16,
  },
};

export default NewHouseholdForm;
