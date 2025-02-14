import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  RadioButton,
  Card,
} from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";

const AddMemberScreen = () => {
  const router = useRouter();

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [classification, setClassification] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [educationLevel, setEducationLevel] = useState("");

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Family Members</Text>

      <Card style={styles.card}>
        <Card.Content>
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

          <Text style={styles.subHeader}>Relationship to Household</Text>
          <RNPickerSelect
            onValueChange={setRelationship}
            items={[
              { label: "Head", value: "Head" },
              { label: "Spouse", value: "Spouse" },
              { label: "Son", value: "Son" },
              { label: "Daughter", value: "Daughter" },
              { label: "Other", value: "Other" },
            ]}
            style={pickerSelectStyles}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subHeader}>Sex</Text>
          <RadioButton.Group onValueChange={setSex} value={sex}>
            <View style={styles.radioContainer}>
              <RadioButton.Item label="Male" value="Male" />
              <RadioButton.Item label="Female" value="Female" />
            </View>
          </RadioButton.Group>

          <TextInput
            label="Age"
            mode="outlined"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.subHeader}>Date of Birth</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              mode="outlined"
              value={dateOfBirth.toDateString()}
              editable={false}
              style={styles.input}
              right={<TextInput.Icon icon="calendar" />}
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDateOfBirth(selectedDate);
              }}
            />
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
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
            style={pickerSelectStyles}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subHeader}>Physical Measurements</Text>
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
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
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
            style={pickerSelectStyles}
          />
        </Card.Content>
      </Card>

      <Button mode="contained" style={styles.button} onPress={() => router.push("/memberHealthInfo")}>
        Next
      </Button>
    </ScrollView>
  );
};

// ✅ Fixed `pickerSelectStyles`
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
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#f5f5f5" 
  },
  header: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 16, 
    textAlign: "center" 
  },
  subHeader: { 
    fontSize: 16, 
    fontWeight: "bold", 
    marginTop: 16, 
    marginBottom: 8, 
    color: "#333" 
  },
  input: { 
    marginBottom: 16, 
    backgroundColor: "#fff" 
  },
  inputSmall: { 
    width: "48%", 
    marginBottom: 16, 
    backgroundColor: "#fff" 
  },
  row: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  card: { 
    marginBottom: 16, 
    padding: 16, 
    borderRadius: 8, 
    backgroundColor: "#fff", 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, 
  },
  radioContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between",
    marginBottom: 16,
  },
  button: { 
    marginTop: 20, 
    paddingVertical: 10, 
    borderRadius: 8, 
    backgroundColor: "#6200EE" 
  },
});

export default AddMemberScreen;
