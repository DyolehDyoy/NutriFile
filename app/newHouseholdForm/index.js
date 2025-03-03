import { Menu, IconButton } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import the icon
import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  RadioButton,
  Switch,
  Card,
  Divider,
  SegmentedButtons,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { observable } from "@legendapp/state";
import { observer } from "@legendapp/state/react";
import { insertHousehold, syncWithSupabase, createTables } from "../database";

const formState = observable({
  sitio: "",
  householdNumber: "",
  householdNumberError: "",
  dateOfVisit: new Date(),
  showDatePicker: false,
  toilet: "Presence",
  toiletType: "",
  showToiletTypeInput: false,
  sourceOfWater: "Spring",
  customWaterSource: "", // ✅ Custom water source input
  showCustomWaterSourceInput: false, // ✅ Controls input visibility
  sourceOfIncomeMenuVisible: false,
  sourceOfIncome: "Full Time",
  customIncomeSource: "",
  showCustomIncomeInput: false,
  foodProductionVegetable: false, // ✅ Separate for Vegetable Garden
  foodProductionAnimals: false, // ✅ Separate for Raised Animals
  membership4Ps: false,
  loading: false,
});



const incomeOptions = ["Full Time", "Part Time", "Self Employed", "Other"];


const NewHouseholdForm = () => {
  const router = useRouter();

  useEffect(() => {
    createTables();
    resetFormState(); // ✅ Clears previous input when screen is loaded

  }, []);

  // ✅ Move resetFormState inside the component
  const resetFormState = () => {
    formState.sitio.set("");
    formState.householdNumber.set("");
    formState.householdNumberError.set("");
    formState.dateOfVisit.set(new Date());
    formState.showDatePicker.set(false);
    formState.toilet.set("Presence");
    formState.sourceOfWater.set("Spring");
    formState.sourceOfIncome.set("Full Time");
    formState.customIncomeSource.set("");
    formState.showCustomIncomeInput.set(false);
    formState.foodProduction.set(false);
    formState.membership4Ps.set(false);
    formState.loading.set(false);
  };

  

  const handleHouseholdNumberChange = (text) => {
    
    formState.householdNumber.set(text);
  };

  const validateForm = () => {
    const {
      sitio,
      householdNumber,
      dateOfVisit,
      toilet,
      sourceOfWater,
      sourceOfIncome,
      foodProductionVegetable,
      foodProductionAnimals,
      membership4Ps,
    } = formState.get();
  
    // ✅ Check required fields
    if (!sitio || !householdNumber || !dateOfVisit || !toilet || !sourceOfWater || !sourceOfIncome) {
      Alert.alert(
        "Missing Fields",
        "Please complete all required fields before proceeding."
      );
      return false;
    }
  
    // ✅ If "Other" is selected for Water Source but no input provided
    if (sourceOfWater === "Other" && !formState.customWaterSource.get().trim()) {
      Alert.alert(
        "Missing Input",
        "Please specify the 'Other' water source."
      );
      return false;
    }
  
    // ✅ If "Other" is selected for Income Source but no input provided
    if (sourceOfIncome === "Other" && !formState.customIncomeSource.get().trim()) {
      Alert.alert(
        "Missing Input",
        "Please specify the 'Other' source of income."
      );
      return false;
    }
  
    // ✅ If "Present" is selected for Toilet but no input provided
    if (toilet === "Presence" && !formState.toiletType.get().trim()) {
      Alert.alert(
        "Missing Input",
        "Please specify the type of toilet."
      );
      return false;
    }
  
    return true;
  };
  
  const handleSave = async () => {
    if (!validateForm()) return; // ✅ Stop execution if validation fails
  
    formState.loading.set(true);
  
    const data = {
      sitio: formState.sitio.get(),
      householdnumber: formState.householdNumber.get(),
      dateofvisit: formState.dateOfVisit.get().toISOString().split("T")[0],
      toilet: formState.toilet.get() === "Presence"
        ? formState.toiletType.get() // ✅ Store toilet type if present
        : formState.toilet.get(),
      sourceofwater: formState.sourceOfWater.get() === "Other"
        ? formState.customWaterSource.get()
        : formState.sourceOfWater.get(),
      sourceofincome: formState.sourceOfIncome.get() === "Other"
        ? formState.customIncomeSource.get()
        : formState.sourceOfIncome.get(),
      foodproductionvegetable: formState.foodProductionVegetable.get() ? "Yes" : "No",
      foodproductionanimals: formState.foodProductionAnimals.get() ? "Yes" : "No",
      membership4ps: formState.membership4Ps.get() ? "Yes" : "No",
    };
  
    const householdId = await insertHousehold(data);
    if (!householdId) {
      formState.loading.set(false);
      Alert.alert("Error", "Failed to save household data.");
      return;
    }
  
    await syncWithSupabase();
    Alert.alert("Success", "Household data saved successfully!");
  
    formState.loading.set(false);
    router.push({ pathname: "/mealPattern", params: { householdId } });
  };
  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Household Information</Text>

      {/* Basic Information Card */}
      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Sitio/Purok"
            mode="outlined"
            value={formState.sitio.get()}
            onChangeText={formState.sitio.set}
            style={styles.input}
          />

          <TextInput
            label="Household No."
            mode="outlined"
            value={formState.householdNumber.get()}
            onChangeText={handleHouseholdNumberChange}
            keyboardType="numeric"
            style={styles.input}
          />
          {formState.householdNumberError.get() && (
            <Text style={styles.errorText}>{formState.householdNumberError.get()}</Text>
          )}

          <Text style={styles.subHeader}>Date of Visit:</Text>
          <TouchableOpacity onPress={() => formState.showDatePicker.set(true)}>
            <TextInput
              mode="outlined"
              value={formState.dateOfVisit.get().toDateString()}
              editable={false}
              style={styles.input}
              left={<TextInput.Icon icon="calendar" />}
            />
            </TouchableOpacity>

          {formState.showDatePicker.get() && (
            <DateTimePicker
              value={formState.dateOfVisit.get()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                formState.showDatePicker.set(false);
                if (selectedDate) formState.dateOfVisit.set(selectedDate);
              }}
            />
          )}
        </Card.Content>
      </Card>

      {/* Toilet & Water Source */}
      <Card style={styles.card}>
  <Card.Content>
    <Text style={styles.subHeader}>Sanitary Facilities:</Text>
    <SegmentedButtons
      value={formState.toilet.get()}
      onValueChange={(value) => {
        formState.toilet.set(value);
        formState.showToiletTypeInput.set(value === "Presence"); // ✅ Show/hide input field
      }}
      buttons={[
        { value: "Presence", label: "Present" },
        { value: "Absence", label: "Absent" },
      ]}
    />

    {/* ✅ Input field appears only if "Present" is selected */}
    {formState.showToiletTypeInput.get() && (
      <TextInput
        label="Specify Toilet Type"
        mode="outlined"
        value={formState.toiletType.get()}
        onChangeText={formState.toiletType.set}
        style={styles.input}
      />
    )}
