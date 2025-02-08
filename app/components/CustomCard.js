import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Text, Card, IconButton } from "react-native-paper";

const CustomCard = ({ title, description, icon, color, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={[styles.card, { backgroundColor: color }]}>
        <Card.Content>
          <View style={styles.row}>
            <IconButton icon={icon} size={24} color="#fff" />
            <Text style={styles.cardTitle}>{title}</Text>
          </View>
          <Text style={styles.cardText}>{description}</Text>
        </Card.Content>
        <IconButton icon="chevron-right" size={24} color="#fff" style={styles.arrowIcon} />
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
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

export default CustomCard;
