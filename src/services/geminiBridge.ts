import { invoke } from '@tauri-apps/api/tauri';
import { getSecret } from './surreal';

export async function runGeminiPrompt(prompt: string): Promise<string> {
  // Backwards-compatible: call with default model from secrets
  return runGeminiPromptWithOptions(prompt, undefined, undefined);
}

export async function runGeminiPromptWithOptions(prompt: string, model?: string, flags?: string): Promise<string> {
  // If model not provided, fallback to secrets or default
  let effectiveModel = model ?? 'gemini-1.5-pro';
  if (!model) {
    try {
      const r = await getSecret('gemini_model');
      if (r.result?.[0]?.value) {
        effectiveModel = r.result[0].value as string;
      }
    } catch (e) {
      console.warn('Failed to fetch gemini_model, using default', e);
    }
  }

  try {
    const response = await invoke<string>('run_gemini', { prompt, model: effectiveModel, flags: flags ?? '' });
    return response;
  } catch (error) {
    console.error('Gemini execution failed:', error);
    throw error;
  }
}
