import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl 
} from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import supabase from "../supabaseClient";

const HouseholdListScreen = () => {
  const router = useRouter();
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Fetch households from Supabase
  const fetchHouseholds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("household")
        .select("id, householdnumber, sitio")
        .order("id", { ascending: false }); // ✅ Show newest first

      if (error) throw error;

      setHouseholds(data || []); // Ensure data is an array
    } catch (error) {
      console.error("❌ Error fetching households:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Refresh function for pull-down refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHouseholds();
    setRefreshing(false);
  }, []);

  useEffect(() => {
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/editHousehold?id=${item.id}`)} // ✅ Navigate to Edit Household
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
