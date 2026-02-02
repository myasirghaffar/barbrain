import React from "react";
import { View, Text, StyleSheet, TextInput, Switch } from "react-native";
import { colors } from "../styles/globalStyles";

function ScoreInput({
  value,
  onChangeValue,
  doubleOutEnabled,
  finishedOnDouble,
  onToggleFinishedOnDouble,
  error,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Score (0–180)</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={value}
        onChangeText={onChangeValue}
        placeholder="e.g. 60"
        placeholderTextColor={colors.textMuted}
      />
      {doubleOutEnabled && (
        <View style={styles.doubleRow}>
          <Text style={styles.doubleLabel}>Checkout on double?</Text>
          <Switch
            value={finishedOnDouble}
            onValueChange={onToggleFinishedOnDouble}
            thumbColor={finishedOnDouble ? colors.success : "#ccc"}
          />
        </View>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 18,
  },
  doubleRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  doubleLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  error: {
    marginTop: 8,
    color: colors.danger,
    fontSize: 13,
  },
});

export default ScoreInput;
