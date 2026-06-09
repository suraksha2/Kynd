import pool from "./mysql";
import mysql from 'mysql2/promise';
import {
  ServiceCategory,
  CreateServiceCategoryInput,
  UpdateServiceCategoryInput,
} from "./service-category-types";

interface DbServiceCategoryRow {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const [rows] = await pool.query(
    `SELECT id, name, description, createdAt, updatedAt FROM service_categories`
  );
  return (rows as DbServiceCategoryRow[]).map((row) => ({
    ...row,
    id: row.id.toString(),
  }));
}

export async function getServiceCategoryById(id: string): Promise<ServiceCategory | null> {
  const [rows] = await pool.query(
    `SELECT id, name, description, createdAt, updatedAt FROM service_categories WHERE id = ?`,
    [id]
  );
  const typedRows = rows as DbServiceCategoryRow[];
  if (typedRows.length === 0) return null;
  const row = typedRows[0];
  return {
    ...row,
    id: row.id.toString(),
  };
}

export async function createServiceCategory(input: CreateServiceCategoryInput): Promise<ServiceCategory> {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const [result] = await pool.query<mysql.ResultSetHeader>(
    `INSERT INTO service_categories (name, description, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
    [input.name, input.description, now, now]
  );
  const insertId = result.insertId;
  return {
    id: insertId.toString(),
    name: input.name,
    description: input.description,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateServiceCategory(id: string, input: UpdateServiceCategoryInput): Promise<ServiceCategory | null> {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const [result] = await pool.query<mysql.ResultSetHeader>(
    `UPDATE service_categories SET name = ?, description = ?, updatedAt = ? WHERE id = ?`,
    [input.name, input.description, now, id]
  );
  if (result.affectedRows === 0) return null;
  const [rows] = await pool.query(`SELECT id, name, description, createdAt, updatedAt FROM service_categories WHERE id = ?`, [id]);
  const typedRows = rows as DbServiceCategoryRow[];
  if (typedRows.length === 0) return null;
  const row = typedRows[0];
  return {
    ...row,
    id: row.id.toString(),
  };
}

export async function deleteServiceCategory(id: string): Promise<boolean> {
  const [result] = await pool.query<mysql.ResultSetHeader>(`DELETE FROM service_categories WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}
