import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Vibration,
  Alert,
} from "react-native";
import { Text, FAB } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import supabase from "../supabaseClient";
import { SwipeListView } from "react-native-swipe-list-view";

const HouseholdListScreen = () => {
  const router = useRouter();
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const rowRefs = useRef(new Map());
  const openRowRef = useRef(null);

  // ✅ Fetch households from Supabase
  const fetchHouseholds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("household")
        .select("id, householdnumber, sitio")
        .order("id", { ascending: false });

      if (error) throw error;
      setHouseholds(data || []);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch households.");
      console.error("Error fetching households:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHouseholds();
    setRefreshing(false);
  }, []);

  // ✅ Navigate to Family Members List when clicking a household
  const handleHouseholdClick = (householdid) => {
    router.push({ pathname: "/familymemberslist", params: { householdid } });
  };

  // ✅ Delete household
  const handleDelete = async (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this household?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase.from("household").delete().match({ id });
            if (error) throw error;

            rowRefs.current.get(id)?.closeRow();
            openRowRef.current = null;
            setHouseholds((prev) => prev.filter((household) => household.id !== id));
            Vibration.vibrate(100);
          } catch (error) {
            console.error("Error deleting household:", error.message);
          }
        },
      },
    ]);
  };

  // ✅ Swipe Left: Show "Edit" & "Delete" options for household
  const renderHiddenItem = ({ item }) => (
    <View style={styles.rowBack}>
      <View style={styles.actionButtonsContainer}>
        {/* ✅ Edit Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            router.push({ pathname: "/editHousehold", params: { id: item.id } });
          }}
        >
          <MaterialCommunityIcons name="pencil" size={18} color="white" />
        </TouchableOpacity>
  
        {/* ✅ Reduce space between buttons */}
        <View style={{ width: 5 }} /> 
  
        {/* ✅ Delete Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <MaterialCommunityIcons name="delete" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
  <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
    <MaterialCommunityIcons name="arrow-left" size={24} color="#205C3B" />
  </TouchableOpacity>
  <Text style={styles.header}>Households</Text>
</View>
      {loading ? (
        <ActivityIndicator size="large" color="#205C3B" />
      ) : households.length === 0 ? (
        <Text style={styles.emptyText}>No households found.</Text>
      ) : (
        <SwipeListView
          data={households}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View style={styles.rowFrontContainer}>
              <TouchableOpacity
                style={styles.rowFront}
                onPress={() => handleHouseholdClick(item.id)} // ✅ Navigate to family members list
              >
                <MaterialCommunityIcons name="home-outline" size={28} color="#205C3B" />
                <Text style={styles.cardText}>
                  {item.sitio} - {item.householdnumber}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
              </TouchableOpacity>
            </View>
          )}
          renderHiddenItem={renderHiddenItem}
          leftOpenValue={0}
          rightOpenValue={-140}
          disableRightSwipe={true}
          onRowOpen={(rowKey) => {
            if (openRowRef.current && openRowRef.current !== rowKey) {
              rowRefs.current.get(openRowRef.current)?.closeRow();
            }
            openRowRef.current = rowKey;
          }}
          onRowClose={(rowKey) => {
            if (openRowRef.current === rowKey) {
              openRowRef.current = null;
            }
          }}
        />
      )}

<FAB
  style={styles.fab}
  icon="plus"
  onPress={() => {
    router.push({
      pathname: "/newHouseholdForm",
    });
  }}
/>

    </View>
  );
};

// ✅ Styles for UI Components

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#205C3B",
    textAlign: "center",
    marginVertical: 20,
  },
  rowFrontContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  rowFront: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "white",
    borderRadius: 12,
  },
  cardText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginLeft: 10,
  },
  emptyText: {
    color: "#888",
    fontSize: 18,
    marginTop: 20,
    textAlign: "center",
  },
  rowBack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
    backgroundColor: "transparent",
    borderRadius: 10,
    paddingRight: 10,
  },
  
  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", 
    width: 110,  // 🔥 Reduced width from 140 → 110
    height: "100%",
  },
  
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 50,  // 🔥 Reduced button width (from 60 → 50)
    height: 45, // 🔥 Reduced button height (from 50 → 45)
    borderRadius: 8, // Slightly rounder edges
  },
  
  editButton: {
    backgroundColor: "#2D9CDB",  // 🔵 Blue Edit Button
  },
  
  deleteButton: {
    backgroundColor: "#EB5757",  // 🔴 Red Delete Button
  },
  
  
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#205C3B",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start", // Ensures items are aligned to the left
    marginVertical: 20,
  },
  backButton: {
    marginRight: 10, // Adds spacing between the back button and title
    padding: 10, // Increases touchable area
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#205C3B",
  },
  
});

export default HouseholdListScreen;