import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Layout, Database, Play, Save, Code2, Bot, Sparkles, 
  AlertTriangle, Send, Loader2, Paperclip, MessageSquare, 
  Trash2, Plus, MessageCircle, QrCode, Briefcase, Zap, BrainCircuit,
  Copy, Check, X, Download, Calendar, ShoppingBag, BarChart3, ClipboardList, LifeBuoy, GraduationCap, UserPlus,
  Settings2, Layers, ShieldAlert, Bug, PackageX, SearchCheck, GitPullRequest, FileSearch
} from 'lucide-react';
import { SystemType, AppScriptSystem, GenerationResult, ChatTurn, SavedProject } from './types';
import { generateAppScriptSystem, refineAppScriptSystem } from './services/geminiService';
import CodeViewer from './components/CodeViewer';
import ProjectList from './components/ProjectList';

// --- TOOLS DATA (2021-2025) ---
const DEV_TOOLS = {
  frontend: [
    { id: 'tailwind', name: 'Tailwind CSS', year: '2023+', desc: 'Modern Utility-First' },
    { id: 'bootstrap', name: 'Bootstrap 5', year: '2021', desc: 'Classic Grid System' },
    { id: 'daisyui', name: 'DaisyUI', year: '2024', desc: 'Component Library' },
    { id: 'vue', name: 'Vue.js 3', year: '2023', desc: 'Reactive Framework' },
    { id: 'jquery', name: 'jQuery', year: '2021', desc: 'Classic DOM Manipulation' },
    { id: 'sweetalert', name: 'SweetAlert2', year: '2022', desc: 'Beautiful Popups' },
    { id: 'chartjs', name: 'Chart.js', year: '2022', desc: 'Data Visualization' },
    { id: 'lucide', name: 'Lucide Icons', year: '2023', desc: 'Clean Icons' },
    { id: 'fontawesome', name: 'FontAwesome', year: '2021', desc: 'Classic Icons' },
    { id: 'motion', name: 'Motion One', year: '2025', desc: 'Smooth Animations' },
  ],
  backend: [
    { id: 'es6', name: 'Modern ES6+', year: 'Std', desc: 'Arrow Functions, Const/Let' },
    { id: 'line_notify', name: 'Line Notify', year: 'Pop', desc: 'Simple Notifications' },
    { id: 'line_messaging', name: 'Line Messaging API', year: 'Adv', desc: 'Chatbot Interaction' },
    { id: 'gmail', name: 'Gmail API', year: 'Std', desc: 'Email Automation' },
    { id: 'calendar', name: 'Calendar API', year: 'Std', desc: 'Event Management' },
    { id: 'drive', name: 'Drive API', year: 'Std', desc: 'File Management' },
    { id: 'jdbc', name: 'JDBC (SQL)', year: 'Ent', desc: 'External Database' },
    { id: 'urlfetch', name: 'UrlFetchApp', year: 'Std', desc: 'External APIs' },
    { id: 'cache', name: 'CacheService', year: 'Perf', desc: 'Temporary Storage' },
    { id: 'props', name: 'PropertiesService', year: 'Std', desc: 'System Config' },
  ]
};

// --- AUDIT MODES (Based on User Images) ---
const AUDIT_OPTIONS = [
  { 
    id: 'security', 
    name: 'Security Guard', 
    desc: 'Prevent Hardcoded Keys, CSRF, Unsanitized Input',
    icon: <ShieldAlert className="w-4 h-4 text-rose-400" />
  },
  { 
    id: 'edge_case', 
    name: 'Edge Case Handler', 
    desc: 'Fix Happy Path Bias, Handle Nulls/Errors',
    icon: <GitPullRequest className="w-4 h-4 text-orange-400" />
  },
  { 
    id: 'package', 
    name: 'Package Verifier', 
    desc: 'Prevent Fake Packages/Libraries',
    icon: <PackageX className="w-4 h-4 text-purple-400" />
  },
  { 
    id: 'logic', 
    name: 'Logic Deep Scan', 
    desc: 'Fix Subtle Logic/Math Errors',
    icon: <Bug className="w-4 h-4 text-yellow-400" />
  },
  { 
    id: 'version', 
    name: 'Version Validator', 
    desc: 'Check Deprecated Syntax/Versions',
    icon: <SearchCheck className="w-4 h-4 text-blue-400" />
  },
  { 
    id: 'review', 
    name: 'Code Reviewer', 
    desc: 'Simulate Strict Peer Review',
    icon: <FileSearch className="w-4 h-4 text-emerald-400" />
  }
];

