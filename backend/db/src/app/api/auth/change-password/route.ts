import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword } = body;

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'User ID, current password, and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    // Get user's current password hash
    const [users] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    const userArray = users as any[];
    if (!userArray || userArray.length === 0) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    const user = userArray[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect.' },
        { status: 401 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, userId]
    );

    return NextResponse.json({
      message: 'Password changed successfully.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Unable to change password.' },
      { status: 500 }
    );
  }
}
