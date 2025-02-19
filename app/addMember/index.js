import React, { useState, useEffect } from "react"; // ✅ Import useEffect
import { View, ScrollView, StyleSheet, Platform, TouchableOpacity, Alert } from "react-native";
import { Text, TextInput, Button, RadioButton } from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { insertMember, syncWithSupabase } from "../database";  // Import insertMember
import { useLocalSearchParams } from "expo-router";

const AddMemberScreen = () => {
  const router = useRouter();

  const { householdId } = useLocalSearchParams();
  const parsedHouseholdId = householdId ? parseInt(householdId, 10) : null;
  
  
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [dateofbirth, setdateofbirth] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [classification, setClassification] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [educationLevel, setEducationLevel] = useState("");

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setdateofbirth(selectedDate);
    }
  };
  useEffect(() => {
    console.log("✅ Household ID received:", householdId);
    console.log("🔍 Parsed Household ID:", parsedHouseholdId);
}, [householdId, parsedHouseholdId]);

  
  const saveMemberData = async () => {
    try {
        // ✅ Check if householdId is provided
        if (!parsedHouseholdId || isNaN(parsedHouseholdId)) {
          Alert.alert("Error", "Household ID is missing or invalid.");
          return;
      }
      

        const formattedDOB = dateofbirth ? format(dateofbirth, "yyyy-MM-dd") : "";

        console.log("🛠️ DEBUG: Member Data Before Insert:", {
            firstName,
            lastName,
            relationship,
            sex,
            age,
            dateofbirth: formattedDOB,
            classification,
            weight,
            height,
            educationLevel,
            householdid: householdId, // ✅ Use dynamic householdId
        });

        const newMember = {
            firstName,
            lastName,
            relationship,
            sex,
            age,
            dateofbirth: formattedDOB,
            classification,
            weight,
            height,
            educationLevel,
            householdid: parsedHouseholdId,
          };

        const memberId = await insertMember(newMember);
        if (memberId) {
            console.log(`✅ New member saved with ID: ${memberId}`);
            await syncWithSupabase();
            Alert.alert("Success", "Member data saved successfully.");
            console.log("New member ID is:", memberId);
            router.push({ pathname: "/memberHealthInfo", params: { memberId: memberId } });
          } else {
            Alert.alert("Error", "Failed to save member data.");
        }
    } catch (error) {
        console.error("❌ Error saving member data:", error);
        Alert.alert("Error", "An error occurred while saving the data.");
    }
  };
  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Family Members</Text>

      <TextInput label="Last Name" mode="outlined" value={lastName} onChangeText={setLastName} style={styles.input} />
      <TextInput label="First Name" mode="outlined" value={firstName} onChangeText={setFirstName} style={styles.input} />

      <Text style={styles.subHeader}>Relationship of Member to Household</Text>
      <RNPickerSelect
        onValueChange={setRelationship}
        items={[
          { label: "Head", value: "Head" },
          { label: "Spouse", value: "Spouse" },
          { label: "Son", value: "Son" },
          { label: "Daughter", value: "Daughter" },
          { label: "Other", value: "Other" },
        ]}
        style={styles.pickerSelectStyles}
      />

      <Text style={styles.subHeader}>Sex:</Text>
      <RadioButton.Group onValueChange={setSex} value={sex}>
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Male" value="Male" />
          <RadioButton.Item label="Female" value="Female" />
        </View>
      </RadioButton.Group>

      <Text style={styles.subHeader}>Age:</Text>
      <TextInput label="Age" mode="outlined" value={age} onChangeText={setAge} keyboardType="numeric" style={styles.inputSmall} />
      

      <Text style={styles.subHeader}>Date of Birth</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          label="Select Date"
          mode="outlined"
          value={ dateofbirth? format(dateofbirth, "yyyy-MM-dd") : ""}
          editable={false}
          style={styles.input}
          right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
        />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dateofbirth || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.subHeader}>Classification by Age/Health Risk Group</Text>
      <RNPickerSelect
        onValueChange={setClassification}
        items={[
          { label: "Newborn (0-60 days)", value: "Newborn (0-60 days)" },
          { label: "Infant (61 days-11months)", value: "Infant (61 days-11months)" },
          { label: "Under 5 (1-4 years old)", value: "Under 5 (1-4 years old)" },
          { label: "School Aged Children (5-9 years old)", value: "School Aged Children (5-9 years old)" },
          { label: "Adolescent Pregnant", value: "Adolescent Pregnant" },
          { label: "Post Partum (upon birth 6-8 weeks)", value: "Post Partum (upon birth 6-8 weeks)" },
          { label: "Reproductive Age (not pregnant) 15-49 years old", value: "Reproductive Age (not pregnant) 15-49 years old" },
          { label: "Senior citizen (60 years old above)", value: "Senior citizen (60 years old above)" },
          { label: "Adult 18-59 years old", value: "Adult 18-59 years old" },
          { label: "Persons with Disability", value: "Persons with Disability" },
        ]}
        style={styles.pickerSelectStyles}
      />

      <View style={styles.row}>
        <TextInput label="Weight (kg)" mode="outlined" value={weight} onChangeText={setWeight} keyboardType="numeric" style={styles.inputSmall} />
        <TextInput label="Height (cm)" mode="outlined" value={height} onChangeText={setHeight} keyboardType="numeric" style={styles.inputSmall} />
      </View>

      <Text style={styles.subHeader}>Educational Level</Text>
      <RNPickerSelect
        onValueChange={setEducationLevel}
        items={[
          { label: "Elementary Level", value: "Elementary Level" },
          { label: "Elementary Graduate", value: "Elementary Graduate" },
          { label: "High School Level", value: "High School Level" },
          { label: "High School Graduate", value: "High School Graduate" },
          { label: "Junior High School Level", value: "Junior High School Level" },
          { label: "Junior High School Graduate", value: "Junior High School Graduate" },
          { label: "Senior High School Level", value: "Senior High School Level" },
          { label: "Senior High School Graduate", value: "Senior High School Graduate" },
          { label: "College Level", value: "College Level" },
          { label: "College Graduate", value: "College Graduate" },
        ]}
        style={styles.pickerSelectStyles}
      />

      <Button mode="contained" style={styles.button} onPress={saveMemberData}>
        Save Member
      </Button>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  subHeader: { fontSize: 16, fontWeight: "bold", marginTop: 16 },
  input: { marginBottom: 16 },
  inputSmall: { width: "48%", marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  radioContainer: { flexDirection: "row", alignItems: "center" },
  button: { marginTop: 20 },

  pickerSelectStyles: {
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: "gray",
      borderRadius: 4,
      color: "black",
      backgroundColor: "#f9f9f9",
      paddingRight: 30,
    },
    inputAndroid: {
      fontSize: 16,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: "gray",
      borderRadius: 4,
      color: "black",
      backgroundColor: "#f9f9f9",
      paddingRight: 30,
    },
  },
});

export default AddMemberScreen;
