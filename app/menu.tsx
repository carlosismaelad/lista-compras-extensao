import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import {
  AppColors,
  BorderRadius,
  FontSizes,
  Shadows,
  Spacing,
} from "../constants/theme";

interface MenuScreenProps {
  navigation?: any;
}

import { useRouter, type RelativePathString } from "expo-router";

const MenuScreen: React.FC = () => {
  const router = useRouter();
  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({ pathname: "minhas-listas" as RelativePathString })
        }
      >
        <ThemedText type="defaultSemiBold" style={styles.buttonText}>
          Minhas Listas
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({ pathname: "nova-lista" as RelativePathString })
        }
      >
        <ThemedText type="defaultSemiBold" style={styles.buttonText}>
          Nova Lista
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.background,
    gap: Spacing.lg,
  },
  button: {
    backgroundColor: AppColors.primary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.sm,
    width: 220,
    alignItems: "center",
    ...Shadows.colored(AppColors.primary),
  },
  buttonText: {
    color: AppColors.surface,
    fontSize: FontSizes.lg,
    fontWeight: "600",
  },
});

export default MenuScreen;
