import {
  CreateList,
  List,
  ListWithItems,
  UpdateList,
} from "../types/database-types";
import { getDatabase } from "./database";

async function createList(listData: CreateList): Promise<number> {
  const db = await getDatabase();

  const result = await db.runAsync("INSERT INTO lists (name) VALUES (?)", [
    listData.name,
  ]);

  return result.lastInsertRowId;
}

// Buscar todas as listas
async function getAll(): Promise<List[]> {
  const db = await getDatabase();

  const lists = await db.getAllAsync<List>(
    "SELECT * FROM lists ORDER BY created_at DESC"
  );

  return lists;
}

async function getListById(id: number): Promise<List | null> {
  const db = await getDatabase();

  const list = await db.getFirstAsync<List>(
    "SELECT * FROM lists WHERE id = ?",
    [id]
  );

  return list;
}

async function getListWithItems(id: number): Promise<ListWithItems | null> {
  const db = await getDatabase();

  // Buscar a lista
  const list = await db.getFirstAsync<List>(
    "SELECT * FROM lists WHERE id = ?",
    [id]
  );

  if (!list) return null;

  const items = await db.getAllAsync(
    "SELECT * FROM items WHERE list_id = ? ORDER BY created_at ASC",
    [id]
  );

  return {
    ...list,
    items: items || [],
  } as ListWithItems;
}

async function updateList(id: number, updates: UpdateList): Promise<boolean> {
  const db = await getDatabase();

  const fields = [];
  const values = [];

  if (updates.name !== undefined) {
    fields.push("name = ?");
    values.push(updates.name);
  }

  if (updates.total_value !== undefined) {
    fields.push("total_value = ?");
    values.push(updates.total_value);
  }

  if (fields.length === 0) return false;

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);

  const result = await db.runAsync(
    `UPDATE lists SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return result.changes > 0;
}

async function deleteList(id: number): Promise<boolean> {
  const db = await getDatabase();

  const result = await db.runAsync("DELETE FROM lists WHERE id = ?", [id]);

  return result.changes > 0;
}

async function updateTotalValue(listId: number): Promise<void> {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{ total: number }>(
    "SELECT SUM(quantity * unit_price) as total FROM items WHERE list_id = ?",
    [listId]
  );

  const totalValue = result?.total || 0;

  await updateList(listId, { total_value: totalValue });
}

const listService = {
  createList,
  getListById,
  getAll,
  getListWithItems,
  updateList,
  deleteList,
  updateTotalValue,
};

export default listService;
