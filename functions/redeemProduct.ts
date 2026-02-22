import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createJsonResponse, createErrorResponse } from './shared/utils.ts';
import { REDEMPTION_STATUS, ERROR_MESSAGES, HTTP_STATUS } from './shared/constants.ts';

interface RedeemProductPayload {
  product_id: string;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return createErrorResponse(
        ERROR_MESSAGES.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const payload = (await req.json()) as RedeemProductPayload;
    const productId = payload.product_id;

    if (!productId) {
      return createErrorResponse(
        ERROR_MESSAGES.INVALID_REQUEST,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Get product
    const products = await base44.entities.Product.filter({ id: productId });
    if (products.length === 0) {
      return createErrorResponse(
        ERROR_MESSAGES.PRODUCT_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    const product = products[0];

    // Get user profile
    const profiles = await base44.entities.UserProfile.filter({
      user_email: user.email,
    });

    if (profiles.length === 0) {
      return createErrorResponse(
        ERROR_MESSAGES.USER_PROFILE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    const profile = profiles[0];

    // Check points
    if (profile.total_points < product.points_cost) {
      return createErrorResponse(
        ERROR_MESSAGES.INSUFFICIENT_POINTS,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Create redemption using service role (user can create, but we update profile as service)
    const redemption = await base44.entities.Redemption.create({
      user_email: user.email,
      product_id: product.id,
      product_name: product.name,
      points_spent: product.points_cost,
      status: REDEMPTION_STATUS.PENDING,
    });

    // Update user profile (service role for cross-entity update)
    const newPoints = profile.total_points - product.points_cost;
    const newScore = newPoints + profile.hunts_completed * 100;

    await base44.asServiceRole.entities.UserProfile.update(profile.id, {
      total_points: newPoints,
      score: newScore,
    });

    return createJsonResponse({
      success: true,
      redemption,
      remaining_points: newPoints,
    });
  } catch (error) {
    console.error('redeemProduct error:', error);
    return createErrorResponse(
      'Failed to redeem product',
      HTTP_STATUS.INTERNAL_ERROR
    );
  }
});