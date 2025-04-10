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

  // Refs to manage open rows in SwipeListView
  const rowRefs = useRef(new Map());
  const openRowRef = useRef(null);

  // ✅ Fetch households from Supabase by "uuid" etc.
  const fetchHouseholds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("household")
        .select("uuid, householdnumber, sitio")
        .order("uuid", { ascending: false });

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

  // ✅ Navigate to Family Members List, passing householdUuid
  const handleHouseholdClick = (householdUuid) => {
    router.push({ pathname: "/familymemberslist", params: { householdid: householdUuid } });
  };

  // ✅ Delete household by matching on "uuid"
  const handleDelete = async (householdUuid) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this household?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("household")
                .delete()
                .match({ uuid: householdUuid });
              if (error) throw error;

              // Close the row
              rowRefs.current.get(householdUuid)?.closeRow();
              openRowRef.current = null;

              // Remove from state
              setHouseholds((prev) => prev.filter((hh) => hh.uuid !== householdUuid));
              Vibration.vibrate(100);
            } catch (error) {
              console.error("Error deleting household:", error.message);
            }
          },
        },
      ]
    );
  };

  // ✅ Swipe left: Show "Edit" & "Delete"
  const renderHiddenItem = ({ item }) => (
    <View style={styles.rowBack}>
      <View style={styles.actionButtonsContainer}>
        {/* ✅ Edit Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            // If you have an "editHousehold" screen, pass item.uuid
            router.push({ pathname: "/editHousehold", params: { householdUuid: item.uuid } });
          }}
        >
          <MaterialCommunityIcons name="pencil" size={18} color="white" />
        </TouchableOpacity>

        <View style={{ width: 5 }} />

        {/* ✅ Delete Button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.uuid)}
        >
          <MaterialCommunityIcons name="delete" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.replace("/dashboard")} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#205C3B" />
        </TouchableOpacity>
        <Text style={styles.header}>Households</Text>
      </View>

      {/* Loading or Display List */}
      {loading ? (
        <ActivityIndicator size="large" color="#205C3B" />
      ) : households.length === 0 ? (
        <Text style={styles.emptyText}>No households found.</Text>
      ) : (
        <SwipeListView
          data={households}
          // Key on "uuid"
          keyExtractor={(item) => item.uuid}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View style={styles.rowFrontContainer}>
              <TouchableOpacity
                style={styles.rowFront}
                onPress={() => handleHouseholdClick(item.uuid)}
              >
                <MaterialCommunityIcons name="home-outline" size={28} color="#205C3B" />
                <Text style={styles.cardText}>
                  {item.sitio} - {item.householdnumber}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
              </TouchableOpacity>
            </View>
          )}
          // Hidden item for swipe to edit/delete
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

      {/* FAB - New Household */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          router.push({
            pathname: "/newHouseholdForm",
            params: { reset: "true" },
          });
        }}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: 20,
  },
  backButton: {
    marginRight: 10,
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#205C3B",
  },
  emptyText: {
    color: "#888",
    fontSize: 18,
    marginTop: 20,
    textAlign: "center",
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
    width: 110,
    height: "100%",
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 45,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: "#2D9CDB",
  },
  deleteButton: {
    backgroundColor: "#EB5757",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#205C3B",
  },
});

export default HouseholdListScreen;
