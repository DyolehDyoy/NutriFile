import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card, IconButton } from "react-native-paper";
import { useRouter } from "expo-router";

const DashboardScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Dashboard Card */}
      <TouchableOpacity onPress={() => router.push("/dashboard")}>
        <Card style={[styles.card, styles.blueCard]}>
          <Card.Content>
            <View style={styles.row}>
              <IconButton icon="view-dashboard" size={24} color="#fff" />
              <Text style={styles.cardTitle}>Dashboard</Text>
            </View>
            <Text style={styles.cardText}>
              View key insights and manage household health data.
            </Text>
          </Card.Content>
          <IconButton icon="chevron-right" size={24} color="#fff" style={styles.arrowIcon} />
        </Card>
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
              Start a new family health assessment.
            </Text>
          </Card.Content>
          <IconButton icon="chevron-right" size={24} color="#fff" style={styles.arrowIcon} />
        </Card>
      </TouchableOpacity>

      {/* Family Members Card */}
      <TouchableOpacity onPress={() => router.push("/familymembers")}>
        <Card style={[styles.card, styles.greenCard]}>
          <Card.Content>
            <View style={styles.row}>
              <IconButton icon="account-group" size={24} color="#fff" />
              <Text style={styles.cardTitle}>Family Members</Text>
            </View>
            <Text style={styles.cardText}>
              Manage and view family members.
            </Text>
          </Card.Content>
          <IconButton icon="chevron-right" size={24} color="#fff" style={styles.arrowIcon} />
        </Card>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  card: {
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  blueCard: {
    backgroundColor: "#1662C6",
  },
  brownCard: {
    backgroundColor: "#A07D40",
  },
  greenCard: {
    backgroundColor: "#205C3B",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  cardText: {
    color: "#fff",
    fontSize: 14,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrowIcon: {
    position: "absolute",
    right: 16,
    top: 16,
  },
});

export default DashboardScreen;
