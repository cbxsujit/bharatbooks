import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Save,
  Info
} from 'lucide-react';

// --- Types ---

interface RecurringTemplate {
  id: string;
  templateName: string;
  customer: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
  nextDate: string;
  lastDate: string;
  status: 'Active' | 'Paused';
  amount: string;
}

// --- Mock Data ---

const MOCK_TEMPLATES: RecurringTemplate[] = [
  { id: '1', templateName: 'Monthly Retainer - Acme', customer: 'Acme Traders India Pvt Ltd', frequency: 'Monthly', nextDate: '2024-02-01', lastDate: '2024-01-01', status: 'Active', amount: '₹ 25,000' },
  { id: '2', templateName: 'Weekly Maintenance', customer: 'Bharat Tech Solutions', frequency: 'Weekly', nextDate: '2024-02-05', lastDate: '2024-01-29', status: 'Active', amount: '₹ 5,000' },
  { id: '3', templateName: 'Quarterly AMC', customer: 'Global Exports & Co.', frequency: 'Custom', nextDate: '2024-04-01', lastDate: '2024-01-01', status: 'Paused', amount: '₹ 1,25,000' },
];

const MOCK_INVOICES_LIST = [
  { id: 'INV-001', label: 'INV-001 - Acme Traders (₹ 25,000)' },
  { id: 'INV-002', label: 'INV-002 - Bharat Tech (₹ 5,000)' },
  { id: 'INV-003', label: 'INV-003 - Global Exports (₹ 1,25,000)' },
];

// --- Sub-Components ---

const TemplateForm: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const [frequency, setFrequency] = useState('Monthly');
  const [noEndDate, setNoEndDate] = useState(true);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
            <button 
                onClick={onCancel}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Recurring Template</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Automate your invoicing schedule</p>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
          <div className="max-w-3xl space-y-8">
              
              {/* Section 1: Base Info */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                          1
                      </div>
                      Template Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template Name</label>
                          <input type="text" placeholder="e.g., Monthly Retainer for Acme" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Invoice</label>
                          <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                              <option value="">Select an existing invoice...</option>
                              {MOCK_INVOICES_LIST.map(inv => <option key={inv.id} value={inv.id}>{inv.label}</option>)}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">Items and rates will be copied from this invoice.</p>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
                          <input type="text" value="Acme Traders India Pvt Ltd" readOnly className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                      </div>
                  </div>
              </div>

              {/* Section 2: Schedule */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 mr-3">
                          2
                      </div>
                      Schedule
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
                          <select 
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                          >
                              <option value="Daily">Daily</option>
                              <option value="Weekly">Weekly</option>
                              <option value="Monthly">Monthly</option>
                              <option value="Custom">Custom</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Invoice Date</label>
                          <input type="date" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                      </div>
                      
                      {frequency === 'Monthly' && (
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day of Month</label>
                              <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                                  <option value="1">1st of every month</option>
                                  <option value="15">15th of every month</option>
                                  <option value="last">Last day of month</option>
                              </select>
                          </div>
                      )}

                      {frequency === 'Weekly' && (
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day of Week</label>
                              <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                                  <option value="Mon">Monday</option>
                                  <option value="Tue">Tuesday</option>
                                  <option value="Fri">Friday</option>
                              </select>
                          </div>
                      )}

                      <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                              <input type="date" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                              <div className="flex items-center space-x-2">
                                  <input 
                                    type="date" 
                                    disabled={noEndDate}
                                    className={`w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none ${noEndDate ? 'opacity-50 cursor-not-allowed' : ''}`} 
                                  />
                                  <div className="flex items-center h-full pt-1">
                                      <input 
                                        type="checkbox" 
                                        id="noEnd" 
                                        checked={noEndDate} 
                                        onChange={(e) => setNoEndDate(e.target.checked)}
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300" 
                                      />
                                      <label htmlFor="noEnd" className="ml-2 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">No End Date</label>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Section 3: Automation */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 mr-3">
                          3
                      </div>
                      Automation & Notifications
                  </h3>
                  <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <input type="checkbox" defaultChecked id="autoGen" className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300" />
                          <div>
                              <label htmlFor="autoGen" className="block text-sm font-medium text-gray-900 dark:text-white">Auto-generate Invoice</label>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Invoice will be created automatically on the scheduled date.</p>
                          </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <input type="checkbox" id="autoEmail" className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300" />
                          <div>
                              <label htmlFor="autoEmail" className="block text-sm font-medium text-gray-900 dark:text-white">Auto-send via Email</label>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Email the invoice to the customer's registered email address.</p>
                          </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <input type="checkbox" id="autoWhatsapp" className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300" />
                          <div>
                              <label htmlFor="autoWhatsapp" className="block text-sm font-medium text-gray-900 dark:text-white">Auto-send via WhatsApp</label>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Send a WhatsApp notification with the invoice link.</p>
                          </div>
                      </div>

                      <div className="pt-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Generation Time</label>
                          <div className="flex items-center space-x-2 max-w-xs">
                              <Clock size={16} className="text-gray-400" />
                              <input type="time" defaultValue="09:00" className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button 
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
              Cancel
          </button>
          <button 
            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm flex items-center"
          >
              <Save size={18} className="mr-2" />
              Create Template
          </button>
      </div>
    </div>
  );
};

