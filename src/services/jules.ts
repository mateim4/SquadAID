/** Jules AI service - handles API key management and Jules-specific operations */
import { getSecret, setSecret } from '@/services/surreal';

/**
 * Retrieves the Jules API key from the database
 * @returns The Jules API key or null if not found
 */
export async function getJulesToken(): Promise<string | null> {
  try {
    const result = await getSecret('jules_token');
    if (result.result?.[0]?.value) {
      return result.result[0].value as string;
    }
    return null;
  } catch (error) {
    console.error('Failed to retrieve Jules token:', error);
    return null;
  }
}

/**
 * Stores the Jules API key in the database
 * @param token - The Jules API key to store
 */
export async function saveJulesToken(token: string): Promise<void> {
  try {
    await setSecret('jules_token', token);
  } catch (error) {
    console.error('Failed to save Jules token:', error);
    throw error;
  }
}

/**
 * Checks if a Jules API key is configured
 * @returns True if a Jules token exists
 */
export async function hasJulesToken(): Promise<boolean> {
  const token = await getJulesToken();
  return token !== null && token.length > 0;
}

/**
 * Validates the Jules API key format (basic validation)
 * @param token - The token to validate
 * @returns True if the token format appears valid
 */
export function validateJulesToken(token: string): boolean {
  // Add your specific Jules token format validation here
  // For now, just check it's not empty
  return !!(token && token.trim().length > 0);
}
