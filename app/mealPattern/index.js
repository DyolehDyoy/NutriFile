import React, { useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { insertMealPattern } from "../database"; // Import database functions
import { MaterialCommunityIcons } from "@expo/vector-icons"; // ✅ Added for icons

const MealPatternScreen = () => {
  const router = useRouter();
  const { householdId } = useLocalSearchParams(); // Retrieve householdId

  // ✅ Include missing state variables
  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [dinner, setDinner] = useState("");
  const [foodBelief, setFoodBelief] = useState("");
  const [healthConsideration, setHealthConsideration] = useState("");
  const [whatIfSick, setWhatIfSick] = useState("");
  const [checkupFrequency, setCheckupFrequency] = useState("");

  const handleSave = () => {
    if (!householdId) {
      alert("Error: Household ID is missing.");
      return;
    }

    const mealData = { breakfast, lunch, dinner, foodBelief, healthConsideration, whatIfSick, checkupFrequency };

    insertMealPattern(householdId, mealData, (success) => {
      if (success) {
        alert("Meal Pattern saved successfully!");
        router.push("/addMember"); // Proceed to add new member
      } else {
        alert("Error: Failed to save meal pattern.");
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Meal Pattern</Text>

      {/* Meal Inputs with Material Design Icons */}
      <TextInput
        label="Breakfast"
        mode="outlined"
        value={breakfast}
        onChangeText={setBreakfast}
        style={styles.input}
        left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="food" size={24} color="gray" />} />}
      />

      <TextInput
        label="Lunch"
        mode="outlined"
        value={lunch}
        onChangeText={setLunch}
        style={styles.input}
        left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="food" size={24} color="gray" />} />}
      />

      <TextInput
        label="Dinner"
        mode="outlined"
        value={dinner}
        onChangeText={setDinner}
        style={styles.input}
        left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="food" size={24} color="gray" />} />}
      />

      {/* Food Beliefs */}
      <Text style={styles.subHeader}>Food Beliefs <Text style={styles.labelSmall}>(Cultural):</Text></Text>
      <TextInput
        mode="outlined"
        placeholder="Why do you think this type of food is usually prepared in your home?"
        value={foodBelief}
        onChangeText={setFoodBelief}
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      {/* Health-Seeking Practices */}
      <Text style={styles.subHeader}>Health-seeking practices:</Text>
      <TextInput
        mode="outlined"
        placeholder="How healthy do you consider yourself/family?"
        value={healthConsideration}
        onChangeText={setHealthConsideration}
        multiline
        numberOfLines={3}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        placeholder="Where do you go/What do you do if you get sick?"
        value={whatIfSick}
        onChangeText={setWhatIfSick}
        multiline
        numberOfLines={3}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        placeholder="How often do you get a health checkup? Why?"
        value={checkupFrequency}
        onChangeText={setCheckupFrequency}
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      {/* Add Member Button */}
      <TouchableOpacity onPress={handleSave} style={styles.addMemberButton}>
        <Text style={styles.addMemberText}>+ Add Member</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ✅ Styled to match the provided UI
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  subHeader: { fontSize: 16, fontWeight: "bold", marginTop: 16 },
  labelSmall: { fontSize: 16, fontWeight: "400" },
  input: { marginBottom: 16 },
  addMemberButton: {
    marginTop: 20,
    backgroundColor: "#205C3B",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addMemberText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default MealPatternScreen;
