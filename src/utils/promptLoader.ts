import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { parse } from "smol-toml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadPrompt(
  filename: string,
  replacements: Record<string, string> = {}
): Promise<string> {
  // Resolve path relative to this file. 
  // Structure: dist/utils/promptLoader.js -> dist/prompts/filename.toml
  const promptPath = join(__dirname, "../prompts", filename);
  
  try {
    const content = await readFile(promptPath, "utf-8");
    const parsed = parse(content) as { prompt: string };
    
    let promptText = parsed.prompt;

    for (const [key, value] of Object.entries(replacements)) {
      promptText = promptText.replaceAll(`{{${key}}}`, value || "");
    }

    return promptText;
  } catch (error) {
    throw new Error(`Failed to load prompt from ${promptPath}: ${error}`);
  }
}
