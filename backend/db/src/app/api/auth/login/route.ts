import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const [users] = await pool.query(
      'SELECT id, name, email, password_hash, role, status FROM users WHERE email = ?',
      [normalizedEmail]
    );

    const userArray = users as any[];
    if (!userArray || userArray.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const user = userArray[0];

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Return user data without password
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Unable to sign in.' },
      { status: 500 }
    );
  }
}
