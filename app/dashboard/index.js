import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native"; // ✅ Import Image here
import { Text, Card, IconButton } from "react-native-paper";
import { useRouter } from "expo-router";
import { syncWithSupabase } from "../database"; // Adjust path if needed
import { MaterialCommunityIcons } from "@expo/vector-icons";

const DashboardScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* ✅ Header with Logo */}
      <View style={styles.headerContainer}>
        <Image 
          source={require("../../assets/nutrifile.png")} // ✅ Ensure correct path
          style={styles.logo}
        />
      </View>

      <TouchableOpacity onPress={syncWithSupabase} style={styles.syncButton}>
  <MaterialCommunityIcons name="cloud-upload" size={24} color="#fff" />
  <Text style={styles.syncText}>Sync Data</Text>
</TouchableOpacity>


      {/* New Household Form Card */}
      <TouchableOpacity onPress={() => router.push("/newHouseholdForm")}>
        <Card style={[styles.card, styles.brownCard]}>
          <Card.Content>
            <View style={styles.row}>
              <IconButton icon="home" size={24} color="#fff" />
              <Text style={styles.cardTitle}>New Household Form</Text>
            </View>
            <Text style={styles.cardText}>
              Start a new household health assessment.
            </Text>
          </Card.Content>
          <IconButton icon="chevron-right" size={24} color="#fff" style={styles.arrowIcon} />
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
            <Text style={styles.cardText}>
              View and manage households.
            </Text>
          </Card.Content>
          <IconButton icon="chevron-right" size={24} color="#fff" style={styles.arrowIcon} />
        </Card>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  card: { borderRadius: 10, marginBottom: 16, paddingHorizontal: 16, paddingVertical: 12 },
  blueCard: { backgroundColor: "#1662C6" },
  brownCard: { backgroundColor: "#A07D40" },
  greenCard: { backgroundColor: "#205C3B" },
  cardTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  cardText: { color: "#fff", fontSize: 14, marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center" },
  arrowIcon: { position: "absolute", right: 16, top: 16 },

  // ✅ Adjusted spacing between the logo and cards
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -10, // 🔥 Reduced from 30 → 10 (Less space)
  },
  logo: {
    width: 250, // Keeping it big
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
    marginTop: -10,  // Optional: move closer to logo
    marginBottom: 20,
  },
  
  syncText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  
});


export default DashboardScreen;
