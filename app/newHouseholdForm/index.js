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
  sourceOfWater: "Spring",
  sourceOfIncome: "Farming",
  foodProduction: false,
  membership4Ps: false,
  loading: false,
});

const NewHouseholdForm = () => {
  const router = useRouter();

  useEffect(() => {
    createTables();
  }, []);

  const handleHouseholdNumberChange = (text) => {
    formState.householdNumberError.set(/^\d*$/.test(text) ? "" : "Numbers only");
    formState.householdNumber.set(text);
  };

  const validateForm = () => {
    const {
      sitio,
      householdNumber,
      toilet,
      sourceOfWater,
      sourceOfIncome,
      householdNumberError,
    } = formState.get();

    if (!sitio || !householdNumber || householdNumberError) {
      Alert.alert("Missing Fields", "Please complete all required fields.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    formState.loading.set(true);

    const data = {
      sitio: formState.sitio.get(),
      householdnumber: formState.householdNumber.get(),
      dateofvisit: formState.dateOfVisit.get().toISOString().split("T")[0],
      toilet: formState.toilet.get(),
      sourceofwater: formState.sourceOfWater.get(),
      sourceofincome: formState.sourceOfIncome.get(),
      foodproduction: formState.foodProduction.get() ? "Yes" : "No",
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
          <Text style={styles.subHeader}>Toilet Availability:</Text>
          <SegmentedButtons
            value={formState.toilet.get()}
            onValueChange={formState.toilet.set}
            buttons={[
              { value: "Presence", label: "Present" },
              { value: "Absence", label: "Absent" },
            ]}
          />

          <Text style={styles.subHeader}>Source of Water:</Text>
          <SegmentedButtons
            value={formState.sourceOfWater.get()}
            onValueChange={formState.sourceOfWater.set}
            buttons={[
              { value: "Spring", label: "Spring" },
              { value: "DCWD", label: "DCWD" },
              { value: "Tabay", label: "Tabay" },
            ]}
          />
        </Card.Content>
      </Card>

      {/* Source of Income & Membership */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subHeader}>Source of Income:</Text>
          <SegmentedButtons
            value={formState.sourceOfIncome.get()}
            onValueChange={formState.sourceOfIncome.set}
            buttons={[
              { value: "Farming", label: "Farming" },
              { value: "Fishing", label: "Fishing" },
              { value: "Business", label: "Business" },
              { value: "Other", label: "Other" },
            ]}
          />

          <Divider style={{ marginVertical: 10 }} />

          <View style={styles.toggleRow}>
            <Text style={styles.subHeader}>Food Production:</Text>
            <Switch
              value={formState.foodProduction.get()}
              onValueChange={formState.foodProduction.set}
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
});

export default observer(NewHouseholdForm);
