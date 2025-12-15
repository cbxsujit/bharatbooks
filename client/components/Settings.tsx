
import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  Bot, 
  Bell, 
  Shield, 
  CreditCard,
  Settings as SettingsIcon,
  ChevronRight,
  Banknote,
  Database,
  History
} from 'lucide-react';
import AiSettings from './AiSettings';
import PayrollSettings from './PayrollSettings';
import CustomerMaster from './CustomerMaster';
import UserRoles from './UserRoles';
import AuditLogs from './AuditLogs';

type SettingsTab = 'general' | 'users' | 'company' | 'ai' | 'notifications' | 'billing' | 'payroll' | 'master-data' | 'audit';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'company', label: 'Company Profile', icon: Building2 },
    { id: 'users', label: 'Users & Roles', icon: User },
    { id: 'master-data', label: 'Master Data', icon: Database },
    { id: 'audit', label: 'Audit Logs', icon: History },
    { id: 'payroll', label: 'Payroll Settings', icon: Banknote },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Plans & Billing', icon: CreditCard },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'ai':
        return <AiSettings />;
      case 'payroll':
        return <PayrollSettings />;
      case 'master-data':
        return <CustomerMaster />;
      case 'users':
        return <UserRoles />;
      case 'audit':
        return <AuditLogs />;
      default:
        const activeItem = tabs.find(t => t.id === activeTab);
        const ActiveIcon = activeItem ? activeItem.icon : SettingsIcon;
        
        return (
          <div className="flex flex-col items-center justify-center h-[400px] text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <ActiveIcon size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {activeItem?.label || 'Settings'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs">
              This section is currently under development. Please check back later.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight px-1">Settings & Administration</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 px-1 mt-1">Manage your company preferences and application configuration.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 h-full">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <tab.icon size={18} className={`mr-3 ${activeTab === tab.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
                  {tab.label}
                </div>
                {activeTab === tab.id && <ChevronRight size={14} className="text-primary-500" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 max-w-5xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
