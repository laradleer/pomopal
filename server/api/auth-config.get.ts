// Public: which sign-in options the login page should offer.
export default defineEventHandler(() => ({ google: isGoogleEnabled() }))
