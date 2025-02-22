import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Checkbox,
} from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import { useRouter, useLocalSearchParams } from "expo-router";
import { format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";
import supabase from "../supabaseClient";

const EditFamilyMemberScreen = () => {
  const router = useRouter();
  const { memberId } = useLocalSearchParams();

  const [member, setMember] = useState({
    firstname: "",
    lastname: "",
    relationship: "",
    sex: "",
    dateofbirth: null,
    age: "",
    classification: "",
    healthrisk: [],
    weight: "",
    height: "",
    educationLevel: "",
    householdid: null,
  });

  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHealthRiskDropdown, setShowHealthRiskDropdown] = useState(false);

  const riskOptions = [
    "Adolescent Pregnant",
    "Post Partum (6-8 weeks after birth)",
    "Reproductive Age (15-49 years old)",
    "Persons with Disability",
    "None of the above",
  ];

  const educationOptions = [
    "Elementary Level",
    "Elementary Graduate",
    "High School Level",
    "High School Graduate",
    "Junior High School Level",
    "Junior High School Graduate",
    "Senior High School Level",
    "Senior High School Graduate",
    "College Level",
    "College Graduate",
  ];

  useEffect(() => {
    const fetchMemberDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("addmember")
          .select("*")
          .eq("id", memberId)
          .single();

        if (error) throw error;

        setMember({
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          relationship: data.relationship || "",
          sex: data.sex || "",
          dateofbirth: data.dateofbirth ? new Date(data.dateofbirth) : null,
          age: data.age ? data.age.toString() : "",
          classification: data.classification || "",
          healthrisk: data.healthrisk ? data.healthrisk.split(", ") : [],
          weight: data.weight ? data.weight.toString() : "",
          height: data.height ? data.height.toString() : "",
          educationLevel: data.educationLevel || "",
          householdid: data.householdid || null,
        });
      } catch (error) {
        Alert.alert("Error", "Failed to load member data.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      fetchMemberDetails();
    }
  }, [memberId]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const now = new Date();
      let calculatedAge = now.getFullYear() - selectedDate.getFullYear();
      const m = now.getMonth() - selectedDate.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < selectedDate.getDate())) {
        calculatedAge--;
      }

      let autoClassification = "";
      const diffDays = (now - selectedDate) / (1000 * 3600 * 24);
      if (diffDays <= 60) {
        autoClassification = "Newborn (0-60 days)";
      } else if (diffDays <= 335) {
        autoClassification = "Infant (61 days-11months)";
      } else if (calculatedAge < 5) {
        autoClassification = "Under 5 (1-4 years old)";
      } else if (calculatedAge < 10) {
        autoClassification = "School Aged Children (5-9 years old)";
      } else if (calculatedAge < 60) {
        autoClassification = "Adult (18-59 years old)";
      } else {
        autoClassification = "Senior Citizen (60+ years old)";
      }

      setMember({
        ...member,
        dateofbirth: selectedDate,
        age: calculatedAge.toString(),
        classification: autoClassification,
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Edit Family Member</Text>

      <TextInput label="First Name" mode="outlined" value={member.firstname} onChangeText={(text) => setMember({ ...member, firstname: text })} style={styles.input} />
      <TextInput label="Last Name" mode="outlined" value={member.lastname} onChangeText={(text) => setMember({ ...member, lastname: text })} style={styles.input} />
      <TextInput label="Relationship" mode="outlined" value={member.relationship} onChangeText={(text) => setMember({ ...member, relationship: text })} style={styles.input} />

      <Text style={styles.subHeader}>Date of Birth</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          mode="outlined"
          value={member.dateofbirth ? format(member.dateofbirth, "yyyy-MM-dd") : ""}
          editable={false}
          style={styles.input}
        />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={member.dateofbirth || new Date()} mode="date" display="default" onChange={handleDateChange} />
      )}

      <Text style={styles.subHeader}>Age</Text>
      <TextInput mode="outlined" value={member.age} editable={false} style={styles.input} />

      <Text style={styles.subHeader}>Classification</Text>
      <TextInput mode="outlined" value={member.classification} editable={false} style={styles.input} />

      <Text style={styles.subHeader}>Health Risk Group</Text>
      {riskOptions.map((risk) => (
        <Checkbox.Item key={risk} label={risk} status={member.healthrisk.includes(risk) ? "checked" : "unchecked"} onPress={() => toggleRisk(risk)} />
      ))}

      <Text style={styles.subHeader}>Weight & Height</Text>
      <TextInput label="Weight (kg)" mode="outlined" value={member.weight} onChangeText={(text) => setMember({ ...member, weight: text })} keyboardType="numeric" style={styles.input} />
      <TextInput label="Height (cm)" mode="outlined" value={member.height} onChangeText={(text) => setMember({ ...member, height: text })} keyboardType="numeric" style={styles.input} />

      <Text style={styles.subHeader}>Educational Level</Text>
      <RNPickerSelect
        onValueChange={(value) => setMember({ ...member, educationLevel: value })}
        items={educationOptions.map((level) => ({ label: level, value: level }))}
        value={member.educationLevel}
      />

      <Button mode="contained" style={styles.button} onPress={() => updateMemberData()}>
        Update Member
      </Button>
    </ScrollView>
  );
};

// ✅ **Added Styles**
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  button: {
    marginTop: 20,
  },
});

export default EditFamilyMemberScreen;
