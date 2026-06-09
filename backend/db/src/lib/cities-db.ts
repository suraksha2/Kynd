import pool from "./mysql";
import { CityRecord, CreateCityInput, UpdateCityInput } from "./types";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface DbCityRow {
  id: number;
  cityName: string;
  pinCode: string;
  serviceCategoryId: number | null;
  createdAt: string;
  updatedAt: string;
}

export async function getCities(): Promise<CityRecord[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, cityName, pinCode, serviceCategoryId, createdAt, updatedAt FROM cities"
  );

  return (rows as DbCityRow[]).map((row) => ({
    ...row,
    id: row.id.toString(),
    serviceCategoryId: row.serviceCategoryId?.toString(),
  }));
}

export async function getCityById(id: string): Promise<CityRecord | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, cityName, pinCode, serviceCategoryId, createdAt, updatedAt FROM cities WHERE id = ?",
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  const row = (rows as DbCityRow[])[0];
  return {
    ...row,
    id: row.id.toString(),
    serviceCategoryId: row.serviceCategoryId?.toString(),
  };
}

export async function createCity(
  input: CreateCityInput
): Promise<CityRecord> {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO cities (cityName, pinCode, serviceCategoryId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
    [input.cityName, input.pinCode, input.serviceCategoryId ?? null, now, now]
  );

  const insertId = result.insertId;
  return {
    id: insertId.toString(),
    cityName: input.cityName,
    pinCode: input.pinCode,
    serviceCategoryId: input.serviceCategoryId,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateCity(
  id: string,
  input: UpdateCityInput
): Promise<CityRecord | null> {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE cities SET cityName = ?, pinCode = ?, serviceCategoryId = ?, updatedAt = ? WHERE id = ?",
    [input.cityName, input.pinCode, input.serviceCategoryId ?? null, now, id]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, cityName, pinCode, serviceCategoryId, createdAt, updatedAt FROM cities WHERE id = ?",
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  const row = (rows as DbCityRow[])[0];
  return {
    ...row,
    id: row.id.toString(),
    serviceCategoryId: row.serviceCategoryId?.toString(),
  };
}

export async function deleteCity(id: string): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>("DELETE FROM cities WHERE id = ?", [id]);
  return result.affectedRows > 0;
}