import pool from "./mysql";
import {
  CityService,
  CreateCityServiceInput,
  UpdateCityServiceInput,
  ServiceStatus,
} from "./types";
import { ResultSetHeader, RowDataPacket } from "mysql2";

interface DbCityServiceRow extends RowDataPacket {
  id: number;
  city_id: number | null;
  service_id: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  name?: string;
  category?: string;
}

function mapCityService(row: DbCityServiceRow): CityService {
  return {
    id: row.id.toString(),
    cityId: row.city_id ? row.city_id.toString() : undefined,
    serviceId: row.service_id ? row.service_id.toString() : undefined,
    status: row.status as ServiceStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    name: row.name,
    category: row.category,
  };
}

export async function getCityServices(): Promise<CityService[]> {
  const [rows] = await pool.query<DbCityServiceRow[]>(
    `SELECT cs.id, cs.city_id, cs.service_id, cs.status, cs.created_at, cs.updated_at,
            s.name, s.category
     FROM city_services cs
     LEFT JOIN services s ON cs.service_id = s.id`
  );

  return rows.map(mapCityService);
}

export async function getCityServiceById(
  id: string
): Promise<CityService | null> {
  const [rows] = await pool.query<DbCityServiceRow[]>(
    `SELECT cs.id, cs.city_id, cs.service_id, cs.status, cs.created_at, cs.updated_at,
            s.name, s.category
     FROM city_services cs
     LEFT JOIN services s ON cs.service_id = s.id
     WHERE cs.id = ?`,
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
    "INSERT INTO city_services (city_id, service_id, status) VALUES (?, ?, ?)",
    [
      input.cityId ? parseInt(input.cityId) : null,
      input.serviceId ? parseInt(input.serviceId) : null,
      input.status,
    ]
  );

  const insertId = result.insertId;
  const [rows] = await pool.query<DbCityServiceRow[]>(
    `SELECT cs.id, cs.city_id, cs.service_id, cs.status, cs.created_at, cs.updated_at,
            s.name, s.category
     FROM city_services cs
     LEFT JOIN services s ON cs.service_id = s.id
     WHERE cs.id = ?`,
    [insertId]
  );

  return mapCityService(rows[0]);
}

export async function updateCityService(
  id: string,
  input: UpdateCityServiceInput
): Promise<CityService | null> {
  const existing = await getCityServiceById(id);
  if (!existing) {
    return null;
  }

  await pool.query(
    "UPDATE city_services SET city_id = ?, service_id = ?, status = ? WHERE id = ?",
    [
      input.cityId ? parseInt(input.cityId) : existing.cityId ? parseInt(existing.cityId) : null,
      input.serviceId ? parseInt(input.serviceId) : existing.serviceId ? parseInt(existing.serviceId) : null,
      input.status ?? existing.status,
      id,
    ]
  );

  const [rows] = await pool.query<DbCityServiceRow[]>(
    `SELECT cs.id, cs.city_id, cs.service_id, cs.status, cs.created_at, cs.updated_at,
            s.name, s.category
     FROM city_services cs
     LEFT JOIN services s ON cs.service_id = s.id
     WHERE cs.id = ?`,
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapCityService(rows[0]);
}

export async function deleteCityService(id: string): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    "DELETE FROM city_services WHERE id = ?",
    [id]
  );

  return result.affectedRows > 0;
}

export async function getCitiesByServiceId(serviceId: string): Promise<CityService[]> {
  const [rows] = await pool.query<DbCityServiceRow[]>(
    `SELECT c.id as city_id, c.serviceCategoryId, s.id as service_id, s.name, s.category
     FROM cities c
     LEFT JOIN services s ON c.serviceCategoryId = s.id
     WHERE c.serviceCategoryId = ?`,
    [serviceId]
  );

  return rows.map((row: any) => ({
    id: row.city_id?.toString() || '',
    cityId: row.city_id?.toString(),
    serviceId: row.service_id?.toString(),
    status: 'Active' as ServiceStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: row.name,
    category: row.category
  }));
}
