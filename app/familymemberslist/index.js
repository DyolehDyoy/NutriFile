import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Vibration,
  RefreshControl,
} from "react-native";
import { Text, FAB, Card } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import supabase from "../supabaseClient";
import { SwipeListView } from "react-native-swipe-list-view";

const FamilyMembersListScreen = () => {
  const router = useRouter();
  const { householdid } = useLocalSearchParams(); // or householdUuid, if the route param is a UUID
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Manage references to each open row in SwipeListView
  const rowRefs = useRef(new Map());
  const openRowRef = useRef(null);

  useEffect(() => {
    console.log("🔍 Household UUID received:", householdid);
    if (!householdid) {
      Alert.alert("Error", "Household UUID is missing.");
      router.back();
    } else {
      fetchFamilyMembers();
    }
  }, [householdid]);

  const fetchFamilyMembers = async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching family members for household_uuid:", householdid);

      // Query Supabase by household_uuid instead of numeric householdid
      const { data, error } = await supabase
        .from("addmember")
        .select("uuid, firstname, lastname, relationship, household_uuid")
        .eq("household_uuid", householdid)  // match the parent's UUID
        .order("uuid", { ascending: false }); // or .order("dateofbirth", ...)

      if (error) {
        console.error("❌ Supabase Error:", error.message);
        throw error;
      }

      console.log("✅ Fetched Family Members:", data);
      setFamilyMembers(data || []);
    } catch (error) {
      Alert.alert("Error", "Failed to load family members.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFamilyMembers();
    setRefreshing(false);
  };

  // Confirm before deleting
  const confirmDelete = (memberUuid) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this family member?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDelete(memberUuid),
        },
      ]
    );
  };

  // Delete by matching on uuid
  const handleDelete = async (memberUuid) => {
    try {
      const { error } = await supabase
        .from("addmember")
        .delete()
        .match({ uuid: memberUuid }); // use uuid instead of id
      if (error) throw error;

      // Close the row in SwipeListView
      rowRefs.current.get(memberUuid)?.closeRow();
      openRowRef.current = null;
      setFamilyMembers((prev) => prev.filter((member) => member.uuid !== memberUuid));
      Vibration.vibrate(100);
      Alert.alert("Success", "Family member deleted successfully.");
    } catch (error) {
      console.error("❌ Error deleting member:", error.message);
      Alert.alert("Error", "Failed to delete member.");
    }
  };

  // Edit by passing the member's UUID to the route
  const handleEdit = (memberUuid) => {
    rowRefs.current.get(memberUuid)?.closeRow();
    openRowRef.current = null;
    router.push({ pathname: "/editFamilyMember", params: { memberUuid } });
  };

  // Swipe Left Hidden Item (Edit & Delete)
  const renderHiddenItem = ({ item }) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.actionButton, styles.editButton]}
        onPress={() =>
          router.push({
            pathname: "/editFamilyMember",
            params: {
              memberUuid: item.uuid,
              householdid: item.household_uuid,
            },
          })
        }
      >
        <MaterialCommunityIcons name="pencil" size={20} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={() => confirmDelete(item.uuid)}
      >
        <MaterialCommunityIcons name="delete" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1662C6" />
        </TouchableOpacity>
        <Text style={styles.header}>Family Members</Text>
      </View>

      {/* Loading or No Records */}
      {loading ? (
        <ActivityIndicator size="large" color="#205C3B" style={styles.loader} />
      ) : familyMembers.length === 0 ? (
        <Text style={styles.emptyText}>No family members found.</Text>
      ) : (
        // Otherwise show the list
        <SwipeListView
          data={familyMembers}
          // Key extractor on "uuid" now
          keyExtractor={(item) => item.uuid}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          // Visible Item
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <Card style={styles.card}>
                <TouchableOpacity
                  style={styles.cardContent}
                  onPress={() =>
                    router.push({
                      pathname: "/viewFamilyMember",
                      params: { memberUuid: item.uuid },
                    })
                  }
                >
                  <MaterialCommunityIcons name="account-circle" size={40} color="#1662C6" />
                  <View style={styles.textContainer}>
                    <Text style={styles.name}>
                      {item.firstname || ""} {item.lastname || ""}
                    </Text>
                    <Text style={styles.relationship}>
                      {item.relationship || "No Relationship Info"}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
                </TouchableOpacity>
              </Card>
            </View>
          )}
          // Hidden Item for swipe actions
          renderHiddenItem={renderHiddenItem}
          leftOpenValue={0}
          rightOpenValue={-100}
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

      {/* FAB to add new member */}
      <FAB
        style={styles.fab}
        icon="plus"
        label="Add Member"
        onPress={() => {
          console.log("🟢 Navigating to AddMember with household_uuid:", householdid);
          router.push({
            pathname: "/addMember",
            params: { householdId: householdid },
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
    paddingTop: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 16,
  },
  backButton: {
    marginRight: 10,
    padding: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1662C6",
  },
  loader: {
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  cardContainer: {
    marginBottom: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    elevation: 4,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  relationship: {
    fontSize: 14,
    color: "#666",
  },
  rowBack: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    height: "100%",
    borderRadius: 10,
    paddingRight: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginHorizontal: 5,
    elevation: 3,
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
    backgroundColor: "#1662C6",
  },
});

export default FamilyMembersListScreen;
