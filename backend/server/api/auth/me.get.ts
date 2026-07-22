export default defineEventHandler(async (event) => {
  const ctxUser = event.context.user;
  if (!ctxUser) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  }
  // Map JWT payload (userId) to frontend User interface (id).
  return {
    user: {
      id: ctxUser.userId,
      username: ctxUser.username,
      role: ctxUser.role,
    },
  };
});
