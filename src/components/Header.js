import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { colors } from "../styles/globalStyles";
import { BackArrowIcon } from "../assets/icons/icons";

/**
 * Common Header Component
 *
 * @param {Object} props
 * @param {Function} props.onBack - Function to call when back button is pressed
 * @param {React.ReactNode} props.center - Custom center content (title, subtitle, etc.)
 * @param {React.ReactNode} props.right - Custom right content (buttons, icons, etc.)
 * @param {boolean} props.showBack - Whether to show the back button (default: true)
 */
function Header({ onBack, center, right, showBack = true }) {
  return (
    <View style={styles.container}>
      {showBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <BackArrowIcon width={22} height={22} color="white" opacity={0.7} />
        </TouchableOpacity>
      )}
      {!showBack && <View style={styles.backButtonPlaceholder} />}

      <View style={styles.center}>{center}</View>

      <View style={styles.right}>
        {right || <View style={styles.rightPlaceholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: Platform.OS === "ios" ? 54 : 36,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPlaceholder: {
    width: 40,
  },
  center: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 16,
  },
  right: {
    minWidth: 40,
    alignItems: "flex-end",
  },
  rightPlaceholder: {
    width: 40,
  },
});

export default Header;
