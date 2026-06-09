import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, status, joined) VALUES (?, ?, ?, ?, ?, CURDATE())',
      [name.trim(), normalizedEmail, passwordHash, 'user', 'active']
    );

    const insertResult = result as any;
    const userId = insertResult.insertId;

    // Return user data without password
    return NextResponse.json(
      {
        id: userId,
        name: name.trim(),
        email: normalizedEmail,
        role: 'user'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Unable to create account.' },
      { status: 500 }
    );
  }
}
