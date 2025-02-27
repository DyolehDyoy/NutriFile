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
  const { householdid } = useLocalSearchParams();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const rowRefs = useRef(new Map());
  const openRowRef = useRef(null);

  useEffect(() => {
    console.log("🔍 Household ID received:", householdid);
    if (!householdid) {
      Alert.alert("Error", "Household ID is missing.");
      router.back();
    } else {
      fetchFamilyMembers();
    }
  }, [householdid]);

  const fetchFamilyMembers = async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching family members for Household ID:", householdid);

      const { data, error } = await supabase
        .from("addmember")
        .select("id, firstname, lastname, relationship, householdid")
        .eq("householdid", householdid)
        .order("id", { ascending: false });

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

  const confirmDelete = (memberId) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this family member?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDelete(memberId),
        },
      ]
    );
  };

  const handleDelete = async (memberId) => {
    try {
      const { error } = await supabase.from("addmember").delete().match({ id: memberId });
      if (error) throw error;

      rowRefs.current.get(memberId)?.closeRow();
      openRowRef.current = null;
      setFamilyMembers((prev) => prev.filter((member) => member.id !== memberId));
      Vibration.vibrate(100);
      Alert.alert("Success", "Family member deleted successfully.");
    } catch (error) {
      console.error("❌ Error deleting member:", error.message);
      Alert.alert("Error", "Failed to delete member.");
    }
  };

  // ✅ Handle Edit - Navigates to Edit Screen
  const handleEdit = (memberId) => {
    rowRefs.current.get(memberId)?.closeRow();
    openRowRef.current = null;
    router.push({ pathname: "/editFamilyMember", params: { memberId } });
  };

  // ✅ Swipe actions - Side-by-side Edit & Delete buttons
  const renderHiddenItem = ({ item }) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.actionButton, styles.editButton]}
        onPress={() => {
          router.push({ pathname: "/editFamilyMember", params: { memberId: item.id, householdid: item.householdid } });
        }}
      >
        <MaterialCommunityIcons name="pencil" size={20} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={() => confirmDelete(item.id)}
      >
        <MaterialCommunityIcons name="delete" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Family Members</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#205C3B" style={styles.loader} />
      ) : familyMembers.length === 0 ? (
        <Text style={styles.emptyText}>No family members found.</Text>
      ) : (
        <SwipeListView
          data={familyMembers}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <Card style={styles.card}>
                <TouchableOpacity
                  style={styles.cardContent}
                  onPress={() => router.push({ pathname: "/viewFamilyMember", params: { memberId: item.id } })}
                >
                  <MaterialCommunityIcons name="account-circle" size={40} color="#1662C6" />
                  <View style={styles.textContainer}>
                    <Text style={styles.name}>
                      {item.firstname || ""} {item.lastname || ""}
                    </Text>
                    <Text style={styles.relationship}>
                      {item.relationship ? item.relationship : "No Relationship Info"}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
                </TouchableOpacity>
              </Card>
            </View>
          )}
          renderHiddenItem={renderHiddenItem}
          leftOpenValue={0}
          rightOpenValue={-100} // ✅ Adjusted for compact buttons
          disableRightSwipe={true}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        label="Add Member"
        onPress={() => {
          console.log("🟢 Navigating to AddMember with Household ID:", householdid);
          router.push({ pathname: "/addMember", params: { householdId: householdid } });
        }}
      />
    </View>
  );
};

// ✅ Styled for Modern Look
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1662C6",
    textAlign: "center",
    marginBottom: 16,
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
