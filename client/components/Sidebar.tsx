import React from 'react';
import { NAV_ITEMS } from '../constants';
import { PageId } from '../types';
import { ChevronLeft, Menu } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  toggleSidebar: () => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activePage, onNavigate, toggleSidebar, isMobile }) => {
  
  // On mobile, we overlay. On desktop, we shift layout.
  // If it's mobile and not open, we return null or hidden styles.
  // For a smoother transition, we use CSS transforms.

  const sidebarClasses = `
    fixed top-0 left-0 z-40 h-screen bg-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col
    ${isOpen ? 'w-64 translate-x-0' : isMobile ? '-translate-x-full w-64' : 'w-20 translate-x-0'}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800 bg-gray-950">
            <div className={`flex items-center space-x-2 overflow-hidden whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 w-full' : 'opacity-0 w-0'}`}>
                <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-lg">B</span>
                </div>
                <span className="font-bold text-lg tracking-wide text-white">BharatBooks</span>
            </div>
            
            {!isOpen && !isMobile && (
                 <div className="w-full flex justify-center">
                     <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center font-bold text-lg">B</div>
                 </div>
            )}

            <button 
              onClick={toggleSidebar}
              className={`p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors ${!isOpen && !isMobile ? 'hidden' : ''}`}
            >
                {isMobile ? <Menu size={20} /> : <ChevronLeft size={20} />}
            </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
          <ul className="space-y-1 px-2">
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                        onNavigate(item.id);
                        if (isMobile) toggleSidebar();
                    }}
                    className={`
                      w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative
                      ${isActive 
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                    `}
                    title={!isOpen ? item.label : ''}
                  >
                    <item.icon 
                      size={22} 
                      className={`flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    
                    <span className={`ml-3 font-medium whitespace-nowrap transition-all duration-300 origin-left ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 w-0 overflow-hidden'}`}>
                      {item.label}
                    </span>

                    {/* Active Indicator strip for collapsed mode */}
                    {isActive && !isOpen && !isMobile && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-950">
            <div className={`flex items-center ${isOpen ? 'justify-start' : 'justify-center'}`}>
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-gray-800">
                    AD
                 </div>
                 <div className={`ml-3 overflow-hidden transition-all duration-300 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
                     <p className="text-sm font-medium text-white truncate">Admin User</p>
                     <p className="text-xs text-gray-500 truncate">admin@bharatbooks.in</p>
                 </div>
            </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;