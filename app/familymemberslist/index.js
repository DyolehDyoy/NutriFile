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

  const renderHiddenItem = ({ item }) => (
    <View style={styles.rowBack}>
      <View style={styles.deleteContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(item.id)}
        >
          <MaterialCommunityIcons name="delete" size={22} color="white" />
          <Text style={styles.swipeText}>Delete</Text>
        </TouchableOpacity>
      </View>
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
            <Card style={styles.card}>
              <TouchableOpacity
                style={styles.cardContent}
                onPress={() => router.push({ pathname: "/editFamilyMember", params: { memberId: item.id } })}
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
          )}
          renderHiddenItem={renderHiddenItem}
          leftOpenValue={0}
          rightOpenValue={-90} // ✅ Moved delete button further right
          disableRightSwipe={true}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        label="Add Member"
        onPress={() => router.push({ pathname: "/addFamilyMember", params: { householdid } })}
      />
    </View>
  );
};

// ✅ Updated UI Styles
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
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10,
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
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 10,
    paddingRight: 15,
  },
  deleteContainer: {
    alignItems: "flex-end", // ✅ Moves delete button to the right
    justifyContent: "center",
    width: "100%",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    width: 80, // ✅ Full width like the reference image
    height: 45, // ✅ Proper height
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  swipeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#1662C6",
    paddingHorizontal: 10,
  },
});

export default FamilyMembersListScreen;
