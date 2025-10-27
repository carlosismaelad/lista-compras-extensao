import { useLocalSearchParams, useRouter } from "expo-router";
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
} from "../../constants/theme";
import itemService from "../../database/item-service";
import listService from "../../database/list-service";

const ItensListaScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [list, setList] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuItemId, setMenuItemId] = useState<number | null>(null); // id do item com menu aberto
  const [editMode, setEditMode] = useState(false); // se está editando
  // const [editItemId, setEditItemId] = useState<number | null>(null); // id do item em edição (não utilizado)
  // Atualiza o total da lista recalculando a soma dos itens
  const refreshList = async () => {
    if (id) {
      // Busca todos os itens da lista
      const itens = await itemService.getByListId(Number(id));
      // Soma o total
      const total = itens.reduce(
        (acc: number, item: any) =>
          acc + Number(item.quantity) * Number(item.unit_price),
        0
      );
      // Atualiza o campo total_value da lista no banco
      await listService.updateList(Number(id), { total_value: total });
      // Busca a lista atualizada
      const listaAtualizada = await listService.getListById(Number(id));
      setList(listaAtualizada);
    }
  };

  const resetModal = () => {
    setNome("");
    setMarca("");
    setQuantidade("1");
    setValor("");
  };

  const handleAddItem = async () => {
    if (!nome.trim()) {
      alert("Informe o nome do item.");
      return;
    }
    if (!quantidade || isNaN(Number(quantidade)) || Number(quantidade) <= 0) {
      alert("Quantidade inválida.");
      return;
    }
    if (!valor || isNaN(Number(valor)) || Number(valor) < 0) {
      alert("Valor inválido.");
      return;
    }
    setLoading(true);
    try {
      if (editMode && menuItemId) {
        // Atualizar item existente
        await itemService.updateItem(menuItemId, {
          name: nome,
          brand: marca,
          quantity: Number(quantidade),
          unit_price: Number(valor),
        });
      } else {
        // Adicionar novo item
        await itemService.create({
          name: nome,
          brand: marca,
          quantity: Number(quantidade),
          unit_price: Number(valor),
          list_id: Number(id),
        });
      }
      const novosItens = await itemService.getByListId(Number(id));
      setItems(novosItens);
      refreshList();
      setModalVisible(false);
      resetModal();
      setEditMode(false);
      setMenuItemId(null);
    } catch (error) {
      alert("Erro ao salvar item.");
    } finally {
      setLoading(false);
    }
  };
  const router = useRouter();

  useEffect(() => {
    if (id) {
      itemService.getByListId(Number(id)).then(setItems);
      refreshList();
    }
  }, [id]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{list?.name || "Lista"}</Text>
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalValue}>
          R${" "}
          {Number(list?.total_value || 0).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const valorTotal = Number(item.quantity) * Number(item.unit_price);
          return (
            <View style={styles.itemRow}>
              <View
                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
              >
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemQtd}>Qtd: {item.quantity}</Text>
                  <Text style={styles.itemValorTotal}>
                    R${" "}
                    {valorTotal.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              </View>
              <View style={{ position: "relative", zIndex: 30, marginLeft: 4 }}>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() =>
                    setMenuItemId(menuItemId === item.id ? null : item.id)
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.menuButtonText}>⋮</Text>
                </TouchableOpacity>
                {menuItemId === item.id && (
                  <View style={styles.menuOptions}>
                    <TouchableOpacity
                      style={styles.menuOption}
                      onPress={async () => {
                        setMenuItemId(null);
                        setEditMode(true);
                        // setEditItemId(item.id); // não utilizado
                        setNome(item.name);
                        setMarca(item.brand || "");
                        setQuantidade(String(item.quantity));
                        setValor(String(item.unit_price));
                        setModalVisible(true);
                      }}
                    >
                      <Text style={styles.menuOptionText}>✏️ Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuOption}
                      onPress={() => {
                        setMenuItemId(null);
                        Alert.alert(
                          "Excluir item",
                          "Tem certeza que deseja remover este item?",
                          [
                            { text: "Cancelar", style: "cancel" },
                            {
                              text: "Excluir",
                              style: "destructive",
                              onPress: async () => {
                                await itemService.deleteItem(item.id);
                                const novosItens =
                                  await itemService.getByListId(Number(id));
                                setItems(novosItens);
                                refreshList();
                              },
                            },
                          ]
                        );
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
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum item adicionado.</Text>
        }
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setModalVisible(true);
          setEditMode(false);
          // setEditItemId(null); // não utilizado
          resetModal();
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Modal de adicionar/editar item */}
      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editMode ? "Editar Item" : "Adicionar Item"}
            </Text>
            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do item"
              value={nome}
              onChangeText={setNome}
              editable={!loading}
              autoFocus
            />
            <Text style={styles.label}>Marca</Text>
            <TextInput
              style={styles.input}
              placeholder="Marca (opcional)"
              value={marca}
              onChangeText={setMarca}
              editable={!loading}
            />
            <Text style={styles.label}>Quantidade *</Text>
            <TextInput
              style={styles.input}
              placeholder="Quantidade"
              value={quantidade}
              onChangeText={setQuantidade}
              keyboardType="numeric"
              editable={!loading}
            />
            <Text style={styles.label}>Valor unitário *</Text>
            <TextInput
              style={styles.input}
              placeholder="Valor unitário"
              value={valor}
              onChangeText={setValor}
              keyboardType="numeric"
              editable={!loading}
            />
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancel]}
                onPress={() => {
                  setModalVisible(false);
                  resetModal();
                  setEditMode(false);
                  // setEditItemId(null); // não utilizado
                }}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirm]}
                onPress={handleAddItem}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading
                    ? editMode
                      ? "Salvando..."
                      : "Adicionando..."
                    : editMode
                    ? "Salvar"
                    : "Adicionar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginTop: Spacing.sm,
    marginBottom: 2,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: AppColors.gray300,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    marginBottom: Spacing.sm,
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
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: AppColors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  itemName: {
    fontSize: FontSizes.md,
    color: AppColors.textPrimary,
    flex: 1,
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  itemBrand: {
    fontSize: FontSizes.sm,
    color: AppColors.textSecondary,
    marginTop: -2,
    marginBottom: 2,
  },
  itemQtd: {
    fontSize: FontSizes.sm,
    color: AppColors.textSecondary,
    marginRight: Spacing.sm,
  },
  itemValorTotal: {
    fontSize: FontSizes.sm,
    color: AppColors.textPrimary,
    fontWeight: "bold",
    minWidth: 80,
    textAlign: "right",
  },
  empty: {
    color: AppColors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xl,
  },
  addButton: {
    position: "absolute",
    right: Spacing.lg,
    bottom: Spacing.lg,
    backgroundColor: AppColors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.colored(AppColors.primary),
  },
  addButtonText: {
    color: AppColors.surface,
    fontSize: 32,
    fontWeight: "bold",
  },
  totalContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  totalLabel: {
    fontSize: FontSizes.md,
    color: AppColors.textSecondary,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: FontSizes.lg,
    color: AppColors.textPrimary,
    fontWeight: "bold",
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
    elevation: 4,
    zIndex: 20,
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
});

export default ItensListaScreen;