const TEMPLATES = [
  {
    icon: <MessageCircle className="w-6 h-6 text-green-400" />,
    title: 'Line OA CRM',
    type: SystemType.CRM,
    prompt: 'สร้างระบบ CRM สำหรับ Line OA ที่มีการลงทะเบียนสมาชิก เก็บข้อมูลลูกค้า (ชื่อ, เบอร์โทร, วันเกิด) บันทึกประวัติการซื้อ และมีระบบสะสมแต้มแลกของรางวัล',
    badge: 'New 2025'
  },
  {
    icon: <QrCode className="w-6 h-6 text-blue-400" />,
    title: 'QR Inventory',
    type: SystemType.INVENTORY,
    prompt: 'ระบบจัดการสต็อกสินค้าด้วย QR Code ผ่านมือถือ สแกนรับของเข้า/ตัดของออก ดูยอดคงเหลือแบบ Real-time และแจ้งเตือนเมื่อของใกล้หมด',
    badge: 'New 2025'
  },
  {
    icon: <Briefcase className="w-6 h-6 text-purple-400" />,
    title: 'HR Portal',
    type: SystemType.DASHBOARD,
    prompt: 'เว็บพอร์ทัลสำหรับ HR ให้พนักงานลงเวลาเข้างาน (Time Attendance) ยื่นใบลาออนไลน์ และดูสลิปเงินเดือน พร้อม Dashboard สรุปการมาทำงาน',
    badge: 'New 2025'
  },
  {
    icon: <Zap className="w-6 h-6 text-yellow-400" />,
    title: 'AI Planner',
    type: SystemType.CUSTOM,
    prompt: 'เครื่องมือวางแผนคอนเทนต์ด้วย AI ช่วยคิดหัวข้อ Facebook/TikTok จัดตารางโพสต์ลงปฏิทิน และติดตามสถานะงาน (Draft, Review, Published)',
    badge: 'New 2025'
  },
  {
    icon: <Calendar className="w-6 h-6 text-orange-400" />,
    title: 'Smart Booking',
    type: SystemType.CUSTOM,
    prompt: 'ระบบจองคิวออนไลน์ (Booking) เลือกวัน/เวลาว่างได้จริง บันทึกลง Google Calendar อัตโนมัติ และส่งอีเมลยืนยันการจองหาลูกค้าทันที',
    badge: 'New 2025'
  },
  {
    icon: <ShoppingBag className="w-6 h-6 text-pink-400" />,
    title: 'Shop Manager',
    type: SystemType.INVENTORY,
    prompt: 'ระบบจัดการร้านค้า POS ขนาดเล็ก บันทึกออเดอร์ คำนวณยอดเงินทอน พิมพ์ใบเสร็จย่อ และตัดสต็อกสินค้าทันทีเมื่อขายได้',
    badge: 'New 2025'
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-cyan-400" />,
    title: 'Finance Tracker',
    type: SystemType.DASHBOARD,
    prompt: 'แอพทำบัญชีรายรับ-รายจ่ายส่วนตัวหรือธุรกิจ แยกหมวดหมู่ค่าใช้จ่ายได้ พร้อมกราฟสรุปยอดเงินคงเหลือรายเดือนและรายปี',
    badge: 'New 2025'
  },
  {
    icon: <ClipboardList className="w-6 h-6 text-teal-400" />,
    title: 'Online Leave',
    type: SystemType.DASHBOARD,
    prompt: 'ระบบลางานออนไลน์ พนักงานกรอกใบลา (ป่วย/กิจ/พักร้อน) หัวหน้ากดอนุมัติผ่านเว็บ ส่งอีเมลแจ้งเตือนสถานะ พร้อมปฏิทินแสดงวันลาทีม',
    badge: '2021 Classic'
  },
  {
    icon: <LifeBuoy className="w-6 h-6 text-indigo-400" />,
    title: 'Helpdesk Ticket',
    type: SystemType.CUSTOM,
    prompt: 'ระบบแจ้งซ่อม/แจ้งปัญหาไอที ออกเลข Ticket ติดตามสถานะงานซ่อม (Open, In Progress, Resolved) และประเมินความพึงพอใจหลังจบงาน',
    badge: '2022 Classic'
  },
  {
    icon: <GraduationCap className="w-6 h-6 text-amber-400" />,
    title: 'Grade Checker',
    type: SystemType.CUSTOM,
    prompt: 'ระบบประกาศผลสอบออนไลน์ นักเรียนกรอกเลขประจำตัวเพื่อดูเกรดรายวิชาของตนเองเท่านั้น ข้อมูลดึงจาก Google Sheets ปลอดภัยและเป็นส่วนตัว',
    badge: '2023 Classic'
  },
  {
    icon: <UserPlus className="w-6 h-6 text-red-400" />,
    title: 'Lead Collector',
    type: SystemType.CRM,
    prompt: 'ฟอร์มเก็บข้อมูลผู้สนใจ (Leads) จาก Facebook Ads บันทึกลง Google Sheet ส่ง Line Notify แจ้งฝ่ายขายทันที และส่งอีเมล Welcome หาลูกค้า',
    badge: '2024 Classic'
  },
  {
    icon: <BrainCircuit className="w-6 h-6 text-rose-400" />,
    title: 'AI Assistant',
    type: SystemType.CUSTOM,
    prompt: 'สร้างหน้าเว็บ Chatbot AI อย่างง่าย ที่ผู้ใช้สามารถพิมพ์คำถามและได้รับคำตอบจากระบบ โดยใช้ google.script.run เชื่อมต่อกับ Backend เพื่อประมวลผล',
    badge: 'AI Tool'
  }
];

