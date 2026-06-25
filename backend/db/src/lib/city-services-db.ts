import pool from "./mysql";
import {
  CityService,
  CreateCityServiceInput,
  UpdateCityServiceInput,
  ServiceCategory,
  ServiceStatus,
} from "./types";
import { ResultSetHeader, RowDataPacket } from "mysql2";

interface DbCityServiceRow extends RowDataPacket {
  id: number;
  city_id: number;
  name: string;
  category: string;
  description: string;
  status: string;
  provider: string;
  contact_email: string;
  contact_phone: string;
  budget: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

function mapCityService(row: DbCityServiceRow): CityService {
  return {
    id: row.id.toString(),
    cityId: row.city_id.toString(),
    name: row.name,
    category: row.category as ServiceCategory,
    description: row.description,
    status: row.status as ServiceStatus,
    provider: row.provider,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    budget: Number(row.budget),
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCityServices(): Promise<CityService[]> {
  const [rows] = await pool.query<DbCityServiceRow[]>(
    `SELECT id, city_id, name, category, description, status,
            provider, contact_email, contact_phone, budget,
            start_date, end_date, created_at, updated_at
     FROM city_services
     ORDER BY created_at DESC`
  );

  return rows.map(mapCityService);
}

export async function getCityServiceById(
  id: string
): Promise<CityService | null> {
  const [rows] = await pool.query<DbCityServiceRow[]>(
    `SELECT id, city_id, name, category, description, status,
            provider, contact_email, contact_phone, budget,
            start_date, end_date, created_at, updated_at
     FROM city_services
     WHERE id = ?`,
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapCityService(rows[0]);
}

export async function createCityService(
  input: CreateCityServiceInput
): Promise<CityService> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO city_services (
      city_id, name, category, description, status,
      provider, contact_email, contact_phone, budget,
      start_date, end_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      parseInt(input.cityId),
      input.name,
      input.category,
      input.description,
      input.status,
      input.provider,
      input.contactEmail,
      input.contactPhone,
      input.budget,
      input.startDate,
      input.endDate,
    ]
  );

  const created = await getCityServiceById(result.insertId.toString());
  if (!created) {
    throw new Error("Failed to fetch created city service.");
  }
  return created;
}

export async function updateCityService(
  id: string,
  input: UpdateCityServiceInput
): Promise<CityService | null> {
  const existing = await getCityServiceById(id);
  if (!existing) {
    return null;
  }

  const cityId = input.cityId ?? existing.cityId;
  const name = input.name ?? existing.name;
  const category = input.category ?? existing.category;
  const description = input.description ?? existing.description;
  const status = input.status ?? existing.status;
  const provider = input.provider ?? existing.provider;
  const contactEmail = input.contactEmail ?? existing.contactEmail;
  const contactPhone = input.contactPhone ?? existing.contactPhone;
  const budget = input.budget ?? existing.budget;
  const startDate = input.startDate ?? existing.startDate;
  const endDate = input.endDate !== undefined ? input.endDate : existing.endDate;

  await pool.query(
    `UPDATE city_services SET
      city_id = ?, name = ?, category = ?, description = ?, status = ?,
      provider = ?, contact_email = ?, contact_phone = ?, budget = ?,
      start_date = ?, end_date = ?
     WHERE id = ?`,
    [
      parseInt(cityId),
      name,
      category,
      description,
      status,
      provider,
      contactEmail,
      contactPhone,
      budget,
      startDate,
      endDate,
      id,
    ]
  );

  return getCityServiceById(id);
}

export async function deleteCityService(id: string): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    "DELETE FROM city_services WHERE id = ?",
    [id]
  );

  return result.affectedRows > 0;
}

export async function getCitiesByServiceName(serviceName: string): Promise<CityService[]> {
  const [rows] = await pool.query<DbCityServiceRow[]>(
    `SELECT id, city_id, name, category, description, status,
            provider, contact_email, contact_phone, budget,
            start_date, end_date, created_at, updated_at
     FROM city_services
     WHERE name = ?
     ORDER BY created_at DESC`,
    [serviceName]
  );

  return rows.map(mapCityService);
}
