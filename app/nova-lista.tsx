import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  AppColors,
  BorderRadius,
  FontSizes,
  Spacing,
} from "../constants/theme";
import listService from "../database/list-service";

const NovaListaScreen = () => {
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCriarLista = async () => {
    if (!nome.trim()) {
      alert("Informe o nome da lista.");
      return;
    }
    setLoading(true);
    try {
      const id = await listService.createList({ name: nome });
      setNome("");
      router.replace(`/itens-lista/${id}`);
    } catch (e) {
      alert("Erro ao criar lista.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Nova Lista</Text>
        <Text style={styles.label}>Nome da lista *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Supermercado, Farmácia..."
          value={nome}
          onChangeText={setNome}
          editable={!loading}
          autoFocus
        />
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleCriarLista}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Salvando..." : "Criar lista"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.background,
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    marginBottom: Spacing.xl,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: FontSizes.sm,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  input: {
    width: 280,
    borderWidth: 1,
    borderColor: AppColors.gray300,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    marginBottom: Spacing.lg,
    color: AppColors.textPrimary,
    backgroundColor: AppColors.gray100,
  },
  button: {
    backgroundColor: AppColors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  buttonText: {
    color: AppColors.surface,
    fontSize: FontSizes.md,
    fontWeight: "600",
  },
});

export default NovaListaScreen;
