// Liveness check for the Docker healthcheck and the deploy workflow.
export default defineEventHandler(() => ({ status: 'ok' as const }))
