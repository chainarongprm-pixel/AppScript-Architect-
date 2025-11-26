import { GoogleGenAI } from "@google/genai";
import { AppScriptSystem, SystemType, GenerationResult, ChatTurn } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

// --- AUDIT MODES (Based on User Images) ---
const AUDIT_OPTIONS = [
  { 
    id: 'security', 
    name: 'Security Guard', 
    desc: 'Prevent Hardcoded Keys, CSRF, Unsanitized Input',
    prompt: 'CRITICAL SECURITY AUDIT: NEVER hardcode API keys. Implement CSRF tokens for forms. Sanitize ALL user inputs to prevent XSS/Injection. Use PropertiesService for secrets.',
  },
  { 
    id: 'edge_case', 
    name: 'Edge Case Handler', 
    desc: 'Fix Happy Path Bias, Handle Nulls/Errors',
    prompt: 'ANTI-HAPPY PATH BIAS: Assume inputs will fail. Handle null, undefined, and empty strings explicitly. Wrap critical logic in try-catch blocks with meaningful error logging.',
  },
  { 
    id: 'package', 
    name: 'Package Verifier', 
    desc: 'Prevent Fake Packages/Libraries',
    prompt: 'PACKAGE HALLUCINATION CHECK: Only use Libraries/APIs that are 100% CONFIRMED to exist in Google Apps Script or standard CDNs. Do not invent import paths or npm packages.',
  },
  { 
    id: 'logic', 
    name: 'Logic Deep Scan', 
    desc: 'Fix Subtle Logic/Math Errors',
    prompt: 'LOGIC VERIFICATION: Double-check loop boundaries (off-by-one errors). Verify tax/math calculations step-by-step. Ensure conditional logic covers all branches.',
  },
  { 
    id: 'version', 
    name: 'Version Validator', 
    desc: 'Check Deprecated Syntax/Versions',
    prompt: 'VERSION CONTROL: Do not use deprecated Google Apps Script methods (e.g., use ScriptApp.getOAuthToken() correctly). For Frontend, ensure Tailwind classes match v3.0+ standards.',
  },
  { 
    id: 'review', 
    name: 'Code Reviewer', 
    desc: 'Simulate Strict Peer Review',
    prompt: 'STRICT CODE REVIEW: Act as a senior engineer. Explain complex logic in comments. Ensure variable names are descriptive. Remove redundant code. Optimize for GAS quotas.',
  }
];


export const generateAppScriptSystem = async (
  description: string,
  type: SystemType,
  tools: string[],
  auditIds: string[],
  imageBase64?: string,
  imageMimeType?: string
): Promise<GenerationResult> => {

  const activeAudits = AUDIT_OPTIONS.filter(a => auditIds.includes(a.id));
  const auditPrompt = activeAudits.length > 0
    ? `\n\n=== 🚨 QUALITY CONTROL & AUDIT PROTOCOLS (MUST FOLLOW) ===\n${activeAudits.map(a => `- ${a.prompt}`).join('\n')}\n=======================================================\n`
    : '';

  const toolsPrompt = tools.length > 0
    ? `5. STRICTLY INTEGRATE the following tools/libraries: ${tools.join(', ')}. Ensure correct implementation.`
    : '';

  const systemPrompt = `
    You are an expert Google Apps Script Architect with a focus on Security and Robustness.
    
    Output JSON format ONLY:
    {
      "title": "System Title",
      "description": "Short description",
      "type": "${type}",
      "sheetStructure": "Detailed description of sheets and columns needed (e.g., 'Sheet1: ID, Name, Status')",
      "backendCode": "Complete Code.gs content (JavaScript)",
      "frontendCode": "Complete index.html content (HTML/CSS/JS)",
      "guide": "Step-by-step setup instructions in Thai"
    }

    RULES:
    1. Backend: Modern ES6+, doGet(), setup().
    2. Frontend: Tailwind CSS (unless specified otherwise). Responsive.
    3. Language: Logic in English, UI/Guide in Thai.
    4. Image Analysis: Extract requirements if image provided.
    ${toolsPrompt}
    ${auditPrompt}
  `;

  const userContent: any[] = [{ text: `Create a ${type} system: ${description}` }];

  if (imageBase64 && imageMimeType) {
    userContent.push({
      inlineData: {
        mimeType: imageMimeType,
        data: imageBase64
      }
    });
  }
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: userContent }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response generated");

    const system = JSON.parse(text) as AppScriptSystem;
    return { system, cost: 0 }; // Cost is a placeholder
  } catch (error) {
    console.error("Generation failed:", error);
    throw error;
  }
};

export const refineAppScriptSystem = async (currentSystem: AppScriptSystem, history: ChatTurn[]): Promise<AppScriptSystem> => {
  const systemPrompt = `
    You are refining an existing Google Apps Script system. 
    Current System JSON: ${JSON.stringify(currentSystem)}
    
    User wants to modify this system. Output the FULLY UPDATED JSON object.
  `;

  const lastMessage = history[history.length - 1].content;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: lastMessage }] }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No refinement response generated");

    return JSON.parse(text) as AppScriptSystem;
  } catch (error) {
    console.error("Refinement failed:", error);
    throw error;
  }
};

export const enhanceFrontendCode = async (currentHtml: string): Promise<string> => {
  const prompt = `Refactor to be modern, beautiful, using Tailwind CSS. HTML: ${currentHtml}`;
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "text/plain",
      }
    });
    
    const text = response.text;
    return text || currentHtml;
  } catch (e) {
    console.error("Enhancement failed:", e);
    return currentHtml;
  }
};
