import { invoke } from '@tauri-apps/api/tauri';
import { getSecret } from './surreal';

export async function runGeminiPrompt(prompt: string): Promise<string> {
  // Get the selected model from secrets
  let model = 'gemini-1.5-pro'; // Default
  try {
    const r = await getSecret('gemini_model');
    if (r.result?.[0]?.value) {
      model = r.result[0].value as string;
    }
  } catch (e) {
    console.warn('Failed to fetch gemini_model, using default', e);
  }

  try {
    const response = await invoke<string>('run_gemini', { prompt, model });
    return response;
  } catch (error) {
    console.error('Gemini execution failed:', error);
    throw error;
  }
}
