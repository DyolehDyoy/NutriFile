import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { Text, Card, ActivityIndicator } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import supabase from "../supabaseClient";

const ViewFamilyMemberScreen = () => {
  const router = useRouter();
  const { memberId } = useLocalSearchParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("addmember")
          .select("*")
          .eq("id", memberId)
          .single();

        if (error) throw error;
        setMember(data);
      } catch (error) {
        Alert.alert("Error", "Failed to load member data.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      fetchMemberDetails();
    }
  }, [memberId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#1662C6" style={styles.loader} />;
  }

  if (!member) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Member not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.header}>{member.firstname} {member.lastname}</Text>
          <Text style={styles.subHeader}>Relationship: <Text style={styles.value}>{member.relationship}</Text></Text>
          <Text style={styles.subHeader}>Sex: <Text style={styles.value}>{member.sex}</Text></Text>
          <Text style={styles.subHeader}>Date of Birth: <Text style={styles.value}>{member.dateofbirth}</Text></Text>
          <Text style={styles.subHeader}>Age: <Text style={styles.value}>{member.age}</Text></Text>
          <Text style={styles.subHeader}>Classification: <Text style={styles.value}>{member.classification}</Text></Text>
          <Text style={styles.subHeader}>Health Risk: <Text style={styles.value}>{member.healthrisk || "None"}</Text></Text>
          <Text style={styles.subHeader}>Weight: <Text style={styles.value}>{member.weight} kg</Text></Text>
          <Text style={styles.subHeader}>Height: <Text style={styles.value}>{member.height} cm</Text></Text>
          <Text style={styles.subHeader}>Educational Level: <Text style={styles.value}>{member.educationallevel}</Text></Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F9F9F9",
  },
  loader: {
    marginTop: 50,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    color: "#e74c3c",
    marginTop: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 3,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1662C6",
    textAlign: "center",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    color: "#444",
  },
  value: {
    fontWeight: "normal",
    color: "#555",
  },
});

export default ViewFamilyMemberScreen;
