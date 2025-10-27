import { CreateItem, Item, UpdateItem } from "../types/database-types";
import { getDatabase } from "./database";

async function create(itemData: CreateItem): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    "INSERT INTO items (list_id, name, brand, quantity, unit_price) VALUES (?, ?, ?, ?, ?)",
    [
      itemData.list_id,
      itemData.name,
      itemData.brand ?? null,
      itemData.quantity,
      itemData.unit_price,
    ]
  );
  return result.lastInsertRowId;
}

async function getByListId(listId: number): Promise<Item[]> {
  const db = await getDatabase();
  return db.getAllAsync<Item>(
    "SELECT * FROM items WHERE list_id = ? ORDER BY created_at ASC",
    [listId]
  );
}

async function getItemById(id: number): Promise<Item | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Item>("SELECT * FROM items WHERE id = ?", [id]);
}

async function updateItem(id: number, updates: UpdateItem): Promise<boolean> {
  const db = await getDatabase();
  const fields = [];
  const values = [];
  if (updates.name !== undefined) {
    fields.push("name = ?");
    values.push(updates.name);
  }
  if (updates.brand !== undefined) {
    fields.push("brand = ?");
    values.push(updates.brand);
  }
  if (updates.quantity !== undefined) {
    fields.push("quantity = ?");
    values.push(updates.quantity);
  }
  if (updates.unit_price !== undefined) {
    fields.push("unit_price = ?");
    values.push(updates.unit_price);
  }
  if (fields.length === 0) return false;
  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);
  const result = await db.runAsync(
    `UPDATE items SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
  return result.changes > 0;
}

async function deleteItem(id: number): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync("DELETE FROM items WHERE id = ?", [id]);
  return result.changes > 0;
}

async function deleteAllItemsByListId(listId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM items WHERE list_id = ?", [listId]);
}

const itemService = {
  create,
  getItemById,
  getByListId,
  updateItem,
  deleteItem,
  deleteAllItemsByListId,
};

export default itemService;
