import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, Card } from "react-native-paper";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const HouseholdMembersScreen = () => {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>HOUSEHOLD NO. 1</Text>

      {/* Family Members List */}
      {["Family Member 1", "Family Member 2", "Family Member 3"].map((member, index) => (
        <TouchableOpacity key={index} onPress={() => alert(`${member} details coming soon`)}>
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <MaterialCommunityIcons name="account" size={24} color="#000" />
              <Text style={styles.cardText}>{member}</Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#205C3B",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2, // For shadow effect
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cardText: {
    fontSize: 16,
    marginLeft: 10,
  },
});

export default HouseholdMembersScreen;
