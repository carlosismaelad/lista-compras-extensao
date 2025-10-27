import { useRouter, type RelativePathString } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  AppColors,
  BorderRadius,
  FontSizes,
  Shadows,
  Spacing,
} from "../constants/theme";
import { initializeDatabase } from "../database/database";

export default function HomeScreen() {
  const router = useRouter();
  useEffect(() => {
    initializeDatabase();
  }, []);

  const handleStartNow = () => {
    router.push({ pathname: "menu" as RelativePathString });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>
          Lista<Text style={styles.titleAccent}> De Compras</Text>
        </Text>

        <Text style={styles.subtitle}>
          Sua aplicação de gerenciamento de compras
        </Text>

        <View style={styles.featuresGrid}>
          <View style={[styles.featureCard, styles.featureCard1]}>
            <View style={styles.featureHeader}>
              <Text style={styles.featureTitle}>Organize</Text>
              <Text style={styles.featureIcon}>📝</Text>
            </View>
            <Text style={styles.featureDescription}>
              Mantenha suas compras organizadas
            </Text>
          </View>

          <View style={[styles.featureCard, styles.featureCard2]}>
            <View style={styles.featureHeader}>
              <Text style={styles.featureTitle}>Complete</Text>
              <Text style={styles.featureIcon}>✅</Text>
            </View>
            <Text style={styles.featureDescription}>
              Marque suas compras como concluídas
            </Text>
          </View>

          <View style={[styles.featureCard, styles.featureCard3]}>
            <View style={styles.featureHeader}>
              <Text style={styles.featureTitle}>Foque</Text>
              <Text style={styles.featureIcon}>🎯</Text>
            </View>
            <Text style={styles.featureDescription}>
              Sem se esquecer do que precisa
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={handleStartNow}>
          <Text style={styles.startButtonText}>Começar Agora</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: "center",
    width: "100%",
  },
  titleAccent: {
    color: AppColors.primary,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: AppColors.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: "center",
    lineHeight: 24,
    width: "100%",
  },
  featuresGrid: {
    width: "100%",
    maxWidth: 400,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  featureCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  featureCard1: {
    backgroundColor: AppColors.feature1,
  },
  featureCard2: {
    backgroundColor: AppColors.feature2,
  },
  featureCard3: {
    backgroundColor: AppColors.feature3,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureTitle: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: AppColors.textPrimary,
  },
  featureDescription: {
    fontSize: FontSizes.sm,
    color: AppColors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    ...Shadows.colored(AppColors.primary),
  },
  startButtonText: {
    color: AppColors.surface,
    fontSize: FontSizes.lg,
    fontWeight: "600",
    textAlign: "center",
  },
});
