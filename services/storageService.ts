
// Fix: Changed GeneratedSystem to AppScriptSystem as it's the correct type for a system object.
import { AppScriptSystem, SavedProject, SystemType } from '../types';

const STORAGE_KEY = 'appscript_architect_projects';

// Fix: Updated the function to correctly implement saving a project according to the SavedProject interface.
// Removed unused 'type' parameter and corrected the structure of the newProject object.
export const saveProject = (system: AppScriptSystem): SavedProject => {
  const projects = getProjects();
  
  // Create a simple unique ID
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  const newProject: SavedProject = {
    id,
    system,
    timestamp: Date.now(),
  };

  const updatedProjects = [newProject, ...projects];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
  return newProject;
};

export const getProjects = (): SavedProject[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load projects", e);
    return [];
  }
};

export const deleteProject = (id: string): SavedProject[] => {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return projects;
};
