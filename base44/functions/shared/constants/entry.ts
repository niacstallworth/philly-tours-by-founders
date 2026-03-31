// Badge requirements
export const BADGE_REQUIREMENTS = {
  FIRST_HUNT: { type: 'hunts_completed', value: 1 },
  FIVE_HUNTS: { type: 'hunts_completed', value: 5 },
  TAG_MASTER: { type: 'tags_scanned', value: 50 },
  POINTS_COLLECTOR: { type: 'points_earned', value: 500 },
  STREAK: { type: 'streak', value: 7 },
} as const;

// User stats multipliers
export const SCORE_MULTIPLIER = 100; // points per hunt completion

// Redemption status
export const REDEMPTION_STATUS = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  CANCELLED: 'cancelled',
} as const;

// Hunt progress status
export const HUNT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  INSUFFICIENT_POINTS: 'Insufficient points for redemption',
  PRODUCT_NOT_FOUND: 'Product not found',
  USER_PROFILE_NOT_FOUND: 'User profile not found',
  INVALID_REQUEST: 'Invalid request',
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;