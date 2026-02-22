import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { points_earned, hunt_completed } = await req.json();

    // Get or create user profile
    let profile = (await base44.entities.UserProfile.filter({ user_email: user.email }))[0];

    if (!profile) {
      profile = await base44.entities.UserProfile.create({
        user_email: user.email,
        display_name: user.full_name || user.email.split('@')[0],
        total_points: 0,
        hunts_completed: 0,
        score: 0,
      });
    }

    // Update stats
    const huntBonusPoints = hunt_completed ? 50 : 0;
    const newPoints = (profile.total_points || 0) + (points_earned || 0) + huntBonusPoints;
    const newHunts = (profile.hunts_completed || 0) + (hunt_completed ? 1 : 0);
    const newScore = newPoints + newHunts * 100;

    await base44.entities.UserProfile.update(profile.id, {
      total_points: newPoints,
      hunts_completed: newHunts,
      score: newScore,
    });

    // Check & award badges
    const badges = await base44.entities.Badge.list();
    const userBadges = await base44.entities.UserBadge.filter({ user_email: user.email });
    const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));

    for (const badge of badges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      const qualifies =
        (badge.requirement_type === 'points_earned' && newPoints >= badge.requirement_value) ||
        (badge.requirement_type === 'hunts_completed' && newHunts >= badge.requirement_value);

      if (qualifies) {
        await base44.entities.UserBadge.create({
          user_email: user.email,
          badge_id: badge.id,
          badge_name: badge.name,
          earned_at: new Date().toISOString(),
        });
      }
    }

    return Response.json({ success: true, profile: { total_points: newPoints, hunts_completed: newHunts, score: newScore } });
  } catch (error) {
    console.error('Stats update error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});