
import React, { useState } from 'react';
import { 
  Bot, 
  Shield, 
  LayoutTemplate, 
  Trash2, 
  RotateCcw,
  Save,
  CheckCircle2,
  Lock
} from 'lucide-react';

type ResponseStyle = 'concise' | 'detailed' | 'tabular' | 'charts';

const AiSettings: React.FC = () => {
  // State
  const [allowAllUsers, setAllowAllUsers] = useState(true);
  const [restrictSensitive, setRestrictSensitive] = useState(true);
  const [responseStyle, setResponseStyle] = useState<ResponseStyle>('detailed');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear the global AI chat history for this account? This cannot be undone.")) {
      alert("Chat history cleared.");
    }
  };

  const handleReset = () => {
    setAllowAllUsers(true);
    setRestrictSensitive(true);
    setResponseStyle('detailed');
    alert("Preferences reset to default.");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Assistant Settings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure permissions and behavior for BharatBooks AI.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          {isSaving ? 'Saving...' : <><Save size={16} className="mr-2" /> Save Changes</>}
        </button>
      </div>

      {/* Permissions Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
          <Shield size={16} className="mr-2 text-primary-500" />
          Permissions & Security
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <label htmlFor="allowAll" className="text-sm font-medium text-gray-900 dark:text-white block mb-1">
                Allow all users to access AI Assistant
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
                If disabled, only users with the 'Admin' or 'Manager' role will see the AI Assistant icon.
              </p>
            </div>
            <button 
              id="allowAll"
              onClick={() => setAllowAllUsers(!allowAllUsers)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${allowAllUsers ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${allowAllUsers ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-6 flex items-start justify-between">
            <div>
              <label htmlFor="restrictData" className="text-sm font-medium text-gray-900 dark:text-white block mb-1">
                Restrict data-sensitive queries by role
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
                Automatically block queries related to Payroll, Bank Balances, and Profit & Loss for non-admin users.
              </p>
            </div>
            <button 
              id="restrictData"
              onClick={() => setRestrictSensitive(!restrictSensitive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${restrictSensitive ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${restrictSensitive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Response Style Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
          <LayoutTemplate size={16} className="mr-2 text-blue-500" />
          Response Style
        </h3>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Choose how you want the AI to format its answers by default.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: 'concise', label: 'Concise', desc: 'Short, direct answers without fluff.' },
            { id: 'detailed', label: 'Detailed', desc: 'Comprehensive explanations with context.' },
            { id: 'tabular', label: 'Tabular Preferred', desc: 'Use tables whenever data permits.' },
            { id: 'charts', label: 'Charts Preferred', desc: 'Visualize data trends automatically.' },
          ].map((option) => (
            <div 
              key={option.id}
              onClick={() => setResponseStyle(option.id as ResponseStyle)}
              className={`cursor-pointer p-4 rounded-lg border transition-all ${
                responseStyle === option.id 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500' 
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center mb-1">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-2 ${responseStyle === option.id ? 'border-primary-600' : 'border-gray-400'}`}>
                  {responseStyle === option.id && <div className="w-2 h-2 rounded-full bg-primary-600" />}
                </div>
                <span className={`text-sm font-medium ${responseStyle === option.id ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'}`}>
                  {option.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                {option.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 p-6">
        <h3 className="text-sm font-bold text-red-800 dark:text-red-300 uppercase tracking-wider mb-4 flex items-center">
          <Lock size={16} className="mr-2" />
          Admin Actions
        </h3>
        
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleClearHistory}
            className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={16} className="mr-2" />
            Clear AI Chat History
          </button>
          
          <button 
            onClick={handleReset}
            className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw size={16} className="mr-2" />
            Reset AI Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiSettings;
