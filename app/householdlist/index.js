import React, { useEffect, useState } from "react";
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import supabase from "../supabaseClient";

const HouseholdListScreen = () => {
  const router = useRouter();
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch households from Supabase
  useEffect(() => {
    const fetchHouseholds = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("household")
          .select("id, householdnumber, sitio");

        if (error) throw error;

        setHouseholds(data || []); // Ensure data is an array
      } catch (error) {
        console.error("❌ Error fetching households:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHouseholds();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header Icon */}
      <MaterialCommunityIcons name="home-group" size={50} color="white" style={styles.icon} />

      {/* Show loading indicator */}
      {loading ? (
        <ActivityIndicator size="large" color="white" />
      ) : households.length === 0 ? (
        <Text style={styles.emptyText}>No households found.</Text>
      ) : (
        <FlatList
          data={households}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/household/${item.id}`)}
            >
              <Text style={styles.cardText}>🏠 {item.sitio} - {item.householdnumber}</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="black" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#205C3B", padding: 16, alignItems: "center" },
  icon: { marginBottom: 20 },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    marginBottom: 10,
  },
  cardText: { fontSize: 16, fontWeight: "bold" },
  emptyText: { color: "white", fontSize: 18, marginTop: 20 },
});

export default HouseholdListScreen;
