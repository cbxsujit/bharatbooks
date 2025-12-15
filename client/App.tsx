import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import PlaceholderPage from './components/PlaceholderPage';
import Dashboard from './components/Dashboard';
import Sales from './components/Sales';
import Purchases from './components/Purchases';
import Accounting from './components/Accounting';
import Inventory from './components/Inventory';
import Payroll from './components/Payroll';
import Compliance from './components/Compliance';
import Reports from './components/Reports';
import AiAssistantPage from './components/AiAssistantPage';
import AiAssistantDrawer from './components/AiAssistantDrawer';
import Settings from './components/Settings';
import { NAV_ITEMS, DUMMY_COMPANIES } from './constants';
import { PageId, Company, Period } from './types';
import { Command } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [activePage, setActivePage] = useState<PageId>(PageId.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company>(DUMMY_COMPANIES[0]);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('This Month');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  
  // Global Action State for shortcuts
  const [globalAction, setGlobalAction] = useState<string | null>(null);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Responsive check
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handlers
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleNavigate = (page: PageId) => {
    setActivePage(page);
  };

  const toggleAiDrawer = () => {
    setIsAiDrawerOpen(prev => !prev);
  };

  const resetGlobalAction = () => setGlobalAction(null);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isAlt = e.altKey; // Windows Alt / Mac Option
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      let actionName = '';
      let preventDefault = true;

      // Navigation Shortcuts
      if (isAlt && !isCtrlOrCmd) {
        switch(key) {
          case 'k':
            actionName = 'Command Palette';
            break;
          case 'j':
            actionName = 'Toggle AI Assistant';
            toggleAiDrawer();
            break;
          case 'd':
            actionName = 'Dashboard';
            handleNavigate(PageId.DASHBOARD);
            break;
          case 's':
            actionName = 'Sales & Invoicing';
            handleNavigate(PageId.SALES);
            break;
          case 'p':
            actionName = 'Purchases';
            handleNavigate(PageId.PURCHASES);
            break;
          case 'a':
            actionName = 'Accounting & Ledger';
            handleNavigate(PageId.ACCOUNTING);
            break;
          case 'i':
            actionName = 'Inventory';
            handleNavigate(PageId.INVENTORY);
            break;
          case 'y':
            actionName = 'Payroll';
            handleNavigate(PageId.PAYROLL);
            break;
          case 'r':
            actionName = 'Reports';
            handleNavigate(PageId.REPORTS);
            break;
          case 't':
            actionName = 'Settings';
            handleNavigate(PageId.SETTINGS);
            break;
          // Creation Shortcuts
          case 'n':
            actionName = 'New Invoice';
            handleNavigate(PageId.SALES);
            setGlobalAction('new-invoice');
            break;
          case 'b':
            actionName = 'New Purchase Bill';
            handleNavigate(PageId.PURCHASES);
            setGlobalAction('new-bill');
            break;
          default:
            preventDefault = false;
            break;
        }
      } 
      // Special case for Ctrl+J / Cmd+J (Journal)
      else if (isCtrlOrCmd && key === 'j') {
          actionName = 'New Journal Entry';
          handleNavigate(PageId.ACCOUNTING);
          setGlobalAction('new-journal');
      }
      else {
        preventDefault = false;
      }

      if (preventDefault) {
        e.preventDefault();
      }

      if (actionName) {
        setToastMessage(actionName);
        const timer = setTimeout(() => setToastMessage(null), 2500);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Content Render Logic
  const renderContent = () => {
    if (activePage === PageId.DASHBOARD) return <Dashboard />;
    if (activePage === PageId.SALES) return <Sales globalAction={globalAction} resetGlobalAction={resetGlobalAction} />;
    if (activePage === PageId.PURCHASES) return <Purchases globalAction={globalAction} resetGlobalAction={resetGlobalAction} />;
    if (activePage === PageId.ACCOUNTING) return <Accounting globalAction={globalAction} resetGlobalAction={resetGlobalAction} />;
    if (activePage === PageId.INVENTORY) return <Inventory />;
    if (activePage === PageId.PAYROLL) return <Payroll />;
    if (activePage === PageId.COMPLIANCE) return <Compliance />;
    if (activePage === PageId.REPORTS) return <Reports />;
    if (activePage === PageId.AI_ASSISTANT) return <AiAssistantPage />;
    if (activePage === PageId.SETTINGS) return <Settings />;

    const activeItem = NAV_ITEMS.find(item => item.id === activePage);
    if (!activeItem) return null;

    return (
      <PlaceholderPage 
        title={activeItem.label} 
        description={activeItem.description} 
        icon={activeItem.icon} 
      />
    );
  };

  // Layout Calculation
  const mainContentMargin = isMobile ? 'ml-0' : (isSidebarOpen ? 'ml-64' : 'ml-20');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        activePage={activePage} 
        onNavigate={handleNavigate} 
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <TopBar 
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          onAiClick={toggleAiDrawer}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Global AI Drawer */}
      <AiAssistantDrawer 
        isOpen={isAiDrawerOpen} 
        onClose={() => setIsAiDrawerOpen(false)} 
      />

      {/* Shortcut Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] animate-bounce-in">
          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-gray-700 dark:border-gray-200">
             <div className="p-1.5 bg-gray-800 dark:bg-gray-100 rounded text-gray-400 dark:text-gray-500">
               <Command size={14} /> 
             </div>
             <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;