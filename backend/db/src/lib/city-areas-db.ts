import pool from "./mysql";
import { CityArea, CreateCityAreaInput, UpdateCityAreaInput } from "./types";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface DbCityAreaRow {
  id: number;
  city_id: number;
  area_name: string;
  pincode: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export async function getCityAreas(cityId?: string): Promise<CityArea[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    cityId
      ? "SELECT id, city_id, area_name, pincode, status, created_at, updated_at FROM city_areas WHERE city_id = ? ORDER BY area_name"
      : "SELECT id, city_id, area_name, pincode, status, created_at, updated_at FROM city_areas ORDER BY city_id, area_name",
    cityId ? [cityId] : []
  );

  return (rows as DbCityAreaRow[]).map((row) => ({
    id: row.id.toString(),
    cityId: row.city_id.toString(),
    areaName: row.area_name,
    pincode: row.pincode || undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getCityAreaById(id: string): Promise<CityArea | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, city_id, area_name, pincode, status, created_at, updated_at FROM city_areas WHERE id = ?",
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  const row = (rows as DbCityAreaRow[])[0];
  return {
    id: row.id.toString(),
    cityId: row.city_id.toString(),
    areaName: row.area_name,
    pincode: row.pincode || undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createCityArea(
  input: CreateCityAreaInput
): Promise<CityArea> {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO city_areas (city_id, area_name, pincode, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    [input.cityId, input.areaName, input.pincode ?? null, input.status, now, now]
  );

  const insertId = result.insertId;
  return {
    id: insertId.toString(),
    cityId: input.cityId,
    areaName: input.areaName,
    pincode: input.pincode,
    status: input.status,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateCityArea(
  id: string,
  input: UpdateCityAreaInput
): Promise<CityArea | null> {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE city_areas SET area_name = ?, pincode = ?, status = ?, updated_at = ? WHERE id = ?",
    [input.areaName, input.pincode ?? null, input.status, now, id]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, city_id, area_name, pincode, status, created_at, updated_at FROM city_areas WHERE id = ?",
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  const row = (rows as DbCityAreaRow[])[0];
  return {
    id: row.id.toString(),
    cityId: row.city_id.toString(),
    areaName: row.area_name,
    pincode: row.pincode || undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function deleteCityArea(id: string): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>("DELETE FROM city_areas WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
