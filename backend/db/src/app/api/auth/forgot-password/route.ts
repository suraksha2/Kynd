import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const [users] = await pool.query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [normalizedEmail]
    );

    const userArray = users as any[];
    if (!userArray || userArray.length === 0) {
      // Don't reveal that user doesn't exist for security
      return NextResponse.json({
        message: 'If an account exists with this email, you will receive a password reset link.'
      });
    }

    const user = userArray[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry, user.id]
    );

    // In a real application, you would send an email here with the reset link
    // For now, we'll return the token in the response for testing purposes
    // In production, remove the token from the response and send via email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    return NextResponse.json({
      message: 'If an account exists with this email, you will receive a password reset link.',
      // Remove this in production - only for development/testing
      resetToken,
      resetUrl
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Unable to process request.' },
      { status: 500 }
    );
  }
}
