import React, { useState, useEffect } from 'react';
import { SavedProject, SystemType } from '../types';
import { Database, X, Play, Trash2 } from 'lucide-react';

interface ProjectListProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (project: SavedProject) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ isOpen, onClose, onLoad }) => {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [filter, setFilter] = useState<SystemType | 'ALL'>('ALL');

  useEffect(() => {
    if (isOpen) {
      const saved = JSON.parse(localStorage.getItem('savedProjects') || '[]');
      setProjects(saved);
    }
  }, [isOpen]);

  const handleDelete = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('savedProjects', JSON.stringify(updated));
  };

  const filteredProjects = filter === 'ALL' ? projects : projects.filter(p => p.system.type === filter);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            My Projects
          </h2>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 border-b border-slate-800 flex gap-2 overflow-x-auto scrollbar-hide">
          {['ALL', ...Object.values(SystemType)].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filter === type 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No projects found.</div>
          ) : (
            filteredProjects.map((project) => (
               <div key={project.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors flex justify-between items-center group">
                 <div>
                    <h3 className="font-semibold text-white">{project.system.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        project.system.type === SystemType.CRM ? 'text-green-400 border-green-400/20 bg-green-400/10' :
                        project.system.type === SystemType.INVENTORY ? 'text-blue-400 border-blue-400/20 bg-blue-400/10' :
                        'text-purple-400 border-purple-400/20 bg-purple-400/10'
                      }`}>
                        {project.system.type}
                      </span>
                      <span className="text-xs text-slate-500">{new Date(project.timestamp).toLocaleDateString()}</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => { onLoad(project); onClose(); }} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg">
                     <Play className="w-4 h-4" />
                   </button>
                   <button onClick={() => handleDelete(project.id)} className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-lg">
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectList;
