import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card, IconButton } from "react-native-paper";
import { useRouter } from "expo-router";

const DashboardScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
    

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
});

export default DashboardScreen;
