import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, email } = body;

    if (!userId || !name || !email) {
      return NextResponse.json(
        { error: 'User ID, name, and email are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email is already taken by another user
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [normalizedEmail, userId]
    );

    const userArray = existingUsers as any[];
    if (userArray && userArray.length > 0) {
      return NextResponse.json(
        { error: 'Email is already taken by another user.' },
        { status: 409 }
      );
    }

    // Update user profile
    await pool.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name.trim(), normalizedEmail, userId]
    );

    return NextResponse.json({
      message: 'Profile updated successfully.',
      name: name.trim(),
      email: normalizedEmail
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Unable to update profile.' },
      { status: 500 }
    );
  }
}
