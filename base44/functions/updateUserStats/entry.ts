import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { calculateScore, createJsonResponse, createErrorResponse } from './shared/utils.ts';
import { SCORE_MULTIPLIER, ERROR_MESSAGES, HTTP_STATUS } from './shared/constants.ts';

interface UpdateUserStatsPayload {
  points_earned?: number;
  hunt_completed?: boolean;
}

interface UserProfile {
  id: string;
  user_email: string;
  total_points: number;
  hunts_completed: number;
  score: number;
}

interface Badge {
  id: string;
  name: string;
  requirement_type: string;
  requirement_value: number;
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

    const payload = (await req.json()) as UpdateUserStatsPayload;
    const pointsEarned = payload.points_earned || 0;
    const huntCompleted = payload.hunt_completed || false;

    // Get or create user profile
    const profiles = await base44.entities.UserProfile.filter({
      user_email: user.email,
    });
    let profile: UserProfile = profiles[0];

    if (!profile) {
      profile = await base44.entities.UserProfile.create({
        user_email: user.email,
        total_points: pointsEarned,
        hunts_completed: huntCompleted ? 1 : 0,
        score: calculateScore(
          pointsEarned,
          huntCompleted ? 1 : 0
        ),
      });
    } else {
      // Update existing profile
      const newPoints = profile.total_points + pointsEarned;
      const newHunts = profile.hunts_completed + (huntCompleted ? 1 : 0);
      const newScore = calculateScore(newPoints, newHunts);

      profile = await base44.entities.UserProfile.update(profile.id, {
        total_points: newPoints,
        hunts_completed: newHunts,
        score: newScore,
      });
    }

    // Check for new badges
    const existingBadges = await base44.entities.UserBadge.filter({
      user_email: user.email,
    });
    const earnedBadgeIds = new Set(
      existingBadges.map((b) => b.badge_id)
    );

    const badges = await base44.entities.Badge.list();
    const newBadges: { id: string; name: string }[] = [];

    for (const badge of badges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let shouldEarn = false;
      if (
        badge.requirement_type === 'hunts_completed' &&
        profile.hunts_completed >= badge.requirement_value
      ) {
        shouldEarn = true;
      } else if (
        badge.requirement_type === 'points_earned' &&
        profile.total_points >= badge.requirement_value
      ) {
        shouldEarn = true;
      }

      if (shouldEarn) {
        await base44.entities.UserBadge.create({
          user_email: user.email,
          badge_id: badge.id,
          badge_name: badge.name,
          earned_at: new Date().toISOString(),
        });
        newBadges.push({ id: badge.id, name: badge.name });
      }
    }

    return createJsonResponse({
      profile,
      new_badges: newBadges,
    });
  } catch (error) {
    console.error('updateUserStats error:', error);
    return createErrorResponse(
      'Failed to update stats',
      HTTP_STATUS.INTERNAL_ERROR
    );
  }
});