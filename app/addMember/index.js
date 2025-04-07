import supabase from "../supabaseClient";  // ✅ Import Supabase client
import React, { useState, useEffect } from "react"; // ✅ Import useEffect
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Alert
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  RadioButton,
  Card,
  Divider,
  Checkbox
} from "react-native-paper";
// Replace RNPickerSelect with Picker
import { Picker } from "@react-native-picker/picker";

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
  const [otherRelationship, setOtherRelationship] = useState("");
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [dateofbirth, setdateofbirth] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [classification, setClassification] = useState("");
  const [healthrisk, setHealthRisk] = useState(""); // replaced by selectedHealthRisks later
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [educationLevel, setEducationLevel] = useState("");

  // For multi-select health risk checkboxes
  const [showHealthRiskDropdown, setShowHealthRiskDropdown] = useState(false);
  const riskOptions = [
    "Adolescent Pregnant",
    "Post Partum (upon birth 6-8 weeks)",
    "Reproductive Age (not pregnant) 15-49 years old",
    "Persons with Disability",
    "None of the above"
  ];
  const [selectedHealthRisks, setSelectedHealthRisks] = useState([]);

  const toggleRisk = (risk) => {
    if (selectedHealthRisks.includes(risk)) {
      setSelectedHealthRisks(selectedHealthRisks.filter(r => r !== risk));
    } else {
      setSelectedHealthRisks([...selectedHealthRisks, risk]);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setdateofbirth(selectedDate);

      // Calculate age
      const now = new Date();
      let calculatedAge = now.getFullYear() - selectedDate.getFullYear();
      const m = now.getMonth() - selectedDate.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < selectedDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge.toString());

      // Auto-set classification
      const diffDays = (now - selectedDate) / (1000 * 3600 * 24);
      let autoClassification = "";
      if (diffDays <= 60) {
        autoClassification = "Newborn (0-60 days)";
      } else if (diffDays <= 335) {
        autoClassification = "Infant (61 days-11months)";
      } else if (calculatedAge < 5) {
        autoClassification = "Under 5 (1-4 years old)";
      } else if (calculatedAge < 10) {
        autoClassification = "School Aged Children (5-9 years old)";
      } else if (calculatedAge < 17) {
        autoClassification = "Young adult (10-17 years old)";
      } else if (calculatedAge < 60) {
        autoClassification = "Adult 18-59 years old";
      } else {
        autoClassification = "Senior citizen (60 years old above)";
      }
      setClassification(autoClassification);
    }
  };

  useEffect(() => {
    console.log("✅ Household ID received:", householdId);
    console.log("🔍 Parsed Household ID:", parsedHouseholdId);
  }, [householdId, parsedHouseholdId]);

  const saveMemberData = async () => {
    console.log("📌 Debug: educationLevel before insert:", educationLevel);
  
    try {
      if (!parsedHouseholdId || isNaN(parsedHouseholdId)) {
        Alert.alert("Error", "Household ID is missing or invalid.");
        return;
      }
  
      if (
        !firstName.trim() ||
        !lastName.trim() ||
        !relationship ||
        !sex ||
        !dateofbirth ||
        !educationLevel
      ) {
        Alert.alert("Incomplete Data", "Please fill in all required fields.");
        return;
      }
  
      const finalRelationship =
        relationship === "Other" ? otherRelationship : relationship;
      const finalHealthRisk = selectedHealthRisks.join(", ");
      const formattedDOB = dateofbirth ? format(dateofbirth, "yyyy-MM-dd") : "";
  
      const newMember = {
        firstname: firstName,
        lastname: lastName,
        relationship: finalRelationship,
        sex,
        age: age ? age.toString() : null,
        dateofbirth: formattedDOB,
        classification,
        healthrisk: finalHealthRisk || "",
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        educationallevel: educationLevel || "",
        householdid: parsedHouseholdId
      };
  
      console.log("🛠️ DEBUG: Member Data Before Insert:", newMember);
  
      // Insert the member locally; this function also attempts to sync if online.
      const localMemberId = await insertMember(newMember);
  
      if (!localMemberId) {
        Alert.alert("Error", "Failed to save member data locally.");
        return;
      }
  
      Alert.alert("Success", "Member data saved successfully!");
      router.push({
        pathname: "/memberHealthInfo",
        params: { memberId: localMemberId, householdId: parsedHouseholdId },
      });
  
    } catch (error) {
      console.error("❌ Error saving member data:", error);
      Alert.alert("Error", "An error occurred while saving the data.");
    }
  };
  

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Family Members</Text>
      </View>

      <TextInput
        label="Last Name"
        mode="outlined"
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
      />
      <TextInput
        label="First Name"
        mode="outlined"
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
      />

      <Text style={styles.subHeader}>Relationship of Member to Household</Text>
      {/* Replace RNPickerSelect with a simple Picker */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={relationship}
          onValueChange={(value) => setRelationship(value)}
        >
          <Picker.Item label="Select Relationship" value="" />
          <Picker.Item label="Head" value="Head" />
          <Picker.Item label="Spouse" value="Spouse" />
          <Picker.Item label="Son" value="Son" />
          <Picker.Item label="Daughter" value="Daughter" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>
      {relationship === "Other" && (
        <TextInput
          label="Please specify relationship"
          mode="outlined"
          value={otherRelationship}
          onChangeText={setOtherRelationship}
          style={styles.input}
        />
      )}

      <Text style={styles.subHeader}>Sex:</Text>
      <RadioButton.Group onValueChange={setSex} value={sex}>
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Male" value="Male" />
          <RadioButton.Item label="Female" value="Female" />
        </View>
      </RadioButton.Group>

      <Text style={styles.subHeader}>Date of Birth</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          label="Select Date"
          mode="outlined"
          value={dateofbirth ? format(dateofbirth, "yyyy-MM-dd") : ""}
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

      <Text style={styles.subHeader}>Age:</Text>
      <TextInput
        label="Age"
        mode="outlined"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        style={styles.inputSmall}
      />

      <Text style={styles.subHeader}>Classification by Age</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={classification}
          onValueChange={(value) => setClassification(value)}
        >
          <Picker.Item label="Select Classification" value="" />
          <Picker.Item label="Newborn (0-60 days)" value="Newborn (0-60 days)" />
          <Picker.Item label="Infant (61 days-11months)" value="Infant (61 days-11months)" />
          <Picker.Item label="Under 5 (1-4 years old)" value="Under 5 (1-4 years old)" />
          <Picker.Item
            label="School Aged Children (5-9 years old)"
            value="School Aged Children (5-9 years old)"
          />
          <Picker.Item label="Young adult (10-17 years old)" value="Young adult (10-17 years old)" />
          <Picker.Item label="Adult 18-59 years old" value="Adult 18-59 years old" />
          <Picker.Item
            label="Senior citizen (60 years old above)"
            value="Senior citizen (60 years old above)"
          />
        </Picker>
      </View>

      <Text style={styles.subHeader}>Health Risk Group</Text>
      <TouchableOpacity
        style={styles.healthRiskDropdown}
        onPress={() => setShowHealthRiskDropdown(!showHealthRiskDropdown)}
      >
        <Text style={styles.healthRiskText}>
          {selectedHealthRisks.length > 0
            ? selectedHealthRisks.join(", ")
            : "Select Health Risk Group"}
        </Text>
      </TouchableOpacity>
      {showHealthRiskDropdown && (
        <View style={styles.healthRiskContainer}>
          {riskOptions.map((risk) => (
            <View key={risk} style={styles.checkboxContainer}>
              <Checkbox
                status={selectedHealthRisks.includes(risk) ? "checked" : "unchecked"}
                onPress={() => toggleRisk(risk)}
              />
              <Text style={styles.checkboxLabel}>{risk}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.row}>
        <TextInput
          label="Weight (kg)"
          mode="outlined"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          style={styles.inputSmall}
        />
        <TextInput
          label="Height (cm)"
          mode="outlined"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          style={styles.inputSmall}
        />
      </View>

      <Text style={styles.subHeader}>Educational Level</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={educationLevel}
          onValueChange={(value) => setEducationLevel(value)}
        >
          <Picker.Item label="Select Educational Level" value="" />
          <Picker.Item label="Elementary Level" value="Elementary Level" />
          <Picker.Item label="Elementary Graduate" value="Elementary Graduate" />
          <Picker.Item label="High School Level" value="High School Level" />
          <Picker.Item label="High School Graduate" value="High School Graduate" />
          <Picker.Item label="Junior High School Level" value="Junior High School Level" />
          <Picker.Item label="Junior High School Graduate" value="Junior High School Graduate" />
          <Picker.Item label="Senior High School Level" value="Senior High School Level" />
          <Picker.Item label="Senior High School Graduate" value="Senior High School Graduate" />
          <Picker.Item label="College Level" value="College Level" />
          <Picker.Item label="College Graduate" value="College Graduate" />
          <Picker.Item label="Post Graduate" value="Post Graduate" />
        </Picker>
      </View>

      <Button mode="contained" style={styles.button} onPress={saveMemberData}>
        Save Member
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backButton: { marginRight: 10, padding: 4 },
  headerText: { fontSize: 24, fontWeight: "bold", color: "#000" },

  input: { marginBottom: 16 },
  inputSmall: { width: "48%", marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  radioContainer: { flexDirection: "row", alignItems: "center" },
  button: { marginTop: 20 },

  subHeader: { fontSize: 16, fontWeight: "bold", marginTop: 10 },

  // Simple container style for Picker
  pickerContainer: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },

  healthRiskDropdown: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    backgroundColor: "#f9f9f9",
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  healthRiskText: {
    fontSize: 14,
    color: "black",
  },
  healthRiskContainer: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    padding: 8,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: "black",
  },
});

export default AddMemberScreen;
