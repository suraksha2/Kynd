import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const [users] = await pool.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );

    const userArray = users as any[];
    if (!userArray || userArray.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token.' },
        { status: 400 }
      );
    }

    const user = userArray[0];

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await pool.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [passwordHash, user.id]
    );

    return NextResponse.json({
      message: 'Password has been reset successfully.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Unable to reset password.' },
      { status: 500 }
    );
  }
}
