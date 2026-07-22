export default defineEventHandler(async (event) => {
  deleteCookie(event, "sequent_token");
  return { ok: true };
});
