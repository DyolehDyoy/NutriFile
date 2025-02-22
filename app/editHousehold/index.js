import React, { useEffect, useState } from "react";
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  Platform 
} from "react-native";
import { Text, TextInput, Button, Card } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import RNPickerSelect from "react-native-picker-select";
import supabase from "../supabaseClient";

const HouseholdEditScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [household, setHousehold] = useState({});
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchHousehold = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("household")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        console.log("Fetched Household Data:", data); // Debugging log
        setHousehold(data || {});
      } catch (error) {
        Alert.alert("Error", "Failed to load household data.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchHousehold();
  }, [id]);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("household")
        .update({ ...household })
        .eq("id", id);

      if (error) throw error;

      Alert.alert("Success", "Household details updated!", [
        { text: "OK", onPress: () => router.push({ pathname: "/editMealPattern", params: { id } }) }
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update household.");
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#1662C6" style={styles.loading} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.header}>Edit Household</Text>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Household Number"
            mode="outlined"
            value={household.householdnumber || ""}
            onChangeText={(text) => setHousehold({ ...household, householdnumber: text })}
            style={styles.input}
          />

          <TextInput
            label="Sitio / Purok"
            mode="outlined"
            value={household.sitio || ""}
            onChangeText={(text) => setHousehold({ ...household, sitio: text })}
            style={styles.input}
          />

          <Text style={styles.subHeader}>Date of Visit</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              mode="outlined"
              value={household.dateofvisit || ""}
              editable={false}
              style={styles.input}
              right={<TextInput.Icon icon="calendar" />}
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={household.dateofvisit ? new Date(household.dateofvisit) : new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setHousehold({ ...household, dateofvisit: selectedDate.toISOString().split("T")[0] });
                }
              }}
            />
          )}

          <Text style={styles.subHeader}>Toilet</Text>
          <RNPickerSelect
            onValueChange={(value) => setHousehold({ ...household, toilet: value })}
            items={[
              { label: "Presence", value: "Presence" },
              { label: "Absence", value: "Absence" },
            ]}
            style={pickerSelectStyles}
            value={household.toilet || ""}
          />

          <Text style={styles.subHeader}>Source of Water</Text>
          <RNPickerSelect
            onValueChange={(value) => setHousehold({ ...household, sourceofwater: value })}
            items={[
              { label: "Spring", value: "Spring" },
              { label: "DCWD", value: "DCWD" },
              { label: "Tabay", value: "Tabay" },
            ]}
            style={pickerSelectStyles}
            value={household.sourceofwater || ""}
          />

          <Text style={styles.subHeader}>Source of Income</Text>
          <RNPickerSelect
            onValueChange={(value) => setHousehold({ ...household, sourceofincome: value })}
            items={[
              { label: "Farming", value: "Farming" },
              { label: "Fishing", value: "Fishing" },
              { label: "Business", value: "Business" },
              { label: "Other", value: "Other" },
            ]}
            style={pickerSelectStyles}
            value={household.sourceofincome || ""}
          />

          <Text style={styles.subHeader}>Food Production</Text>
          <RNPickerSelect
            onValueChange={(value) => setHousehold({ ...household, foodproduction: value })}
            items={[
              { label: "Yes", value: "Yes" },
              { label: "No", value: "No" },
            ]}
            style={pickerSelectStyles}
            value={household.foodproduction || ""}
          />

          <Text style={styles.subHeader}>4Ps Membership</Text>
          <RNPickerSelect
            onValueChange={(value) => setHousehold({ ...household, membership4ps: value })}
            items={[
              { label: "Yes", value: "Yes" },
              { label: "No", value: "No" },
            ]}
            style={pickerSelectStyles}
            value={household.membership4ps || undefined}
            placeholder={{ label: "Select an item...", value: null }}
          />

          <Button mode="contained" style={styles.saveButton} onPress={handleSave}>
            Save Changes
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollContent: { flexGrow: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 16, color: "#1662C6" },
  subHeader: { fontSize: 16, fontWeight: "bold", marginTop: 16, marginBottom: 8, color: "#333" },
  input: { marginBottom: 16, backgroundColor: "#fff" },
  card: { marginBottom: 16, padding: 16, borderRadius: 8, backgroundColor: "#fff", elevation: 3 },
  saveButton: { marginTop: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: "#1662C6" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});

// ✅ Fixed PickerSelect Styles
const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    color: "#333",
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    color: "#333",
    backgroundColor: "#fff",
    marginBottom: 16,
  },
};

export default HouseholdEditScreen;
