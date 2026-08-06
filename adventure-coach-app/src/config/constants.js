// Minimal constants for AuthService and other services
// These can be overridden with environment variables via webpack DefinePlugin if needed

export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';
export const ENABLE_AI_CHAT = (process.env.ENABLE_AI_CHAT || 'true') === 'true';
export const OPENAI_MODEL = process.env.AI_MODEL_VERSION || 'gpt-3.5-turbo';
