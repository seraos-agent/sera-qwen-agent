export const createGuestSession = (req, res) => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 3600 * 1000);
  const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  return res.json({
    success: true,
    session_id: sessionId,
    type: "guest",
    created_at: now,
    expires_at: expiresAt
  });
};

