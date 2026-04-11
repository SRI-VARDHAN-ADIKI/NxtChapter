import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function MainLayout({ children }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex">
      {/* Sidebar */}
      <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${isExpanded ? 'ml-64' : 'ml-20'}`}
      >
        <TopBar />
        <main className="flex-1 p-6 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
