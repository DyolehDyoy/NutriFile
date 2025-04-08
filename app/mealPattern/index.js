import React, { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";

import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  Divider,
  Switch,
  Menu,
} from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { insertMealPattern, syncWithSupabase } from "../database";
import { observable } from "@legendapp/state";
import { observer } from "@legendapp/state/react";

// ✅ Legend-State Observable Store
const formState = observable({
  breakfast: "",
  lunch: "",
  dinner: "",
  foodBelief: false,
  foodBeliefText: "",
  healthConsideration: "",
  whatIfSick: "",
  checkupFrequency: "Monthly", // Default value
  loading: false,
});

// ✅ Animated Value for Food Beliefs Input Field
const foodBeliefAnim = new Animated.Value(0);

const MealPatternScreen = () => {
  const router = useRouter();
  const { householdId } = useLocalSearchParams();
  const [menuVisible, setMenuVisible] = useState(false);


  const resetFormState = () => {
    formState.breakfast.set("");
    formState.lunch.set("");
    formState.dinner.set("");
    formState.foodBelief.set(false);
    formState.foodBeliefText.set("");
    formState.healthConsideration.set("");
    formState.whatIfSick.set("");
    formState.checkupFrequency.set("Monthly");
    formState.loading.set(false);
    console.log("🍽️ Meal Pattern form state reset.");
  };
  

  useEffect(() => {
    if (!householdId) {
      Alert.alert("Error", "Household ID is missing. Returning to the previous screen.");
      router.back();
    } else {
      resetFormState(); // 🧼 Reset on open
    }
  }, [householdId]);
  
  

  useEffect(() => {
    // ✅ Animate Food Beliefs Input when switch is toggled
    Animated.timing(foodBeliefAnim, {
      toValue: formState.foodBelief.get() ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [formState.foodBelief.get()]);

  const validateForm = () => {
    const { breakfast, lunch, dinner, healthConsideration, whatIfSick, foodBelief, foodBeliefText } = formState.get();
  
    if (!breakfast || !lunch || !dinner || !healthConsideration || !whatIfSick) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return false;
    }
  
    if (foodBelief && !foodBeliefText) {
      Alert.alert("Missing Input", "Please describe your food beliefs.");
      return false;
    }
  
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    formState.loading.set(true);

    const mealData = {
      breakfast: formState.breakfast.get() || "N/A",
      lunch: formState.lunch.get() || "N/A",
      dinner: formState.dinner.get() || "N/A",
      foodbelief: formState.foodBelief.get() ? formState.foodBeliefText.get() : "No",
      healthconsideration: formState.healthConsideration.get(),
      whatifsick: formState.whatIfSick.get(),
      checkupfrequency: formState.checkupFrequency.get(),
    };

    const success = await insertMealPattern(householdId, mealData);
    if (!success) {
      formState.loading.set(false);
      Alert.alert("Error", "Failed to save meal pattern.");
      return;
    }

    await syncWithSupabase();
    Alert.alert("Success", "Meal Pattern saved successfully!");
    formState.loading.set(false);
    router.push({ pathname: "/addMember", params: { householdId } });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
  <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
    <Icon name="arrow-back" size={24} color="#000" />
  </TouchableOpacity>
  <Text style={styles.header}>Meal Pattern</Text>
</View>


      {/* Meal Entries */}
      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Breakfast"
            mode="outlined"
            value={formState.breakfast.get()}
            onChangeText={formState.breakfast.set}
            style={styles.input}
            left={<TextInput.Icon icon="food-apple" />}
          />
          <TextInput
            label="Lunch"
            mode="outlined"
            value={formState.lunch.get()}
            onChangeText={formState.lunch.set}
            style={styles.input}
            left={<TextInput.Icon icon="food" />}
          />
          <TextInput
            label="Dinner"
            mode="outlined"
            value={formState.dinner.get()}
            onChangeText={formState.dinner.set}
            style={styles.input}
            left={<TextInput.Icon icon="silverware-fork-knife" />}
          />
        </Card.Content>
      </Card>

      {/* Food Beliefs */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.toggleRow}>
            <Text style={styles.subHeader}>Do you have any food beliefs?</Text>
            <Switch
              value={formState.foodBelief.get()}
              onValueChange={formState.foodBelief.set}
            />
          </View>
          <Divider style={styles.divider} />

          {/* ✅ Animated Food Beliefs Input Field */}
          <Animated.View style={{ opacity: foodBeliefAnim, height: foodBeliefAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 80], // Expands smoothly
          })}}>
            {formState.foodBelief.get() && (
              <TextInput
                mode="outlined"
                placeholder="Why do you think this type of food (identify the food) is usually prepared in your home?"
                value={formState.foodBeliefText.get()}
                onChangeText={formState.foodBeliefText.set}
                multiline
                numberOfLines={3}
                style={styles.input}
              />
            )}
          </Animated.View>
        </Card.Content>
      </Card>

      {/* Health Practices */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subHeader}>Health-seeking Practices</Text>
          <TextInput
            mode="outlined"
            placeholder="How healthy do you consider your family?"
            value={formState.healthConsideration.get()}
            onChangeText={formState.healthConsideration.set}
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            placeholder="Where do you go if you get sick?"
            value={formState.whatIfSick.get()}
            onChangeText={formState.whatIfSick.set}
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <Text style={styles.subHeader}>Health Checkup Frequency</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button mode="outlined" onPress={() => setMenuVisible(true)} style={styles.dropdown}>
                {formState.checkupFrequency.get()}
              </Button>
            }
          >
            {["NO Checkup", "Daily", "Weekly", "Monthly", "Yearly"].map((option) => (
              <Menu.Item
                key={option}
                title={option}
                onPress={() => {
                  formState.checkupFrequency.set(option);
                  setMenuVisible(false);
                }}
              />
            ))}
          </Menu>
        </Card.Content>
      </Card>

      {/* Save Button */}
      <Button 
  mode="contained" 
  style={styles.button} 
  buttonColor="#114ea9" // ✅ Change background color
  onPress={handleSave} 
  disabled={formState.loading.get()}
>
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
  dropdown: { marginTop: 10 },
  card: { marginBottom: 16, padding: 10, backgroundColor: "white", borderRadius: 10, elevation: 2 },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 5 },
  divider: { marginVertical: 10 },
  button: { marginTop: 20, padding: 10 },
});

export default observer(MealPatternScreen);
