import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { product_id } = await req.json();
    if (!product_id) {
      return Response.json({ error: 'Missing product_id' }, { status: 400 });
    }

    // Get product
    const products = await base44.entities.Product.filter({ id: product_id });
    if (!products || products.length === 0) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = products[0];
    if (!product.points_cost) {
      return Response.json({ error: 'Product cannot be redeemed with points' }, { status: 400 });
    }

    // Get user profile
    const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
    let profile = profiles[0];

    if (!profile) {
      return Response.json({ error: 'User profile not found' }, { status: 404 });
    }

    const currentPoints = profile.total_points || 0;
    if (currentPoints < product.points_cost) {
      return Response.json(
        { error: `Insufficient points. You have ${currentPoints} but need ${product.points_cost}` },
        { status: 400 }
      );
    }

    // Create redemption record
    const redemption = await base44.entities.Redemption.create({
      user_email: user.email,
      product_id: product.id,
      product_name: product.name,
      points_spent: product.points_cost,
      status: 'pending',
    });

    // Deduct points from profile
    const newPoints = currentPoints - product.points_cost;
    const newScore = newPoints + (profile.hunts_completed || 0) * 100;

    await base44.entities.UserProfile.update(profile.id, {
      total_points: newPoints,
      score: newScore,
    });

    return Response.json({
      success: true,
      redemption_id: redemption.id,
      remaining_points: newPoints,
      message: `${product.name} redeemed! ${product.points_cost} points deducted.`,
    });
  } catch (error) {
    console.error('Redemption error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});