function App() {
  const [description, setDescription] = useState('');
  const [systemType, setSystemType] = useState<SystemType>(SystemType.CUSTOM);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showProjectList, setShowProjectList] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | null>(null);
  
  const [showTools, setShowTools] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedAudits, setSelectedAudits] = useState<string[]>([]);
  
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [isRefining, setIsRefining] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToChatBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToChatBottom();
  }, [chatHistory]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTemplateSelect = (template: typeof TEMPLATES[0], index: number) => {
    setDescription(template.prompt);
    setSystemType(template.type);
    setSelectedTemplateIndex(index);
    setError(null);
    setShowTools(true);
  };

  const handleStartNew = () => {
    setResult(null);
    setChatHistory([]);
    setDescription('');
    setSelectedTemplateIndex(null);
    clearFile();
    setError(null);
    setSelectedTools([]);
    setSelectedAudits([]);
    setShowTools(false);
  };

  const handleUpdateSystem = (updatedSystem: AppScriptSystem) => {
    if (result) {
      setResult({ ...result, system: updatedSystem });
    }
  };

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) ? prev.filter(t => t !== toolId) : [...prev, toolId]
    );
  };

  const toggleAudit = (auditId: string) => {
    setSelectedAudits(prev => 
      prev.includes(auditId) ? prev.filter(t => t !== auditId) : [...prev, auditId]
    );
  };

  const handleSubmit = async () => {
    if (!description.trim() && !selectedFile) return;

    if (result) {
      setIsRefining(true);
      setError(null);
      const userTurn: ChatTurn = { role: 'user', content: description, timestamp: Date.now() };
      const newHistory = [...chatHistory, userTurn];
      setChatHistory(newHistory);
      const currentDescription = description;
      setDescription('');
      
      try {
        const updatedSystem = await refineAppScriptSystem(result.system, newHistory);
        const aiTurn: ChatTurn = { role: 'assistant', content: 'Updated system based on your request.', timestamp: Date.now() };
        setChatHistory([...newHistory, aiTurn]);
        setResult({ ...result, system: updatedSystem });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Refinement failed');
        // Rollback history on failure
        setChatHistory(chatHistory);
        setDescription(currentDescription);
      } finally {
        setIsRefining(false);
      }
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSelectedTemplateIndex(null);

    try {
      let imageBase64 = undefined;
      let imageMimeType = undefined;
      if (selectedFile && imagePreview) {
        imageBase64 = imagePreview.split(',')[1];
        imageMimeType = selectedFile.type;
      }

      const toolNames = [
        ...DEV_TOOLS.frontend.filter(t => selectedTools.includes(t.id)).map(t => t.name),
        ...DEV_TOOLS.backend.filter(t => selectedTools.includes(t.id)).map(t => t.name),
      ];

      const generatedSystem = await generateAppScriptSystem(
        description, 
        systemType, 
        toolNames,
        selectedAudits,
        imageBase64, 
        imageMimeType
      );
      
      setResult(generatedSystem);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2"></div>
      </div>

      <nav className="relative z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={handleStartNew}>
              <div className="p-2 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300">
                <Terminal className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                AppScript Architect <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded ml-1">v1.4.0</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowProjectList(true)} className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-sm text-slate-400 hover:text-white">
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">My Projects</span>
              </button>
              {result && (
                 <button onClick={handleStartNew} className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors text-sm text-slate-300">
                   <Plus className="w-4 h-4" />
                   <span className="hidden sm:inline">New Project</span>
                 </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {!result ? (
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-slate-800 bg-slate-900/50 text-sm text-slate-400 mb-4">
                <Sparkles className="w-4 h-4 mr-2 text-emerald-400" />
                <span>AI-Powered System Generator</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Build Google Apps <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 animate-gradient">
                  in Minutes, Not Days
                </span>
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Describe your dream system in plain Thai or English. We'll generate the database structure, 
                backend logic, and a modern responsive frontend automatically.
              </p>
            </div>

            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Start with a Template</h2>
                <span className="text-xs text-slate-600">Modern 2025 Designs</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TEMPLATES.map((template, index) => {
                  const isSelected = selectedTemplateIndex === index;
                  const isOtherSelected = selectedTemplateIndex !== null && !isSelected;
                  return (
                    <button
                      key={index}
                      onClick={() => handleTemplateSelect(template, index)}
                      className={`relative group p-4 rounded-xl text-left border transition-all duration-300 ease-in-out ${ isSelected ? 'bg-slate-800 border-blue-500/50 ring-1 ring-blue-500/50 shadow-lg shadow-blue-500/10 scale-[1.02] -translate-y-1 opacity-100 z-10' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700' } ${ isOtherSelected ? 'opacity-50 scale-95 hover:opacity-100 hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-md grayscale-[0.3]' : '' } ${ !selectedTemplateIndex && !isSelected ? 'hover:bg-slate-800 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5' : '' }`}
                    >
                      {template.badge && (<span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${template.badge.includes('AI') ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : template.badge.includes('Classic') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' }`}>{template.badge}</span>)}
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg transition-colors duration-300 ${isSelected ? 'bg-slate-700' : 'bg-slate-950 group-hover:bg-slate-900'}`}>{template.icon}</div>
                        <div className="flex-1">
                          <h3 className={`font-semibold transition-colors duration-300 ${isSelected ? 'text-blue-400' : 'text-slate-200 group-hover:text-blue-400'}`}>{template.title}</h3>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">{template.prompt}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-1.5 sm:p-2 shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
              <div className="flex overflow-x-auto gap-1 p-2 mb-2 scrollbar-hide -mx-1 px-1 sm:mx-0 sm:px-0 pb-3 sm:pb-2">
                 {[SystemType.CRM, SystemType.INVENTORY, SystemType.DASHBOARD, SystemType.CUSTOM].map((type) => {
                   const isSelected = systemType === type;
                   return ( <button key={type} onClick={() => { setSystemType(type); setSelectedTemplateIndex(null); }} className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${isSelected ? 'bg-slate-800 text-white shadow-md scale-105 ring-1 ring-slate-700' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50' }`}>{type.charAt(0) + type.slice(1).toLowerCase()}</button>);
                 })}
              </div>

              <div className="relative bg-slate-950 rounded-xl border border-slate-800 transition-colors focus-within:border-slate-700">
                <textarea value={description} onChange={(e) => { setDescription(e.target.value); if (selectedTemplateIndex !== null) setSelectedTemplateIndex(null);}} placeholder="Describe your system in detail (Thai or English)... Example: สร้างระบบยืม-คืนอุปกรณ์สำนักงาน" className="w-full h-32 bg-transparent text-slate-200 p-4 rounded-xl focus:outline-none resize-none placeholder:text-slate-600 sm:text-base text-[16px]"/>
                {imagePreview && (<div className="absolute bottom-20 left-4 right-4 z-10"><div className="inline-flex items-center bg-slate-900 rounded-lg border border-slate-700 p-2 pr-3 shadow-xl"><img src={imagePreview} alt="Preview" className="h-12 w-12 object-cover rounded bg-slate-800" /><div className="ml-3 flex-1 min-w-0"><p className="text-xs text-slate-400 truncate max-w-[150px]">{selectedFile?.name}</p><p className="text-[10px] text-slate-600">{(selectedFile!.size / 1024).toFixed(1)} KB</p></div><button onClick={clearFile} className="ml-2 p-1 hover:bg-slate-800 rounded-full text-slate-500 hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4" /></button></div></div>)}
                {showTools && (<div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2"><div className="border-t border-slate-800 pt-3 mt-2"><div className="mb-4"><div className="flex items-center gap-2 mb-3"><ShieldAlert className="w-4 h-4 text-rose-400" /><span className="text-sm font-semibold text-slate-300">AI Quality Auditor (Optional)</span></div><div className="grid grid-cols-2 md:grid-cols-3 gap-2">{AUDIT_OPTIONS.map(audit => (<button key={audit.id} onClick={() => toggleAudit(audit.id)} className={`px-3 py-2 rounded-lg text-xs border text-left transition-all duration-200 flex flex-col gap-1 ${selectedAudits.includes(audit.id) ? 'bg-rose-500/20 border-rose-500/50 text-rose-200' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500' }`} title={audit.desc}><div className="flex items-center gap-1.5 font-medium">{audit.icon}{audit.name}</div><span className="text-[10px] opacity-70 line-clamp-1">{audit.desc}</span></button>))}</div></div><div className="flex items-center gap-2 mb-3"><Layers className="w-4 h-4 text-purple-400" /><span className="text-sm font-semibold text-slate-300">Developer Tools</span></div><div className="space-y-3"><div><div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Front House</div><div className="flex flex-wrap gap-2">{DEV_TOOLS.frontend.map(tool => (<button key={tool.id} onClick={() => toggleTool(tool.id)} className={`px-2.5 py-1 rounded text-xs border transition-all duration-200 flex items-center gap-1.5 ${selectedTools.includes(tool.id) ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500' }`}>{tool.name}</button>))}</div></div><div><div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Back House</div><div className="flex flex-wrap gap-2">{DEV_TOOLS.backend.map(tool => (<button key={tool.id} onClick={() => toggleTool(tool.id)} className={`px-2.5 py-1 rounded text-xs border transition-all duration-200 flex items-center gap-1.5 ${selectedTools.includes(tool.id) ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500' }`}>{tool.name}</button>))}</div></div></div></div></div>)}
                <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                   <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                   <button onClick={() => fileInputRef.current?.click()} className={`p-2 rounded-lg transition-colors ${imagePreview ? 'text-blue-400 bg-blue-400/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`} title="Attach Image"><Paperclip className="w-5 h-5" /></button>
                  <button onClick={() => setShowTools(!showTools)} className={`p-2 rounded-lg transition-colors ${showTools ? 'text-purple-400 bg-purple-400/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`} title="Settings & Audit"><Settings2 className="w-5 h-5" /></button>
                </div>
                <div className="absolute bottom-3 right-3">
                  <button onClick={handleSubmit} disabled={(!description.trim() && !selectedFile) || isGenerating} className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg font-medium hover:from-blue-500 hover:to-emerald-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                    {isGenerating ? (<><Loader2 className="w-5 h-5 animate-spin" /><span>Creating...</span></>) : (<><Sparkles className="w-5 h-5" /><span>Generate System</span></>)}
                  </button>
                </div>
              </div>
            </div>
            {error && (<div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start space-x-3 text-rose-400 animate-in fade-in slide-in-from-bottom-2"><AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" /><span>{error}</span></div>)}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
               <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-lg border border-blue-500/30">
                      {result.system.type === SystemType.CRM ? <MessageCircle className="w-6 h-6 text-blue-400" /> :
                       result.system.type === SystemType.INVENTORY ? <QrCode className="w-6 h-6 text-emerald-400" /> :
                       result.system.type === SystemType.DASHBOARD ? <Briefcase className="w-6 h-6 text-purple-400" /> :
                       <Zap className="w-6 h-6 text-amber-400" />}
                    </div>
                    {result.system.title}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1 max-w-xl">{result.system.description}</p>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-xs text-slate-500 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                    {result.system.type}
                 </span>
               </div>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <CodeViewer system={result.system} onSave={handleStartNew} onUpdateSystem={handleUpdateSystem} />
                </div>
                <div className="lg:col-span-1 flex flex-col h-[600px] bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
                    <h3 className="font-semibold text-slate-200 flex items-center gap-2"><Bot className="w-4 h-4 text-emerald-400" />Refine with AI</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {chatHistory.length === 0 ? (<div className="text-center text-slate-500 text-sm py-8 space-y-2"><MessageSquare className="w-8 h-8 mx-auto opacity-50" /><p>Want changes? Just ask!</p><p className="text-xs opacity-70">"Add a phone number field"<br/>"Change header color to blue"</p></div>) : (chatHistory.map((turn, i) => (<div key={i} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${turn.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-300 rounded-bl-none border border-slate-700'}`}>{turn.content}</div></div>)))}
                    {isRefining && <div className="flex justify-start"><div className="rounded-2xl px-4 py-2.5 bg-slate-800 border border-slate-700"><Loader2 className="w-4 h-4 animate-spin text-slate-400"/></div></div> }
                    <div ref={chatEndRef} />
                  </div>
                  <div className="p-3 bg-slate-950 border-t border-slate-800">
                    <div className="relative">
                      <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !isRefining && handleSubmit()} placeholder="Type modification request..." className="w-full bg-slate-900 border border-slate-700 rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder:text-slate-600" disabled={isRefining}/>
                      <button onClick={handleSubmit} disabled={!description.trim() || isRefining} className="absolute right-1.5 top-1.5 p-1.5 bg-blue-600 rounded-full text-white disabled:opacity-50 disabled:bg-slate-700 hover:bg-blue-500 transition-colors">
                        {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        )}
      </main>

      <ProjectList 
        isOpen={showProjectList} 
        onClose={() => setShowProjectList(false)} 
        onLoad={(project) => {
          setResult({ 
            system: { ...project.system },
            cost: 0 
          });
          setShowProjectList(false);
          setChatHistory([]);
        }}
      />
    </div>
  );
}

export default App;
