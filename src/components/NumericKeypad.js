import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../styles/globalStyles";

function NumericKeypad({ onNumberPress, onBackspace, onSubmit, canSubmit }) {
  const numbers = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  return (
    <View style={styles.container}>
      {numbers.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.key}
              onPress={() => onNumberPress(num)}
            >
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      <View style={styles.row}>
        <TouchableOpacity style={styles.key} onPress={onBackspace}>
          <Svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.textPrimary}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <Path d="M18 9l-6 6" />
            <Path d="M12 9l6 6" />
          </Svg>
        </TouchableOpacity>
        <TouchableOpacity style={styles.key} onPress={() => onNumberPress(0)}>
          <Text style={styles.keyText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.key,
            styles.submitKey,
            canSubmit && styles.submitKeyActive,
          ]}
          onPress={onSubmit}
          disabled={!canSubmit}
        >
          <Svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={canSubmit ? colors.textSecondary : colors.textMuted}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M20 6L9 17l-5-5" />
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    width: "100%",
    maxWidth: 360,
  },
  row: {
    flexDirection: "row",
    gap: 15,
    justifyContent: "center",
  },
  key: {
    flex: 1,
    aspectRatio: 2.6,
    borderRadius: 10,
    backgroundColor: colors.keypadBg,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  keyText: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  submitKey: {
    backgroundColor: colors.keypadBg,
  },
  submitKeyActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
    borderWidth: 0,
  },
});

export default NumericKeypad;
