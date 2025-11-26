import React from 'react';
import { Bot, Database, Code2, Layers } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="text-center max-w-3xl mx-auto pt-16 pb-10 px-4">
      <div className="inline-flex items-center justify-center p-3 bg-slate-800 rounded-full mb-6 shadow-lg border border-slate-700">
        <Bot className="text-blue-400 mr-2" size={24} />
        <span className="text-slate-200 font-medium">AI-Powered System Generator</span>
      </div>
      <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-6 leading-tight">
        Build Apps Script Systems<br />Without Coding
      </h1>
      <p className="text-lg text-slate-400 mb-10 leading-relaxed">
        Describe the tool you need (CRM, Inventory, Dashboard). We generate the <span className="text-green-400">Google Sheet</span> structure, the <span className="text-blue-400">Backend logic</span>, and the <span className="text-orange-400">Frontend interface</span> automatically.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors">
          <Database className="text-green-500 mb-4" size={32} />
          <h3 className="text-white font-semibold mb-2">Auto Database</h3>
          <p className="text-slate-400 text-sm">Automatically defines your Google Sheet tabs and headers.</p>
        </div>
        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors">
          <Code2 className="text-blue-500 mb-4" size={32} />
          <h3 className="text-white font-semibold mb-2">Native GAS</h3>
          <p className="text-slate-400 text-sm">Generates pure <code>.gs</code> files using <code>google.script.run</code>.</p>
        </div>
        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors">
          <Layers className="text-orange-500 mb-4" size={32} />
          <h3 className="text-white font-semibold mb-2">Ready Frontend</h3>
          <p className="text-slate-400 text-sm">Responsive HTML/JS dashboards ready to deploy.</p>
        </div>
      </div>
    </div>
  );
};

export default Hero;