<Text style={styles.subHeader}>Source of Water:</Text>
<SegmentedButtons
  value={formState.sourceOfWater.get()}
  onValueChange={(value) => {
    formState.sourceOfWater.set(value);
    formState.showCustomWaterSourceInput.set(value === "Other"); // ✅ Show input only if "Other" is selected
  }}
  buttons={[
    { value: "Spring", label: "Spring" },
    { value: "DCWD", label: "DCWD" },
    { value: "Tabay", label: "Tabay" },
    { value: "Other", label: "Other" }, // ✅ Added "Other" option
  ]}
/>

{/* ✅ Input field appears only if "Other" is selected */}
{formState.showCustomWaterSourceInput.get() && (
  <TextInput
    label="Specify Other Water Source"
    mode="outlined"
    value={formState.customWaterSource.get()}
    onChangeText={formState.customWaterSource.set}
    style={styles.input}
  />
)}
  </Card.Content>
</Card>


      {/* Source of Income & Membership */}
      <Card style={styles.card}>
        <Card.Content>
         
          <View>
  <Text style={styles.subHeader}>Source of Income:</Text>
  <Menu
    visible={formState.sourceOfIncomeMenuVisible.get()}
    onDismiss={() => formState.sourceOfIncomeMenuVisible.set(false)}
    anchor={
      <TouchableOpacity
      style={styles.dropdownButton}
      onPress={() => formState.sourceOfIncomeMenuVisible.set(true)}
    >
      <Text style={styles.dropdownText}>{formState.sourceOfIncome.get()}</Text>
      <Icon name="keyboard-arrow-down" size={20} style={styles.dropdownIcon} />
    </TouchableOpacity>
    
              
    }
  >
    {incomeOptions.map((option) => (
     <Menu.Item
     key={option}
     onPress={() => {
       formState.sourceOfIncome.set(option);
       formState.sourceOfIncomeMenuVisible.set(false);
   
       if (option === "Other") {
         formState.showCustomIncomeInput.set(true);  // Show the text input
       } else {
         formState.showCustomIncomeInput.set(false); // Hide the input if another option is selected
         formState.customIncomeSource.set("");       // Clear previous input
       }
     }}
     title={option}
   />
   
    ))}
  </Menu>
</View>
{formState.showCustomIncomeInput.get() && (
  <TextInput
    label="Specify Other Income Source"
    mode="outlined"
    value={formState.customIncomeSource.get()}
    onChangeText={formState.customIncomeSource.set}
    style={styles.input}
  />
)}


          <Divider style={{ marginVertical: 10 }} />

          <View style={styles.toggleRow}>
  <Text style={styles.subHeader}>Vegetable Garden:</Text>
  <Switch
    value={formState.foodProductionVegetable.get()}
    onValueChange={formState.foodProductionVegetable.set}
  />
</View>

<View style={styles.toggleRow}>
  <Text style={styles.subHeader}>Raised Animals for Food:</Text>
  <Switch
    value={formState.foodProductionAnimals.get()}
    onValueChange={formState.foodProductionAnimals.set}
  />
</View>


          <View style={styles.toggleRow}>
            <Text style={styles.subHeader}>4Ps Membership:</Text>
            <Switch
              value={formState.membership4Ps.get()}
              onValueChange={formState.membership4Ps.set}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Save Button */}
      <Button mode="contained" style={styles.button} onPress={handleSave} disabled={formState.loading.get()}>
      {formState.loading.get() ? <ActivityIndicator color="white" /> : "Save & Next"}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  subHeader: { fontSize: 16, fontWeight: "bold", marginTop: 10 },
  input: { marginBottom: 12 },
  card: { marginBottom: 16, padding: 10, backgroundColor: "white", borderRadius: 10, elevation: 2 },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 5 },
  button: { marginTop: 20, padding: 10 },
  errorText: { color: "red", fontSize: 14 },

  // Updated dropdown styles to make it visible
  
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#007AFF", // Blue border
    borderRadius: 5,
    backgroundColor: "#fff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#007AFF", // Blue border
    borderRadius: 5,
    backgroundColor: "#fff",
    width: "100%", // Ensure full width
  },
  dropdownText: {
    fontSize: 16,
    color: "#000000", // Darker color for visibility
    flex: 1, // Ensures text is properly aligned
  },
  dropdownIcon: {
    width: 20,
    height: 20,
    tintColor: "#007AFF", // Dropdown icon color
  },
});



export default observer(NewHouseholdForm);
