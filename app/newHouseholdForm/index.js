import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Platform } from "react-native";
import { Text, TextInput, Button, RadioButton } from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { observable } from "@legendapp/state";
import { insertHousehold, syncWithSupabase, createTables } from "../database"; // Import database functions

// ✅ Legend-State Observable Store
const formState = observable({
  sitio: "",
  householdNumber: "",
  householdNumberError: "",
  dateOfVisit: new Date(),
  showDatePicker: false,
  toilet: "",
  sourceOfWater: "",
  sourceOfIncome: "",
  foodProduction: "",
  membership4Ps: "",
});

const NewHouseholdForm = () => {
  const router = useRouter();

  useEffect(() => {
    createTables(); // Ensure tables are created
  }, []);

  // ✅ Function to validate numeric input for Household Number
  const handleHouseholdNumberChange = (text) => {
    if (!/^\d*$/.test(text)) {
      formState.householdNumberError.set("Please enter numbers only");
    } else {
      formState.householdNumberError.set("");
    }
    formState.householdNumber.set(text);
  };

  // ✅ Function to check for empty fields
  const validateForm = () => {
    const { sitio, householdNumber, dateOfVisit, toilet, sourceOfWater, sourceOfIncome, foodProduction, membership4Ps, householdNumberError } = formState.get();
    
    if (!sitio || !householdNumber || !dateOfVisit || !toilet || !sourceOfWater || !sourceOfIncome || !foodProduction || !membership4Ps) {
      Alert.alert("Missing Fields", "Please fill in all required fields before proceeding.");
      return false;
    }
    if (householdNumberError) {
      Alert.alert("Invalid Input", "Please enter a valid household number.");
      return false;
    }
    return true;
  };

  // ✅ Save Data
  const handleSave = async () => {
    if (!validateForm()) return; // ✅ Stop if fields are empty or invalid

    const data = {
      sitio: formState.sitio.get(),
      householdNumber: formState.householdNumber.get(),
      dateOfVisit: formState.dateOfVisit.get().toISOString().split("T")[0], // ✅ Save formatted date
      toilet: formState.toilet.get(),
      sourceOfWater: formState.sourceOfWater.get(),
      sourceOfIncome: formState.sourceOfIncome.get(),
      foodProduction: formState.foodProduction.get(),
      membership4Ps: formState.membership4Ps.get(),
    };

    const householdId = await insertHousehold(data); // ✅ Save locally first

    if (householdId) {
      Alert.alert("Success", "Household data saved successfully!");
      console.log("🚀 Syncing to Supabase...");
      await syncWithSupabase(); // ✅ Ensure sync before navigating
      router.push({ pathname: "/mealPattern", params: { householdId } }); // ✅ Navigate with ID
    } else {
      Alert.alert("Error", "Failed to save household data.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Household Information</Text>
      <TextInput 
        label="Sitio/Purok" 
        mode="outlined" 
        value={formState.sitio.get()} 
        onChangeText={formState.sitio.set} 
        style={styles.input} 
      />

      {/* ✅ Household Number with Validation */}
      <TextInput 
        label="Household No." 
        mode="outlined" 
        value={formState.householdNumber.get()} 
        onChangeText={handleHouseholdNumberChange} 
        keyboardType="numeric" // ✅ Ensures numeric input
        style={styles.input} 
      />
      {formState.householdNumberError.get() ? <Text style={styles.errorText}>{formState.householdNumberError.get()}</Text> : null}

      {/* ✅ Clickable Date Picker Field */}
      <Text style={styles.subHeader}>Date of Visit:</Text>
      <TouchableOpacity onPress={() => formState.showDatePicker.set(true)}>
        <TextInput
          mode="outlined"
          value={formState.dateOfVisit.get().toDateString()} // ✅ Display formatted date
          editable={false} // ❌ Prevent manual input
          style={styles.input}
          left={<TextInput.Icon icon="calendar" onPress={() => formState.showDatePicker.set(true)} />}
        />
      </TouchableOpacity>

      {formState.showDatePicker.get() && (
        <DateTimePicker
          value={formState.dateOfVisit.get()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            formState.showDatePicker.set(false);
            if (selectedDate) {
              formState.dateOfVisit.set(selectedDate);
            }
          }}
        />
      )}

      {/* Toilet */}
      <Text style={styles.subHeader}>Toilet:</Text>
      <RadioButton.Group onValueChange={formState.toilet.set} value={formState.toilet.get()}>
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Presence" value="Presence" />
          <RadioButton.Item label="Absence" value="Absence" />
        </View>
      </RadioButton.Group>

      {/* Source of Water */}
      <Text style={styles.subHeader}>Source of Water</Text>
      <RNPickerSelect
        onValueChange={formState.sourceOfWater.set}
        items={[{ label: "Spring", value: "Spring" }, { label: "DCWD", value: "DCWD" }, { label: "Tabay", value: "Tabay" }]}
        style={pickerSelectStyles}
      />

      {/* Source of Income */}
      <Text style={styles.subHeader}>Source of Income</Text>
      <RNPickerSelect
        onValueChange={formState.sourceOfIncome.set}
        items={[{ label: "Farming", value: "Farming" }, { label: "Fishing", value: "Fishing" }, { label: "Business", value: "Business" }, { label: "Other", value: "Other" }]}
        style={pickerSelectStyles}
      />

      {/* Food Production */}
      <Text style={styles.subHeader}>Food Production:</Text>
      <RadioButton.Group onValueChange={formState.foodProduction.set} value={formState.foodProduction.get()}>
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Yes" value="Yes" />
          <RadioButton.Item label="No" value="No" />
        </View>
      </RadioButton.Group>

      {/* Membership to 4Ps */}
      <Text style={styles.subHeader}>Membership to 4Ps:</Text>
      <RadioButton.Group onValueChange={formState.membership4Ps.set} value={formState.membership4Ps.get()}>
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

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#ffff" },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  subHeader: { fontSize: 16, fontWeight: "bold", marginTop: 16 },
  input: { marginBottom: 16 },
  errorText: { color: "red", fontSize: 14, marginBottom: 10 },
  radioContainer: { flexDirection: "row", alignItems: "center", gap: 5 },
  button: { marginTop: 20 },
});

export default NewHouseholdForm;
