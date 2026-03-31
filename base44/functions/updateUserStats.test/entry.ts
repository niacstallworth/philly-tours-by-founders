import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.208.0/testing/asserts.ts";

// Test data and utility functions
const BADGE_REQUIREMENTS = {
  hunts_completed: 1,
  points_earned: 100,
  tags_scanned: 5,
  streak: 3
};

const SCORE_MULTIPLIER = 100;

// Unit test: Score calculation
Deno.test("Score calculation", () => {
  const points = 250;
  const huntsCompleted = 3;
  const expectedScore = points + (huntsCompleted * SCORE_MULTIPLIER);
  
  assertEquals(expectedScore, 550, "Score should be points + (hunts * 100)");
});

// Unit test: Badge eligibility - points earned
Deno.test("Badge eligibility - points earned", () => {
  const userPoints = 150;
  const badgeRequirement = BADGE_REQUIREMENTS.points_earned;
  const isEligible = userPoints >= badgeRequirement;
  
  assertEquals(isEligible, true, "User with 150 points should be eligible for 100-point badge");
});

// Unit test: Badge eligibility - hunts completed
Deno.test("Badge eligibility - hunts completed", () => {
  const huntsCompleted = 5;
  const badgeRequirement = BADGE_REQUIREMENTS.hunts_completed;
  const isEligible = huntsCompleted >= badgeRequirement;
  
  assertEquals(isEligible, true, "User with 5 hunts should be eligible for 1-hunt badge");
});

// Unit test: Multiple badge eligibility
Deno.test("Multiple badge eligibility check", () => {
  const userProfile = {
    total_points: 500,
    hunts_completed: 10
  };

  const eligibleBadges = [];
  
  if (userProfile.total_points >= BADGE_REQUIREMENTS.points_earned) {
    eligibleBadges.push("points_badge");
  }
  if (userProfile.hunts_completed >= BADGE_REQUIREMENTS.hunts_completed) {
    eligibleBadges.push("hunts_badge");
  }

  assertEquals(eligibleBadges.length, 2, "User should be eligible for 2 badges");
  assertEquals(eligibleBadges.includes("points_badge"), true, "Should include points badge");
  assertEquals(eligibleBadges.includes("hunts_badge"), true, "Should include hunts badge");
});

// Unit test: Point accumulation
Deno.test("Point accumulation", () => {
  const currentPoints = 100;
  const pointsEarned = 50;
  const newTotal = currentPoints + pointsEarned;
  
  assertEquals(newTotal, 150, "Points should accumulate correctly");
});

// Unit test: No negative points
Deno.test("Points cannot be negative", () => {
  const currentPoints = 0;
  const pointsEarned = -50;
  const newTotal = Math.max(0, currentPoints + pointsEarned);
  
  assertEquals(newTotal, 0, "Points should not go below zero");
});