import React, { useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { insertMealPattern, syncWithSupabase } from "../database";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { observable } from "@legendapp/state";
import { observer } from "@legendapp/state/react"; // ✅ Import observer

// ✅ Legend-State Observable Store
const formState = observable({
  breakfast: "",
  lunch: "",
  dinner: "",
  foodBelief: "",
  healthConsideration: "",
  whatIfSick: "",
  checkupFrequency: "",
});

const MealPatternScreen = () => {
  const router = useRouter();
  const { householdId } = useLocalSearchParams();

  console.log("📝 Received householdId:", householdId); // ✅ Debugging log

  useEffect(() => {
    if (!householdId) {
      Alert.alert("Error", "Household ID is missing. Returning to previous screen.");
      router.back(); // Navigate back if householdId is missing
    }
  }, [householdId]);

  const validateForm = () => {
    const { breakfast, lunch, dinner, foodBelief, healthConsideration, whatIfSick, checkupFrequency } = formState.get();

    if (!breakfast || !lunch || !dinner || !foodBelief || !healthConsideration || !whatIfSick || !checkupFrequency) {
      console.error("❌ Validation Failed: Some fields are empty!"); // ✅ Debugging log
      Alert.alert("Missing Fields", "Please fill in all required fields before proceeding.");
      return false;
    }

    console.log("✅ Validation Passed!"); // ✅ Debugging log
    return true;
  };
  const handleSave = async () => {
    console.log("🛠️ handleSave() triggered!");

    if (!validateForm()) {
      console.log("❌ Form validation failed!");
      return;
    }

    if (!householdId) {
      console.error("❌ Household ID is missing in MealPatternScreen!");
      Alert.alert("Error", "Household ID is missing.");
      return;
    }

    // ✅ Convert empty strings ("") to a default value to avoid NULL issues
    const mealData = {
      breakfast: formState.breakfast.get() || "N/A",
      lunch: formState.lunch.get() || "N/A",
      dinner: formState.dinner.get() || "N/A",
      foodbelief: formState.foodBelief.get() || "N/A",  // ✅ Fixed case and added fallback
      healthconsideration: formState.healthConsideration.get() || "N/A",  // ✅ Fixed case and added fallback
      whatifsick: formState.whatIfSick.get() || "N/A",  // ✅ Fixed case and added fallback
      checkupfrequency: formState.checkupFrequency.get() || "N/A",  // ✅ Fixed case and added fallback
    };

    console.log("📌 Meal Data Before Insert:", JSON.stringify(mealData, null, 2));

    const success = await insertMealPattern(householdId, mealData);

    if (!success) {
      console.error("❌ insertMealPattern() failed!");
      Alert.alert("Error", "Failed to save meal pattern.");
      return;
    }

    Alert.alert("Success", "Meal Pattern saved successfully!");
    console.log("🚀 Syncing to Supabase...");
    await syncWithSupabase();

    console.log("🔀 Navigating to Add Family Member Page...");
    router.push("/addMember");
};

  
  
  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Meal Pattern</Text>

      <TextInput
        label="Breakfast"
        mode="outlined"
        value={formState.breakfast.get()}
        onChangeText={formState.breakfast.set}
        style={styles.input}
        left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="food" size={24} color="gray" />} />}
      />

      <TextInput
        label="Lunch"
        mode="outlined"
        value={formState.lunch.get()}
        onChangeText={formState.lunch.set}
        style={styles.input}
        left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="food" size={24} color="gray" />} />}
      />

      <TextInput
        label="Dinner"
        mode="outlined"
        value={formState.dinner.get()}
        onChangeText={formState.dinner.set}
        style={styles.input}
        left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="food" size={24} color="gray" />} />}
      />

      <Text style={styles.subHeader}>Food Beliefs (Cultural):</Text>
      <TextInput
        mode="outlined"
        placeholder="Why do you think this type of food is usually prepared in your home?"
        value={formState.foodBelief.get()}
        onChangeText={formState.foodBelief.set}
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <Text style={styles.subHeader}>Health-seeking practices:</Text>
      <TextInput
        mode="outlined"
        placeholder="How healthy do you consider yourself/family?"
        value={formState.healthConsideration.get()}
        onChangeText={formState.healthConsideration.set}
        multiline
        numberOfLines={3}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        placeholder="Where do you go/What do you do if you get sick?"
        value={formState.whatIfSick.get()}
        onChangeText={formState.whatIfSick.set}
        multiline
        numberOfLines={3}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        placeholder="How often do you get a health checkup? Why?"
        value={formState.checkupFrequency.get()}
        onChangeText={formState.checkupFrequency.set}
        multiline
        numberOfLines={3}
        style={styles.input}
      />

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

export default observer(MealPatternScreen); // ✅ Wrap component with observer
