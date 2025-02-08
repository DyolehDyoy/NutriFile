import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";

export default function Layout() {
  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: true }}>
        {/* Home/Dashboard Screen */}
        <Stack.Screen name="dashboard/index" options={{ title: "Dashboard" }} />

        {/* New Household Form Screen */}
        <Stack.Screen name="newHouseholdForm/index" options={{ title: "New Household Form" }} />
      </Stack>
    </PaperProvider>
  );
}
