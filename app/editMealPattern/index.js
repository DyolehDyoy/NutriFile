import React, { useEffect, useState } from "react";
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
  SegmentedButtons,
} from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import supabase from "../supabaseClient";
import { observable } from "@legendapp/state";
import { observer } from "@legendapp/state/react";

// ✅ Ensure formState is properly initialized
const formState = observable({
  breakfast: "",
  lunch: "",
  dinner: "",
  foodBelief: false,
  foodBeliefText: "",
  healthConsideration: "",
  whatIfSick: "",
  checkupFrequency: "Monthly",
  loading: false,
});

const MealPatternEditScreen = observer(() => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const foodBeliefAnim = new Animated.Value(0);

  useEffect(() => {
    let isMounted = true;

    if (!id) {
      Alert.alert("Error", "Meal Pattern ID is missing. Returning to the previous screen.");
      router.back();
    } else {
      fetchMealPattern(isMounted);
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // ✅ Fetch meal pattern data safely
  const fetchMealPattern = async (isMounted) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("mealpattern").select("*").eq("id", id).single();
      if (error) throw error;

      console.log("✅ Fetched Meal Pattern Data:", data);

      if (isMounted) {
        formState.breakfast.set(data?.breakfast || "");
        formState.lunch.set(data?.lunch || "");
        formState.dinner.set(data?.dinner || "");
        formState.foodBelief.set(data?.foodbelief !== "No");
        formState.foodBeliefText.set(data?.foodbelief !== "No" ? data.foodbelief : "");
        formState.healthConsideration.set(data?.healthconsideration || "");
        formState.whatIfSick.set(data?.whatifsick || "");
        formState.checkupFrequency.set(data?.checkupfrequency || "Monthly");
      }
    } catch (error) {
      if (isMounted) Alert.alert("Error", "Failed to load meal pattern data.");
      router.back();
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
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
        breakfast: formState.breakfast.get(),
        lunch: formState.lunch.get(),
        dinner: formState.dinner.get(),
        foodbelief: formState.foodBelief.get() ? formState.foodBeliefText.get() : "No",
        healthconsideration: formState.healthConsideration.get(),
        whatifsick: formState.whatIfSick.get(),
        checkupfrequency: formState.checkupFrequency.get(),
    };

    try {
        const { error } = await supabase
            .from("mealpattern")
            .update(mealData)
            .eq("id", id);

        if (error) throw error;

        Alert.alert("Success", "Meal Pattern updated successfully!", [
            {
                text: "OK",
                onPress: () => router.push("/householdlist"), // ✅ Navigate to Household List
            },
        ]);
    } catch (error) {
        console.error("❌ Supabase Update Error:", error.message);
        Alert.alert("Error", `Failed to update meal pattern: ${error.message}`);
    } finally {
        formState.loading.set(false);
    }
};


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Edit Meal Pattern</Text>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput label="Breakfast" mode="outlined" value={formState.breakfast.get()} onChangeText={formState.breakfast.set} style={styles.input} />
          <TextInput label="Lunch" mode="outlined" value={formState.lunch.get()} onChangeText={formState.lunch.set} style={styles.input} />
          <TextInput label="Dinner" mode="outlined" value={formState.dinner.get()} onChangeText={formState.dinner.set} style={styles.input} />
        </Card.Content>
      </Card>

      {/* Food Beliefs */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.toggleRow}>
            <Text style={styles.subHeader}>Do you have any food beliefs?</Text>
            <Switch value={formState.foodBelief.get()} onValueChange={formState.foodBelief.set} />
          </View>
          <Divider style={styles.divider} />

          <Animated.View style={{ opacity: foodBeliefAnim, height: foodBeliefAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 80] }) }}>
            {formState.foodBelief.get() && (
              <TextInput mode="outlined" placeholder="Describe any cultural food beliefs..." value={formState.foodBeliefText.get()} onChangeText={formState.foodBeliefText.set} multiline numberOfLines={3} style={styles.input} />
            )}
          </Animated.View>
        </Card.Content>
      </Card>

      {/* Health Practices */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subHeader}>Health-seeking Practices</Text>
          <TextInput mode="outlined" placeholder="How healthy do you consider your family?" value={formState.healthConsideration.get()} onChangeText={formState.healthConsideration.set} multiline numberOfLines={3} style={styles.input} />
          <TextInput mode="outlined" placeholder="Where do you go if you get sick?" value={formState.whatIfSick.get()} onChangeText={formState.whatIfSick.set} multiline numberOfLines={3} style={styles.input} />
          <Text style={styles.subHeader}>Health Checkup Frequency</Text>
          <SegmentedButtons value={formState.checkupFrequency.get()} onValueChange={formState.checkupFrequency.set} buttons={[{ value: "Daily", label: "Daily" }, { value: "Weekly", label: "Weekly" }, { value: "Monthly", label: "Monthly" }, { value: "Yearly", label: "Yearly" }]} />
        </Card.Content>
      </Card>

      <Button mode="contained" style={styles.button} onPress={handleSave} disabled={formState.loading.get()}>
        {formState.loading.get() ? <ActivityIndicator color="white" /> : "Save & Next"}
      </Button>
    </ScrollView>
  );
});

// ✅ Styles to prevent the "styles" undefined error
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  input: { marginBottom: 12 },
  card: { marginBottom: 16, padding: 10, backgroundColor: "white", borderRadius: 10, elevation: 2 },
  button: { marginTop: 20, padding: 10 },
  subHeader: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  divider: { marginVertical: 10 },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 5 },
});

export default MealPatternEditScreen;
