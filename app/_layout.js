import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { useEffect } from "react";
import { createTables } from "./database"; // ✅ Adjust this path

export default function Layout() {
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log("🔧 Initializing local database...");
        await createTables();
        console.log("✅ Local tables ensured.");
      } catch (error) {
        console.error("❌ Failed to create local tables:", error);
      }
    };

    initializeDatabase();
  }, []);

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Home/Dashboard Screen */}
        <Stack.Screen name="dashboard/index" options={{ title: "Dashboard" }} />

        {/* New Household Form Screen */}
        <Stack.Screen name="newHouseholdForm/index" options={{ title: "New Household Form" }} />
      </Stack>
    </PaperProvider>
  );
}
