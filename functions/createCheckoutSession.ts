import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    // Check if running in iframe
    const isIframe = req.headers.get('x-requested-with') === 'iframe';
    if (isIframe) {
      return Response.json(
        { error: 'Checkout must be accessed from the published app, not in preview' },
        { status: 400 }
      );
    }

    const { origin } = await req.json();
    if (!origin) {
      return Response.json({ error: 'Missing origin' }, { status: 400 });
    }

    const stripe = await import('npm:stripe@16.8.0');
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1R5yx8Lks8X7dZmzZDKHQWfn', // Your Elite Membership price ID from Stripe
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/Home?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/UserSettings`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
      },
    });

    return Response.json({ session_id: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});