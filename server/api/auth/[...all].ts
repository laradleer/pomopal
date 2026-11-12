// Better Auth handles every /api/auth/* route: sign-up, sign-in, sign-out, session, Google OAuth.
export default defineEventHandler((event) => useAuth().handler(toWebRequest(event)))
