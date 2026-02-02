import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  StatusBar,
  Text,
  StyleSheet,
} from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "./styles/globalStyles";
import { loadGame } from "./storage/localGameStore";
import HomeScreen from "./screens/HomeScreen";
import PlayerSelectionScreen from "./screens/PlayerSelectionScreen";
import GameSetupScreen from "./screens/GameSetupScreen";
import GameScreen from "./screens/GameScreen";
import GameSummaryScreen from "./screens/GameSummaryScreen";
import Header from "./components/Header";

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    primary: colors.primary,
    text: colors.textPrimary,
    card: colors.statusBar,
    border: colors.borderSoft,
  },
};

function App() {
  const [initialRoute, setInitialRoute] = useState("Home");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const saved = await loadGame();
        if (saved && saved.status === "inProgress") {
          setInitialRoute("Game");
        } else if (saved && saved.status === "finished") {
          setInitialRoute("GameSummary");
        } else {
          setInitialRoute("Home");
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  if (loading) {
    return (
      <>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.statusBar}
          translucent={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading The Oche...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.statusBar}
        translucent={false}
      />
      <View style={styles.app}>
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerStyle: {
                backgroundColor: colors.statusBar,
                elevation: 0,
                borderBottomWidth: 0,
              },
              headerShadowVisible: false,
              headerTintColor: colors.textPrimary,
              headerTitleStyle: { fontWeight: "bold" },
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: "The Oche",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="PlayerSelection"
              component={PlayerSelectionScreen}
              options={({ navigation }) => ({
                header: () => (
                  <Header
                    onBack={() => navigation.goBack()}
                    center={<Text style={styles.headerTitle}>The Oche</Text>}
                    showBack={true}
                  />
                ),
              })}
            />
            <Stack.Screen
              name="GameSetup"
              component={GameSetupScreen}
              options={({ navigation }) => ({
                header: () => (
                  <Header
                    onBack={() => navigation.goBack()}
                    center={<Text style={styles.headerTitle}>Game Setup</Text>}
                    showBack={true}
                  />
                ),
              })}
            />
            <Stack.Screen
              name="Game"
              component={GameScreen}
              options={{ title: "" }}
            />
            <Stack.Screen
              name="GameSummary"
              component={GameSummaryScreen}
              options={({ navigation }) => ({
                header: () => (
                  <Header
                    onBack={() => navigation.goBack()}
                    center={
                      <Text style={styles.headerTitle}>Game Summary</Text>
                    }
                    showBack={true}
                  />
                ),
                gestureEnabled: false,
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
});

export default App;
