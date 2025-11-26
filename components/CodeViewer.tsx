import React, { useState } from 'react';
import { AppScriptSystem, SavedProject } from '../types';
import { Bot, Database, Code2, Layout, Copy, Check, Save, Download, Sparkles, Loader2 } from 'lucide-react';
import { enhanceFrontendCode } from '../services/geminiService';

const CodeBlock = ({ code, language }: { code: string; language: string }) => (
  <pre className="p-4 rounded-lg bg-[#1e1e1e] text-[#d4d4d4] overflow-x-auto text-sm font-mono leading-relaxed border border-slate-800 shadow-inner h-full">
    <code>{code}</code>
  </pre>
);

interface CodeViewerProps {
  system: AppScriptSystem;
  onSave: () => void;
  onUpdateSystem: (system: AppScriptSystem) => void;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ system, onSave, onUpdateSystem }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'database' | 'backend' | 'frontend'>('guide');
  const [copied, setCopied] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleCopy = () => {
    const content = activeTab === 'guide' ? system.guide :
                    activeTab === 'database' ? system.sheetStructure :
                    activeTab === 'backend' ? system.backendCode :
                    system.frontendCode;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProject = () => {
    const projects: SavedProject[] = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    const newProject: SavedProject = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      system
    };
    localStorage.setItem('savedProjects', JSON.stringify([newProject, ...projects]));
    onSave(); 
    alert('Project Saved to Local Storage!');
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(system, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${system.title.replace(/\s+/g, '_')}_System.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEnhanceUI = async () => {
    setIsEnhancing(true);
    try {
      const newHtml = await enhanceFrontendCode(system.frontendCode);
      onUpdateSystem({ ...system, frontendCode: newHtml });
    } catch (e) {
      alert('Failed to enhance UI');
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {[
            { id: 'guide', label: 'Setup Guide', icon: <Bot className="w-4 h-4" /> },
            { id: 'database', label: 'Database', icon: <Database className="w-4 h-4" /> },
            { id: 'backend', label: 'Code.gs', icon: <Code2 className="w-4 h-4" /> },
            { id: 'frontend', label: 'index.html', icon: <Layout className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {activeTab === 'frontend' && (
            <button
              onClick={handleEnhanceUI}
              disabled={isEnhancing}
              className="p-2 text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors"
              title="Enhance UI with AI"
            >
              {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            </button>
          )}
          <button onClick={handleCopy} className={`p-2 rounded-lg transition-all ${copied ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:bg-slate-800'}`}>
             {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button onClick={handleDownload} className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg" title="Download JSON">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={handleSaveProject} className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors">
            <Save className="w-3 h-3" />
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#1e1e1e]">
        {activeTab === 'guide' && (
           <div className="p-6 text-slate-300 prose prose-invert max-w-none prose-p:text-slate-300 prose-li:text-slate-300">
             <h3 className="text-xl font-bold text-white mb-4">Installation Guide</h3>
             <div className="whitespace-pre-wrap font-sans">{system.guide}</div>
           </div>
        )}
        {activeTab === 'database' && <CodeBlock language="text" code={system.sheetStructure} />}
        {activeTab === 'backend' && <CodeBlock language="javascript" code={system.backendCode} />}
        {activeTab === 'frontend' && <CodeBlock language="html" code={system.frontendCode} />}
      </div>
    </div>
  );
};

export default CodeViewer;
