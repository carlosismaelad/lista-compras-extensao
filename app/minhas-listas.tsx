import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
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
  Shadows,
  Spacing,
} from "../constants/theme";
import listService from "../database/list-service";

const MinhasListasScreen = () => {
  const [listas, setListas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuListId, setMenuListId] = useState<number | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editNome, setEditNome] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const router = useRouter();

  // Busca listas e atualiza o total de cada uma somando os itens
  const fetchListas = async () => {
    setLoading(true);
    const res = await listService.getAll();
    // Para cada lista, buscar os itens e somar o total
    const listasComTotal = await Promise.all(
      res.map(async (lista: any) => {
        const itens = await listService.getListWithItems(lista.id);
        const total = (itens?.items || []).reduce(
          (acc: number, item: any) =>
            acc + Number(item.quantity) * Number(item.unit_price),
          0
        );
        return { ...lista, total_value: total };
      })
    );
    setListas(listasComTotal);
    setLoading(false);
  };

  useEffect(() => {
    fetchListas();
  }, []);

  const handleEditList = async () => {
    if (!editNome.trim() || !editId) return;
    await listService.updateList(editId, { name: editNome });
    setEditModalVisible(false);
    setEditId(null);
    setEditNome("");
    fetchListas();
  };

  const handleDeleteList = (id: number) => {
    Alert.alert(
      "Excluir lista",
      "Tem certeza que deseja remover esta lista? Todos os itens serão apagados.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await listService.deleteList(id);
            fetchListas();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Listas</Text>
      <FlatList
        data={listas}
        keyExtractor={(item) => String(item.id)}
        refreshing={loading}
        onRefresh={fetchListas}
        onScrollBeginDrag={() => setMenuListId(null)}
        renderItem={({ item }) => (
          <View style={styles.listItemRow}>
            <View
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => router.push(`/itens-lista/${item.id}`)}
                activeOpacity={0.8}
              >
                <Text style={styles.listName}>{item.name}</Text>
                <Text style={styles.listDate}>
                  {new Date(item.created_at).toLocaleDateString("pt-BR")}
                </Text>
                <Text style={styles.listTotal}>
                  Total: R${" "}
                  {Number(item.total_value || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ position: "relative", zIndex: 30, marginLeft: 4 }}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() =>
                  setMenuListId(menuListId === item.id ? null : item.id)
                }
                activeOpacity={0.7}
              >
                <Text style={styles.menuButtonText}>⋮</Text>
              </TouchableOpacity>
              {menuListId === item.id && (
                <View style={styles.menuOptions}>
                  <TouchableOpacity
                    style={styles.menuOption}
                    onPress={() => {
                      setMenuListId(null);
                      setEditModalVisible(true);
                      setEditId(item.id);
                      setEditNome(item.name);
                    }}
                  >
                    <Text style={styles.menuOptionText}>✏️ Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.menuOption}
                    onPress={() => {
                      setMenuListId(null);
                      handleDeleteList(item.id);
                    }}
                  >
                    <Text style={[styles.menuOptionText, { color: "red" }]}>
                      🗑️ Excluir
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhuma lista encontrada.</Text>
        }
      />

      {/* Modal de edição de lista */}
      {editModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Lista</Text>
            <Text style={styles.label}>Nome da lista *</Text>
            <TextInput
              style={styles.input}
              value={editNome}
              onChangeText={setEditNome}
              autoFocus
            />
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancel]}
                onPress={() => {
                  setEditModalVisible(false);
                  setEditId(null);
                  setEditNome("");
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirm]}
                onPress={handleEditList}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  listItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  listItem: {
    flex: 1,
    backgroundColor: AppColors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  listName: {
    fontSize: FontSizes.lg,
    fontWeight: "bold",
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  listDate: {
    fontSize: FontSizes.sm,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  listTotal: {
    fontSize: FontSizes.md,
    color: AppColors.primary,
    fontWeight: "600",
  },
  menuButton: {
    marginLeft: Spacing.sm,
    padding: 4,
    borderRadius: 16,
  },
  menuButtonText: {
    fontSize: 20,
    color: AppColors.gray500,
  },
  menuOptions: {
    position: "absolute",
    top: 36,
    right: 0,
    backgroundColor: AppColors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: 4,
    paddingHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 100,
    minWidth: 120,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  menuOptionText: {
    fontSize: FontSizes.md,
    color: AppColors.textPrimary,
    marginLeft: 4,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: AppColors.overlay,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  modalContent: {
    backgroundColor: AppColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: 320,
    alignItems: "center",
    ...Shadows.md,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "bold",
    marginBottom: Spacing.lg,
    color: AppColors.textPrimary,
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
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
    justifyContent: "space-between",
    marginTop: Spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  cancel: {
    backgroundColor: AppColors.gray300,
    marginRight: Spacing.sm,
  },
  confirm: {
    backgroundColor: AppColors.primary,
    marginLeft: Spacing.sm,
  },
  buttonText: {
    color: AppColors.surface,
    fontSize: FontSizes.md,
    fontWeight: "600",
  },
  empty: {
    color: AppColors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xl,
  },
});

export default MinhasListasScreen;
