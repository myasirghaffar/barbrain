import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../styles/globalStyles";

function UndoButton({ disabled, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>Undo Last Turn</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.warning,
    alignItems: "center",
    marginTop: 8,
  },
  text: {
    color: colors.warning,
    fontWeight: "bold",
    fontSize: 14,
  },
  disabled: {
    opacity: 0.4,
  },
});

export default UndoButton;
