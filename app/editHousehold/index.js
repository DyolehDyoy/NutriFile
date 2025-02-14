import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Text } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import supabase from "../supabaseClient";

const HouseholdEditScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Get household ID from navigation params
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch household details by ID
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
        setHousehold(data);
      } catch (error) {
        console.error("❌ Error fetching household:", error.message);
        Alert.alert("Error", "Failed to load household data.");
        router.back(); // Go back if there's an error
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchHousehold();
  }, [id]);

  // ✅ Handle updates
  const handleSave = async () => {
    if (!household) return;

    try {
      const { error } = await supabase
        .from("household")
        .update({
          sitio: household.sitio,
          householdnumber: household.householdnumber,
          dateofvisit: household.dateofvisit,
          toilet: household.toilet,
          sourceofwater: household.sourceofwater,
          sourceofincome: household.sourceofincome,
          foodproduction: household.foodproduction,
          membership4ps: household.membership4ps,
        })
        .eq("id", id); // 🔥 Keep the same ID

      if (error) throw error;

      Alert.alert("Success", "Household details updated!");
      router.push("/households"); // ✅ Navigate back to household list
    } catch (error) {
      console.error("❌ Error updating household:", error.message);
      Alert.alert("Error", "Failed to update household.");
    }
  };

  if (loading) return <ActivityIndicator size="large" color="white" style={styles.loading} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Household</Text>

      {/* Household Number */}
      <TextInput
        style={styles.input}
        placeholder="Household Number"
        value={household.householdnumber}
        onChangeText={(text) => setHousehold({ ...household, householdnumber: text })}
      />

      {/* Sitio / Purok */}
      <TextInput
        style={styles.input}
        placeholder="Sitio / Purok"
        value={household.sitio}
        onChangeText={(text) => setHousehold({ ...household, sitio: text })}
      />

      {/* Date of Visit */}
      <TextInput
        style={styles.input}
        placeholder="Date of Visit"
        value={household.dateofvisit}
        onChangeText={(text) => setHousehold({ ...household, dateofvisit: text })}
      />

      {/* Toilet */}
      <TextInput
        style={styles.input}
        placeholder="Toilet"
        value={household.toilet}
        onChangeText={(text) => setHousehold({ ...household, toilet: text })}
      />

      {/* Source of Water */}
      <TextInput
        style={styles.input}
        placeholder="Source of Water"
        value={household.sourceofwater}
        onChangeText={(text) => setHousehold({ ...household, sourceofwater: text })}
      />

      {/* Source of Income */}
      <TextInput
        style={styles.input}
        placeholder="Source of Income"
        value={household.sourceofincome}
        onChangeText={(text) => setHousehold({ ...household, sourceofincome: text })}
      />

      {/* Food Production */}
      <TextInput
        style={styles.input}
        placeholder="Food Production"
        value={household.foodproduction}
        onChangeText={(text) => setHousehold({ ...household, foodproduction: text })}
      />

      {/* Membership 4Ps */}
      <TextInput
        style={styles.input}
        placeholder="Membership 4Ps"
        value={household.membership4ps}
        onChangeText={(text) => setHousehold({ ...household, membership4ps: text })}
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#205C3B" },
  header: { fontSize: 22, fontWeight: "bold", color: "white", textAlign: "center", marginBottom: 20 },
  input: { backgroundColor: "white", padding: 10, borderRadius: 8, marginBottom: 12 },
  saveButton: { backgroundColor: "#1662C6", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
  saveButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default HouseholdEditScreen;
