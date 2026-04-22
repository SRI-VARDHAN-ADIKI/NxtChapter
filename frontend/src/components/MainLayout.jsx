import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function MainLayout({ children }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex relative overflow-hidden">
      {/* Dynamic Pastel Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 -left-4 w-[400px] h-[400px] bg-accent-primary/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob" />
        <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-[20%] w-[400px] h-[400px] bg-orange-200/40 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob animation-delay-4000" />
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-sky-200/40 rounded-[40%_60%_70%_30%] mix-blend-multiply filter blur-[130px] opacity-60 animate-blob" />
      </div>

      {/* Sidebar */}
      <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 relative z-10 ${isExpanded ? 'ml-64' : 'ml-20'}`}
      >
        <TopBar />
        <main className="flex-1 p-6 md:p-8 lg:p-10 relative z-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
