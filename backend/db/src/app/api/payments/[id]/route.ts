import { NextRequest, NextResponse } from 'next/server';
import { retrievePaymentIntent } from '@/lib/airwallex';

/**
 * Retrieves an Airwallex PaymentIntent so the client/server can verify its
 * status (e.g. SUCCEEDED) before treating an order as paid.
 *
 * GET /api/payments/:id -> { id, status, amount, currency, merchantOrderId }
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Payment intent id is required.' }, { status: 400 });
    }

    const intent = await retrievePaymentIntent(id);

    return NextResponse.json(
      {
        id: intent.id,
        status: intent.status,
        amount: intent.amount,
        currency: intent.currency,
        merchantOrderId: intent.merchant_order_id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[GET /api/payments/[id]]', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve payment intent.' },
      { status: 500 }
    );
  }
}
