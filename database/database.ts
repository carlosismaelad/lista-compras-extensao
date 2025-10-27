import * as SQLite from "expo-sqlite";
import { runMigrations } from "./migrations";

const DATABASE_NAME = "shopping_lists.db";

let db: SQLite.SQLiteDatabase;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return db;
};

export const initializeDatabase = async (): Promise<void> => {
  try {
    await runMigrations();
  } catch (error) {
    console.error("Erro ao inicializar banco:", error);
    throw error;
  }
};

export const resetDatabase = async (): Promise<void> => {
  try {
    const database = await getDatabase();

    await database.execAsync("DROP TABLE IF EXISTS items;");
    await database.execAsync("DROP TABLE IF EXISTS lists;");

    await runMigrations();
  } catch (error) {
    console.error("Erro ao resetar banco:", error);
    throw error;
  }
};
