export enum SystemType {
  CRM = 'CRM',
  INVENTORY = 'INVENTORY',
  DASHBOARD = 'DASHBOARD',
  CUSTOM = 'CUSTOM'
}

export interface AppScriptSystem {
  title: string;
  description: string;
  type: SystemType;
  sheetStructure: string;
  backendCode: string;
  frontendCode: string;
  guide: string;
}

export interface GenerationResult {
  system: AppScriptSystem;
  cost: number;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface SavedProject {
  id: string;
  timestamp: number;
  system: AppScriptSystem;
}
