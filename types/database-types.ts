export interface List {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  total_value: number;
}

export interface Item {
  id: number;
  list_id: number;
  name: string;
  brand?: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  updated_at: string;
}

export interface CreateList {
  name: string;
}

export interface CreateItem {
  list_id: number;
  name: string;
  brand?: string;
  quantity: number;
  unit_price: number;
}

export interface UpdateList {
  name?: string;
  total_value?: number;
}

export interface UpdateItem {
  name?: string;
  brand?: string;
  quantity?: number;
  unit_price?: number;
}

export interface ListWithItems extends List {
  items: Item[];
}
