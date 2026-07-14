import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import bcrypt from 'bcryptjs';
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from '@/lib/auth';

// Dedicated login for service providers. Credentials live in the
// `service_providers` table (separate from admin/customer `users`), and the
// issued session token carries role='provider' so the provider portal and
// /api/provider/* routes can be gated independently of the admin panel.
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

    const [rows] = await pool.query(
      'SELECT id, name, email, password_hash, status FROM service_providers WHERE email = ?',
      [normalizedEmail]
    );

    const providers = rows as any[];
    if (!providers || providers.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const provider = providers[0];

    if (!provider.password_hash) {
      return NextResponse.json(
        { error: 'No password set for this account. Please contact the admin.' },
        { status: 403 }
      );
    }

    if (provider.status !== 'active' && provider.status !== 'busy') {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact support.' },
        { status: 403 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, provider.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      id: provider.id,
      email: provider.email,
      role: 'provider',
    });

    const response = NextResponse.json({
      id: provider.id,
      name: provider.name,
      email: provider.email,
      role: 'provider',
      token,
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error('Provider login error:', error);
    return NextResponse.json(
      { error: 'Unable to sign in.' },
      { status: 500 }
    );
  }
}
