import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent, paymentCurrency, AirwallexConfigError } from '@/lib/airwallex';

/**
 * Creates an Airwallex PaymentIntent for a checkout.
 *
 * Body: { amount: number, merchantOrderId: string, metadata?: object, returnUrl?: string }
 * Returns: { id, clientSecret, amount, currency, env }
 *
 * The amount is taken from the request for now, but should ideally be derived
 * from server-side cart/pricing data to fully prevent tampering.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, merchantOrderId, metadata, returnUrl } = body || {};

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: 'A positive "amount" is required.' },
        { status: 400 }
      );
    }
    if (!merchantOrderId || typeof merchantOrderId !== 'string') {
      return NextResponse.json(
        { error: '"merchantOrderId" is required.' },
        { status: 400 }
      );
    }

    const intent = await createPaymentIntent({
      // Round to 2 decimals to avoid floating point artifacts.
      amount: Math.round(numericAmount * 100) / 100,
      currency: paymentCurrency,
      merchantOrderId,
      metadata,
      returnUrl,
      descriptor: 'Helpr Services',
    });

    return NextResponse.json(
      {
        id: intent.id,
        clientSecret: intent.client_secret,
        amount: intent.amount,
        currency: intent.currency,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/payments/create-intent]', error);
    // Misconfiguration (missing/placeholder credentials) is a server config issue,
    // not a transient failure — surface it distinctly so it's easy to diagnose.
    if (error instanceof AirwallexConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to create payment intent.' },
      { status: 500 }
    );
  }
}