// --- Main Component ---

const RecurringInvoices: React.FC = () => {
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [templates, setTemplates] = useState<RecurringTemplate[]>(MOCK_TEMPLATES);

  const toggleStatus = (id: string) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, status: t.status === 'Active' ? 'Paused' : 'Active' } : t));
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  if (mode === 'create') {
    return <TemplateForm onCancel={() => setMode('list')} />;
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
        
        {/* Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start space-x-3">
            <Info className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" size={20} />
            <div>
                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300">Automated Invoicing</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-0.5">
                    BharatBooks will automatically generate and optionally send invoices based on the templates below. 
                    Ensure your customer contacts and stock levels are up to date.
                </p>
            </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search templates..." 
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <Filter size={18} />
                </button>
                <button 
                    onClick={() => setMode('create')}
                    className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors whitespace-nowrap"
                >
                    <Plus size={18} className="mr-2" />
                    New Recurring Template
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-3">Template Name</th>
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3">Frequency</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Next Date</th>
                            <th className="px-6 py-3">Last Generated</th>
                            <th className="px-6 py-3 text-center">Status</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                        {templates.map((template) => (
                            <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{template.templateName}</td>
                                <td className="px-6 py-4">{template.customer}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <RefreshCw size={14} className="text-gray-400" />
                                        <span>{template.frequency}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium">{template.amount}</td>
                                <td className="px-6 py-4 text-primary-600 dark:text-primary-400">{template.nextDate}</td>
                                <td className="px-6 py-4 text-gray-500">{template.lastDate}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                        template.status === 'Active' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/30' 
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                                    }`}>
                                        {template.status === 'Active' ? <CheckCircle2 size={12} className="mr-1" /> : <Pause size={12} className="mr-1" />}
                                        {template.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button 
                                            onClick={() => toggleStatus(template.id)}
                                            className="p-1.5 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" 
                                            title={template.status === 'Active' ? "Pause" : "Resume"}
                                        >
                                            {template.status === 'Active' ? <Pause size={16} /> : <Play size={16} />}
                                        </button>
                                        <button className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Edit">
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            onClick={() => deleteTemplate(template.id)}
                                            className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors" 
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {templates.length === 0 && (
                             <tr>
                                 <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                     <div className="flex flex-col items-center justify-center">
                                         <RefreshCw size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                                         <p className="text-lg font-medium">No recurring templates found</p>
                                         <p className="text-sm mt-1">Create a new template to automate your invoices.</p>
                                     </div>
                                 </td>
                             </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default RecurringInvoices;
