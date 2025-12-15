
import React, { useState } from 'react';
import { 
  Banknote, 
  ToggleLeft, 
  ToggleRight, 
  Plus, 
  Trash2, 
  UploadCloud, 
  Save, 
  Info,
  ShieldCheck,
  FileText,
  Settings
} from 'lucide-react';

interface SalaryComponent {
  id: string;
  name: string;
  enabled: boolean;
  fixed?: boolean; // Cannot be deleted if true
}

const PayrollSettings: React.FC = () => {
  // --- State ---
  
  // 1. Salary Components
  const [earnings, setEarnings] = useState<SalaryComponent[]>([
    { id: '1', name: 'Basic Salary', enabled: true, fixed: true },
    { id: '2', name: 'House Rent Allowance (HRA)', enabled: true, fixed: true },
    { id: '3', name: 'Special Allowance', enabled: true },
    { id: '4', name: 'Conveyance Allowance', enabled: true },
    { id: '5', name: 'Medical Allowance', enabled: false },
  ]);

  const [deductions, setDeductions] = useState<SalaryComponent[]>([
    { id: '1', name: 'Provident Fund (PF)', enabled: true, fixed: true },
    { id: '2', name: 'Professional Tax (PT)', enabled: true, fixed: true },
    { id: '3', name: 'Tax Deducted at Source (TDS)', enabled: true, fixed: true },
    { id: '4', name: 'Salary Advance', enabled: true },
  ]);

  const [newEarning, setNewEarning] = useState('');
  const [newDeduction, setNewDeduction] = useState('');

  // 2. PF / ESI
  const [pfApplicable, setPfApplicable] = useState(true);
  const [esiApplicable, setEsiApplicable] = useState(false);
  const [pfEmployerContrib, setPfEmployerContrib] = useState('12');

  // 3. Payslip Template
  const [payslipHeader, setPayslipHeader] = useState('BharatBooks Pvt Ltd');
  const [payslipFooter, setPayslipFooter] = useState('This is a computer-generated payslip.');

  // 4. Compliance
  const [ptState, setPtState] = useState('Maharashtra');

  // --- Handlers ---

  const toggleComponent = (list: SalaryComponent[], setList: React.Dispatch<React.SetStateAction<SalaryComponent[]>>, id: string) => {
    setList(list.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const addComponent = (
    name: string, 
    setName: (val: string) => void, 
    list: SalaryComponent[], 
    setList: React.Dispatch<React.SetStateAction<SalaryComponent[]>>
  ) => {
    if (!name.trim()) return;
    const newItem: SalaryComponent = {
      id: Date.now().toString(),
      name: name.trim(),
      enabled: true
    };
    setList([...list, newItem]);
    setName('');
  };

  const removeComponent = (
    id: string, 
    list: SalaryComponent[], 
    setList: React.Dispatch<React.SetStateAction<SalaryComponent[]>>
  ) => {
    if (confirm('Remove this component?')) {
        setList(list.filter(c => c.id !== id));
    }
  };

  const handleSave = () => {
      alert("Payroll settings saved successfully!");
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payroll Settings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure salary structures, compliance, and payslip templates.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors"
        >
          <Save size={18} className="mr-2" /> Save Settings
        </button>
      </div>

      {/* 1. Salary Components */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
           <Banknote size={18} className="mr-2 text-green-600 dark:text-green-400" />
           <h3 className="font-bold text-gray-900 dark:text-white">Salary Components</h3>
        </div>
        
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Earnings */}
            <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Earnings</h4>
                <div className="space-y-2 mb-4">
                    {earnings.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-100 dark:border-gray-800">
                            <span className={`text-sm font-medium ${item.enabled ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'}`}>
                                {item.name}
                            </span>
                            <div className="flex items-center space-x-3">
                                <button onClick={() => toggleComponent(earnings, setEarnings, item.id)} className="text-gray-500 hover:text-primary-600 transition-colors">
                                    {item.enabled ? <ToggleRight size={24} className="text-green-500" /> : <ToggleLeft size={24} />}
                                </button>
                                {!item.fixed && (
                                    <button onClick={() => removeComponent(item.id, earnings, setEarnings)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex space-x-2">
                    <input 
                        type="text" 
                        placeholder="Add Earning (e.g. Bonus)" 
                        className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                        value={newEarning}
                        onChange={(e) => setNewEarning(e.target.value)}
                    />
                    <button 
                        onClick={() => addComponent(newEarning, setNewEarning, earnings, setEarnings)}
                        className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>

            {/* Deductions */}
            <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Deductions</h4>
                <div className="space-y-2 mb-4">
                    {deductions.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-100 dark:border-gray-800">
                            <span className={`text-sm font-medium ${item.enabled ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'}`}>
                                {item.name}
                            </span>
                            <div className="flex items-center space-x-3">
                                <button onClick={() => toggleComponent(deductions, setDeductions, item.id)} className="text-gray-500 hover:text-primary-600 transition-colors">
                                    {item.enabled ? <ToggleRight size={24} className="text-green-500" /> : <ToggleLeft size={24} />}
                                </button>
                                {!item.fixed && (
                                    <button onClick={() => removeComponent(item.id, deductions, setDeductions)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex space-x-2">
                    <input 
                        type="text" 
                        placeholder="Add Deduction (e.g. Loan)" 
                        className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                        value={newDeduction}
                        onChange={(e) => setNewDeduction(e.target.value)}
                    />
                    <button 
                        onClick={() => addComponent(newDeduction, setNewDeduction, deductions, setDeductions)}
                        className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* 2. PF / ESI Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
           <ShieldCheck size={18} className="mr-2 text-blue-600 dark:text-blue-400" />
           <h3 className="font-bold text-gray-900 dark:text-white">PF & ESI Configuration</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <label className="text-sm font-medium text-gray-900 dark:text-white block">Provident Fund (PF)</label>
                        <p className="text-xs text-gray-500">Enable if your organization is registered for PF.</p>
                    </div>
                    <button onClick={() => setPfApplicable(!pfApplicable)} className="text-gray-500 hover:text-primary-600 transition-colors">
                        {pfApplicable ? <ToggleRight size={32} className="text-primary-600" /> : <ToggleLeft size={32} />}
                    </button>
                </div>
                {pfApplicable && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                        <label className="block text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">Employer Contribution (%)</label>
                        <input 
                            type="number" 
                            value={pfEmployerContrib}
                            onChange={(e) => setPfEmployerContrib(e.target.value)}
                            className="w-full bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-700 rounded-md px-3 py-1.5 text-sm text-gray-900 dark:text-white"
                        />
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <label className="text-sm font-medium text-gray-900 dark:text-white block">ESI Scheme</label>
                        <p className="text-xs text-gray-500">Employee State Insurance applicability.</p>
                    </div>
                    <button onClick={() => setEsiApplicable(!esiApplicable)} className="text-gray-500 hover:text-primary-600 transition-colors">
                        {esiApplicable ? <ToggleRight size={32} className="text-primary-600" /> : <ToggleLeft size={32} />}
                    </button>
                </div>
                {esiApplicable && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 flex items-start">
                        <Info size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                        Standard ESI rates will be applied (0.75% Employee, 3.25% Employer).
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* 3. Payslip Template */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
         <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
           <FileText size={18} className="mr-2 text-orange-600 dark:text-orange-400" />
           <h3 className="font-bold text-gray-900 dark:text-white">Payslip Template</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Logo</label>
                 <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer">
                     <UploadCloud className="text-gray-400 mb-2" size={24} />
                     <p className="text-xs text-gray-500 dark:text-gray-400">Click to upload logo (PNG/JPG)</p>
                 </div>
             </div>
             <div className="space-y-4">
                 <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payslip Header Text</label>
                     <input 
                        type="text" 
                        value={payslipHeader}
                        onChange={(e) => setPayslipHeader(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:text-white"
                     />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payslip Footer Note</label>
                     <textarea 
                        rows={3}
                        value={payslipFooter}
                        onChange={(e) => setPayslipFooter(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:text-white resize-none"
                     />
                 </div>
             </div>
        </div>
      </div>

      {/* 4. Compliance Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
         <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
           <Settings size={18} className="mr-2 text-purple-600 dark:text-purple-400" />
           <h3 className="font-bold text-gray-900 dark:text-white">Compliance Settings</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Professional Tax (PT) State</label>
                 <select 
                    value={ptState}
                    onChange={(e) => setPtState(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:text-white"
                 >
                     <option>Maharashtra</option>
                     <option>Karnataka</option>
                     <option>Tamil Nadu</option>
                     <option>Gujarat</option>
                     <option>West Bengal</option>
                 </select>
                 <p className="text-xs text-gray-500 mt-1">PT slabs will be applied based on state rules.</p>
             </div>
             <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default TDS Regime</label>
                 <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                     New Tax Regime (Default)
                 </div>
                 <p className="text-xs text-gray-500 mt-1">Employees can override this in their profile.</p>
             </div>
        </div>
      </div>

    </div>
  );
};

export default PayrollSettings;
