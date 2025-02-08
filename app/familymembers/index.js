import React from "react";
import { View, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const FamilyMembersScreen = () => {
  const router = useRouter();

  // Dummy data for households
  const households = [
    { id: "1", name: "Household No. 1" },
    { id: "2", name: "Household No. 2" },
    { id: "3", name: "Household No. 3" },
    { id: "4", name: "Household No. 4" },
  ];

  return (
    <View style={styles.container}>
      {/* Header Icon */}
      <MaterialCommunityIcons name="account-group" size={50} color="white" style={styles.icon} />

      {/* List of Households */}
      <FlatList
        data={households}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/household/${item.id}`)} // Navigate to household members screen
          >
            <Text style={styles.cardText}>{item.name}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="black" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#205C3B", padding: 16, alignItems: "center" },
  icon: { marginBottom: 20 },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    marginBottom: 10,
  },
  cardText: { fontSize: 16, fontWeight: "bold" },
});

export default FamilyMembersScreen;
