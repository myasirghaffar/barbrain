import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../styles/globalStyles";
import Logo from "../components/Logo";

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo width={120} height={120} />
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>The Oche</Text>
        <Text style={styles.subtitle}>Darts Scoring Made Simple</Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate("PlayerSelection")}
      >
        <Text style={styles.primaryButtonText}>New Game </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    marginBottom: 32,
  },
  header: {
    marginBottom: 48,
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  primaryButton: {
    backgroundColor: "#009966",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    minWidth: "100%",
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default HomeScreen;
