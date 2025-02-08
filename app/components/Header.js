import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, IconButton } from "react-native-paper";
import { useRouter } from "expo-router"; // ✅ Use expo-router for navigation

const Header = ({ title }) => {
  const router = useRouter(); // ✅ Correctly define the router

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.icon}>
        <IconButton icon="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Logout Button */}
      <TouchableOpacity onPress={() => router.push("/logout")} style={styles.icon}>
        <IconButton icon="logout" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  icon: {
    padding: 5,
  },
});

export default Header; // ✅ Ensure this is a default export
