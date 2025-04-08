import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { 
  Text, 
  Card, 
  IconButton, 
  Button, 
  Portal, 
  Modal 
} from "react-native-paper";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Import getUnsyncedData, syncWithSupabase, and resetLocalDatabase
import { getUnsyncedData, syncWithSupabase, resetLocalDatabase } from "../database";

const DashboardScreen = () => {
  const router = useRouter();

  // We'll store unsynced data in state
  const [unsynced, setUnsynced] = useState(null);

  // Control the visibility of the modal
  const [showUnsyncedModal, setShowUnsyncedModal] = useState(false);

  // 1) Fetch and display unsynced data
  const handleReviewUnsynced = async () => {
    try {
      const data = await getUnsyncedData();
      setUnsynced(data);
      setShowUnsyncedModal(true);
    } catch (err) {
      console.error("Error fetching unsynced data:", err);
    }
  };

  // 2) Run the sync, then reset local DB
  const handleCompleteSync = async () => {
    setShowUnsyncedModal(false);
    await syncWithSupabase();
    await resetLocalDatabase(); // Wipes & recreates local DB
  };

  return (
    <View style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.headerContainer}>
        <Image
          source={require("../../assets/nutrifile.png")}
          style={styles.logo}
        />
      </View>

      {/* Button to show unsynced data in a modal */}
      <TouchableOpacity onPress={handleReviewUnsynced} style={styles.syncButton}>
        <MaterialCommunityIcons name="cloud-upload" size={24} color="#fff" />
        <Text style={styles.syncText}>Sync Data</Text>
      </TouchableOpacity>

      {/* Modal for showing unsynced data */}
      <Portal>
        <Modal
          visible={showUnsyncedModal}
          onDismiss={() => setShowUnsyncedModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {unsynced && (
            <>
              <Text style={styles.modalTitle}>Unsynced Data</Text>
              <ScrollView style={styles.modalScroll}>
                <Text>Households: {unsynced.households.length}</Text>
                <Text>Members: {unsynced.members.length}</Text>
                <Text>Meal Patterns: {unsynced.mealPatterns.length}</Text>
                <Text>Member Health Info: {unsynced.healthInfo.length}</Text>
                <Text>Immunizations: {unsynced.immunizations.length}</Text>
              </ScrollView>
              <Button
                mode="contained"
                onPress={handleCompleteSync}
                style={styles.completeSyncButton}
              >
                Complete Sync
              </Button>
            </>
          )}
        </Modal>
      </Portal>

      {/* New Household Form Card */}
      <TouchableOpacity onPress={() => router.push("/newHouseholdForm")}>
        <Card style={[styles.card, styles.brownCard]}>
          <Card.Content>
            <View style={styles.row}>
              <IconButton icon="home" size={24} color="#fff" />
              <Text style={styles.cardTitle}>New Household Form</Text>
            </View>
            <Text style={styles.cardText}>Start a new household health assessment.</Text>
          </Card.Content>
          <IconButton
            icon="chevron-right"
            size={24}
            color="#fff"
            style={styles.arrowIcon}
          />
        </Card>
      </TouchableOpacity>

      {/* Household List Card */}
      <TouchableOpacity onPress={() => router.push("/householdlist")}>
        <Card style={[styles.card, styles.greenCard]}>
          <Card.Content>
            <View style={styles.row}>
              <IconButton icon="home-group" size={24} color="#fff" />
              <Text style={styles.cardTitle}>Household List</Text>
            </View>
            <Text style={styles.cardText}>View and manage households.</Text>
          </Card.Content>
          <IconButton
            icon="chevron-right"
            size={24}
            color="#fff"
            style={styles.arrowIcon}
          />
        </Card>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },

  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -10,
  },
  logo: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },

  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1662C6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: -10,
    marginBottom: 20,
  },
  syncText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },

  card: {
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  brownCard: { backgroundColor: "#A07D40" },
  greenCard: { backgroundColor: "#205C3B" },
  cardTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  cardText: { color: "#fff", fontSize: 14, marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center" },
  arrowIcon: { position: "absolute", right: 16, top: 16 },

  // Modal Styles
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    margin: 16,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalScroll: {
    maxHeight: 200,
    marginBottom: 20,
  },
  completeSyncButton: {
    alignSelf: "flex-end",
  },
});

export default DashboardScreen;
