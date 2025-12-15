import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description, icon: Icon }) => {
  return (
    <div className="flex flex-col h-full p-8 animate-fade-in">
      <div className="flex items-center space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-primary-600 dark:text-primary-400">
          <Icon size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
            <Icon className="w-12 h-12 text-gray-300 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title} Module
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          This module is currently under development. It will provide comprehensive tools for {description.toLowerCase()}
        </p>
        <button className="mt-8 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition-colors shadow-sm">
          Get Notified When Ready
        </button>
      </div>
    </div>
  );
};

export default PlaceholderPage;