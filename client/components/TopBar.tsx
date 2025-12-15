import React from 'react';
import { 
  Bell, 
  Search, 
  Moon, 
  Sun, 
  MessageSquare, 
  Menu,
  ChevronDown
} from 'lucide-react';
import { Company, Period } from '../types';
import { DUMMY_COMPANIES, PERIOD_OPTIONS } from '../constants';

interface TopBarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  selectedCompany: Company;
  setSelectedCompany: (c: Company) => void;
  selectedPeriod: Period;
  setSelectedPeriod: (p: Period) => void;
  onAiClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  isSidebarOpen,
  toggleSidebar,
  isDarkMode,
  toggleDarkMode,
  selectedCompany,
  setSelectedCompany,
  selectedPeriod,
  setSelectedPeriod,
  onAiClick
}) => {
  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sticky top-0 z-20 shadow-sm transition-colors duration-200">
      
      {/* Left: Toggle & Title/Breadcrumb */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <Menu size={20} />
        </button>

        {/* Company Selector */}
        <div className="relative group hidden sm:block">
            <button className="flex items-center space-x-2 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <span>{selectedCompany.name}</span>
                <ChevronDown size={16} />
            </button>
            
            {/* Dropdown */}
            <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 hidden group-hover:block animate-fade-in z-50">
                {DUMMY_COMPANIES.map(company => (
                    <button 
                        key={company.id}
                        onClick={() => setSelectedCompany(company)}
                        className={`block w-full text-left px-4 py-2 text-sm ${selectedCompany.id === company.id ? 'bg-red-50 text-primary-700 dark:bg-red-900/20 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        {company.name}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Middle: Global Search (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-xl mx-4">
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
            </div>
            <input 
                type="text" 
                placeholder="Type / to search (e.g., 'Invoice #1024', 'GST Report')" 
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg leading-5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                 <kbd className="inline-flex items-center border border-gray-200 dark:border-gray-600 rounded px-2 text-xs font-sans font-medium text-gray-400">
                    /
                 </kbd>
            </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        
        {/* Period Filter */}
        <div className="relative group hidden lg:block">
             <button className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <span>{selectedPeriod}</span>
                <ChevronDown size={12} />
            </button>
            <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 hidden group-hover:block z-50">
                {PERIOD_OPTIONS.map(period => (
                     <button 
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`block w-full text-left px-4 py-2 text-sm ${selectedPeriod === period ? 'text-primary-600 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                     >
                        {period}
                     </button>
                ))}
            </div>
        </div>

        {/* AI Quick Chat */}
        <button 
            onClick={onAiClick}
            className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors relative group"
            title="AI Assistant"
        >
            <MessageSquare size={20} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white dark:ring-gray-800 bg-green-500 transform translate-x-1/4 -translate-y-1/4"></span>
        </button>

        {/* Notifications */}
        <button className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full ring-2 ring-white dark:ring-gray-800 bg-red-500"></span>
        </button>

        {/* Dark Mode Toggle */}
        <button 
            onClick={toggleDarkMode}
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default TopBar;