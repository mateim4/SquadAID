import { invoke } from "@tauri-apps/api/tauri";
import { isTauri } from "./platform";

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

/**
 * Fetches the list of local models available from the Ollama API.
 * @returns A promise that resolves to an array of Ollama models.
 */
export async function listLocalModels(): Promise<OllamaModel[]> {
  if (isTauri()) {
    return await invoke("list_ollama_models");
  } else {
    try {
      const response = await fetch('/ollama-api/api/tags');
      if (!response.ok) {
        console.error('Ollama API not available or returned an error.');
        return [];
      }
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error("Failed to fetch Ollama models. Is Ollama running?", error);
      return [];
    }
  }
}

/**
 * Tests the connection to the local Ollama server.
 * @returns A promise that resolves to a boolean indicating if the connection was successful.
 */
export async function testOllamaConnection(): Promise<boolean> {
    if (isTauri()) {
        return await invoke("test_ollama_connection");
    } else {
        try {
            const response = await fetch('/ollama-api/');
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}
