import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false, title: "Home" }}
        />
        <Stack.Screen
          name="menu"
          options={{ headerShown: true, title: "Menu" }}
        />
        <Stack.Screen
          name="minhas-listas"
          options={{ headerShown: true, title: "Minhas Listas" }}
        />
        <Stack.Screen
          name="nova-lista"
          options={{ headerShown: true, title: "Nova Lista" }}
        />
        {/* <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        /> */}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
