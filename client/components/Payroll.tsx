
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  User, 
  Briefcase, 
  CreditCard, 
  Calendar, 
  Phone, 
  Mail, 
  X, 
  Edit, 
  Trash2, 
  Building2,
  CheckCircle2,
  XCircle,
  Banknote,
  Clock,
  Save,
  Landmark,
  ShieldCheck,
  ChevronDown,
  Calculator,
  RotateCcw,
  Play,
  FileText,
  Download,
  Check
} from 'lucide-react';

// --- Types ---

type EmployeeStatus = 'Active' | 'Inactive' | 'On Leave';

interface Employee {
  id: string;
  name: string;
  code: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  status: EmployeeStatus;
  joinDate: string;
  pan: string;
  bankName: string;
  accountNumber: string;
  ctc: number;
}

interface PayrollEntry {
  id: string;
  employeeId: string;
  name: string;
  gross: number;
  deductions: number;
  net: number;
  status: 'Pending' | 'Generated';
}

// --- Mock Data ---

const MOCK_EMPLOYEES: Employee[] = [
  { 
    id: '1', 
    name: 'Rajesh Kumar', 
    code: 'EMP-001', 
    designation: 'Senior Developer', 
    department: 'Engineering', 
    email: 'rajesh.k@bharatbooks.in', 
    phone: '+91 98765 43210', 
    status: 'Active', 
    joinDate: '2022-03-15', 
    pan: 'ABCDE1234F', 
    bankName: 'HDFC Bank', 
    accountNumber: '501000998877', 
    ctc: 1200000 
  },
  { 
    id: '2', 
    name: 'Sneha Gupta', 
    code: 'EMP-002', 
    designation: 'UI/UX Designer', 
    department: 'Design', 
    email: 'sneha.g@bharatbooks.in', 
    phone: '+91 98765 12345', 
    status: 'Active', 
    joinDate: '2022-06-01', 
    pan: 'FGHIJ5678K', 
    bankName: 'ICICI Bank', 
    accountNumber: '000405060708', 
    ctc: 950000 
  },
  { 
    id: '3', 
    name: 'Amit Singh', 
    code: 'EMP-003', 
    designation: 'Sales Manager', 
    department: 'Sales', 
    email: 'amit.s@bharatbooks.in', 
    phone: '+91 99887 77665', 
    status: 'Active', 
    joinDate: '2021-11-10', 
    pan: 'KLMNO9012P', 
    bankName: 'SBI', 
    accountNumber: '200300400500', 
    ctc: 1500000 
  },
  { 
    id: '4', 
    name: 'Priya Sharma', 
    code: 'EMP-004', 
    designation: 'HR Executive', 
    department: 'HR', 
    email: 'priya.s@bharatbooks.in', 
    phone: '+91 88776 66554', 
    status: 'On Leave', 
    joinDate: '2023-01-05', 
    pan: 'QRSTU3456V', 
    bankName: 'Axis Bank', 
    accountNumber: '919191919191', 
    ctc: 600000 
  },
  { 
    id: '5', 
    name: 'Vikram Malhotra', 
    code: 'EMP-005', 
    designation: 'Intern', 
    department: 'Engineering', 
    email: 'vikram.m@bharatbooks.in', 
    phone: '+91 77665 55443', 
    status: 'Inactive', 
    joinDate: '2023-09-01', 
    pan: 'WXYZA7890B', 
    bankName: 'Kotak Mahindra', 
    accountNumber: '8080808080', 
    ctc: 300000 
  }
];

const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'HR', 'Design', 'Finance', 'Operations'];

// --- Helper Components ---

const StatusBadge: React.FC<{ status: EmployeeStatus }> = ({ status }) => {
  const styles = {
    Active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/30',
    Inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
    'On Leave': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status === 'Active' && <CheckCircle2 size={12} className="mr-1" />}
      {status === 'Inactive' && <XCircle size={12} className="mr-1" />}
      {status === 'On Leave' && <Clock size={12} className="mr-1" />}
      {status}
    </span>
  );
};

// --- Monthly Payroll Component ---

const MonthlyPayroll: React.FC<{ employees: Employee[] }> = ({ employees }) => {
  const [month, setMonth] = useState('January 2024');
  const [isGenerated, setIsGenerated] = useState(false);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);

  useEffect(() => {
    // Mock calculation: Monthly Gross = CTC / 12, Deductions = 10% of Gross
    const entries: PayrollEntry[] = employees.filter(e => e.status !== 'Inactive').map(emp => {
      const monthlyGross = Math.round(emp.ctc / 12);
      const deductions = Math.round(monthlyGross * 0.1);
      return {
        id: emp.id,
        employeeId: emp.id,
        name: emp.name,
        gross: monthlyGross,
        deductions: deductions,
        net: monthlyGross - deductions,
        status: 'Pending'
      };
    });
    setPayrollEntries(entries);
    setIsGenerated(false);
  }, [employees, month]);

  const handleGenerate = () => {
    setIsGenerated(true);
    setPayrollEntries(prev => prev.map(e => ({ ...e, status: 'Generated' })));
  };

  const totals = useMemo(() => {
    return payrollEntries.reduce((acc, curr) => ({
      gross: acc.gross + curr.gross,
      deductions: acc.deductions + curr.deductions,
      net: acc.net + curr.net
    }), { gross: 0, deductions: 0, net: 0 });
  }, [payrollEntries]);

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer dark:text-white"
            >
              <option>January 2024</option>
              <option>February 2024</option>
              <option>March 2024</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {isGenerated && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-900/30">
              <CheckCircle2 size={12} className="mr-1" /> Payroll Generated
            </span>
          )}
        </div>
        <div className="flex gap-3">
           {isGenerated && (
             <button className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors dark:text-white">
               <Download size={16} className="mr-2" /> Bank Sheet
             </button>
           )}
           <button 
             onClick={handleGenerate}
             disabled={isGenerated}
             className={`flex items-center px-6 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition-colors ${isGenerated ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
           >
             <Play size={16} className="mr-2" /> {isGenerated ? 'Generated' : 'Generate Payroll'}
           </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3">Employee Name</th>
                <th className="px-6 py-3 text-right">Gross Salary</th>
                <th className="px-6 py-3 text-right">Deductions</th>
                <th className="px-6 py-3 text-right">Net Payable</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
              {payrollEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{entry.name}</td>
                  <td className="px-6 py-4 text-right">₹ {entry.gross.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-red-600 dark:text-red-400">₹ {entry.deductions.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">₹ {entry.net.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${entry.status === 'Generated' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/30' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30'}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => alert(`Viewing payslip for ${entry.name}`)}
                      className="text-primary-600 hover:text-primary-700 font-medium text-xs hover:underline flex items-center justify-center mx-auto"
                    >
                      <FileText size={14} className="mr-1" /> View Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Strip */}
        <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 grid grid-cols-3 gap-4 sticky bottom-0 z-20">
           <div className="text-center border-r border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 uppercase font-semibold">Total Gross</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">₹ {totals.gross.toLocaleString()}</p>
           </div>
           <div className="text-center border-r border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 uppercase font-semibold">Total Deductions</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">₹ {totals.deductions.toLocaleString()}</p>
           </div>
           <div className="text-center">
              <p className="text-xs text-gray-500 uppercase font-semibold">Total Net Salary</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">₹ {totals.net.toLocaleString()}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Salary Structure Form ---

const SalaryStructureForm: React.FC<{ ctc: number }> = ({ ctc }) => {
  const [earnings, setEarnings] = useState({
    basic: 0,
    hra: 0,
    special: 0,
    other: 0
  });

  const [deductions, setDeductions] = useState({
    pf: 0,
    pt: 200,
    tds: 0,
    other: 0
  });

  // Initialize with some dummy logic based on CTC
  useEffect(() => {
    const monthlyCtc = ctc / 12;
    const basic = Math.round(monthlyCtc * 0.5);
    const hra = Math.round(monthlyCtc * 0.2);
    const special = Math.round(monthlyCtc * 0.3) - 1800; // rough adjustment
    const pf = 1800; // Standard cap
    
    setEarnings({
      basic,
      hra,
      special,
      other: 0
    });
    setDeductions(prev => ({
      ...prev,
      pf
    }));
  }, [ctc]);

  const totals = useMemo(() => {
    // Fix: Cast Object.values to number[] to avoid TS errors with reduce
    const gross = (Object.values(earnings) as number[]).reduce((a, b) => a + b, 0);
    const totalDeductions = (Object.values(deductions) as number[]).reduce((a, b) => a + b, 0);
    const net = gross - totalDeductions;
    return { gross, totalDeductions, net };
  }, [earnings, deductions]);

  const handleEarningChange = (field: keyof typeof earnings, val: number) => {
    setEarnings(prev => ({ ...prev, [field]: val }));
  };

  const handleDeductionChange = (field: keyof typeof deductions, val: number) => {
    setDeductions(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Earnings */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800/30 flex justify-between items-center">
            <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm">Earnings</h4>
            <span className="text-xs bg-white dark:bg-green-800 text-green-700 dark:text-green-200 px-2 py-0.5 rounded-full font-medium">Monthly</span>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Basic Salary</label>
              <input 
                type="number" 
                value={earnings.basic} 
                onChange={e => handleEarningChange('basic', parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">HRA</label>
              <input 
                type="number" 
                value={earnings.hra} 
                onChange={e => handleEarningChange('hra', parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Special Allowance</label>
              <input 
                type="number" 
                value={earnings.special} 
                onChange={e => handleEarningChange('special', parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Other Allowance</label>
              <input 
                type="number" 
                value={earnings.other} 
                onChange={e => handleEarningChange('other', parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-green-500 focus:border-transparent dark:text-white"
              />
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Earnings</span>
            <span className="text-sm font-bold text-green-600 dark:text-green-400">₹ {totals.gross.toLocaleString()}</span>
          </div>
        </div>

        {/* Deductions */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800/30 flex justify-between items-center">
            <h4 className="font-semibold text-red-800 dark:text-red-300 text-sm">Deductions</h4>
            <span className="text-xs bg-white dark:bg-red-800 text-red-700 dark:text-red-200 px-2 py-0.5 rounded-full font-medium">Monthly</span>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">PF Contribution</label>
              <input 
                type="number" 
                value={deductions.pf} 
                onChange={e => handleDeductionChange('pf', parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-red-500 focus:border-transparent dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Professional Tax (PT)</label>
              <input 
                type="number" 
                value={deductions.pt} 
                onChange={e => handleDeductionChange('pt', parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-red-500 focus:border-transparent dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Income Tax (TDS)</label>
              <input 
                type="number" 
                value={deductions.tds} 
                onChange={e => handleDeductionChange('tds', parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-red-500 focus:border-transparent dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Other Deductions</label>
              <input 
                type="number" 
                value={deductions.other} 
                onChange={e => handleDeductionChange('other', parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-red-500 focus:border-transparent dark:text-white"
              />
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Deductions</span>
            <span className="text-sm font-bold text-red-600 dark:text-red-400">₹ {totals.totalDeductions.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gray-900 dark:bg-gray-800 text-white p-6 rounded-xl shadow-lg">
        <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center">
          <Calculator size={16} className="mr-2" /> Salary Structure Summary
        </h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="border-r border-gray-700">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Gross Salary</p>
            <p className="text-xl font-bold text-white">₹ {totals.gross.toLocaleString()}</p>
          </div>
          <div className="border-r border-gray-700">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Deductions</p>
            <p className="text-xl font-bold text-red-400">- ₹ {totals.totalDeductions.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-green-400 uppercase tracking-wider mb-1">Net Payable</p>
            <p className="text-2xl font-bold text-green-400">₹ {totals.net.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button 
          onClick={() => {
             // Reset logic roughly based on ctc again or zero
             const monthlyCtc = ctc / 12;
             setEarnings({ basic: Math.round(monthlyCtc * 0.5), hra: Math.round(monthlyCtc * 0.2), special: 0, other: 0 });
             setDeductions({ pf: 1800, pt: 200, tds: 0, other: 0 });
          }}
          className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
        >
          <RotateCcw size={16} className="mr-2" /> Reset
        </button>
        <button className="flex items-center px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors text-sm">
          <Save size={16} className="mr-2" /> Save Salary Structure
        </button>
      </div>
    </div>
  );
};

// --- Add Employee Form Drawer ---

const AddEmployeeDrawer: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void }> = ({ isOpen, onClose, onSubmit }) => {
  const initialFormState = {
    name: '',
    code: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'Male',
    department: '',
    designation: '',
    joinDate: '',
    location: 'Head Office',
    status: 'Active',
    pan: '',
    aadhaar: '',
    pfNumber: '',
    esiNumber: '',
    bankName: '',
    accountNumber: '',
    ifsc: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Reset form when opened
  React.useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[field];
        return newErrs;
      });
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required";
    if (!formData.code.trim()) newErrors.code = "Employee Code is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.joinDate) newErrors.joinDate = "Date of Joining is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[600px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Employee</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* 1. Personal Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 flex items-center">
              <User size={16} className="mr-2" /> Personal Details
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className={`w-full bg-gray-50 dark:bg-gray-800 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee Code <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.code}
                  onChange={e => handleChange('code', e.target.value)}
                  className={`w-full bg-gray-50 dark:bg-gray-800 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white ${errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                <input 
                  type="date" 
                  value={formData.dob}
                  onChange={e => handleChange('dob', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                <select 
                  value={formData.gender}
                  onChange={e => handleChange('gender', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Job Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 flex items-center">
              <Briefcase size={16} className="mr-2" /> Job Details
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select 
                    value={formData.department}
                    onChange={e => handleChange('department', e.target.value)}
                    className={`w-full appearance-none bg-gray-50 dark:bg-gray-800 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white ${errors.department ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Designation</label>
                <input 
                  type="text" 
                  value={formData.designation}
                  onChange={e => handleChange('designation', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Joining <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  value={formData.joinDate}
                  onChange={e => handleChange('joinDate', e.target.value)}
                  className={`w-full bg-gray-50 dark:bg-gray-800 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white ${errors.joinDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {errors.joinDate && <p className="text-xs text-red-500 mt-1">{errors.joinDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Work Location</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={e => handleChange('location', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <div className="relative">
                  <select 
                    value={formData.status}
                    onChange={e => handleChange('status', e.target.value)}
                    className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>On Leave</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Compliance */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 flex items-center">
              <ShieldCheck size={16} className="mr-2" /> Compliance
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PAN Number</label>
                <input 
                  type="text" 
                  value={formData.pan}
                  onChange={e => handleChange('pan', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aadhaar Number</label>
                <input 
                  type="text" 
                  value={formData.aadhaar}
                  onChange={e => handleChange('aadhaar', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PF Number</label>
                <input 
                  type="text" 
                  value={formData.pfNumber}
                  onChange={e => handleChange('pfNumber', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ESI Number</label>
                <input 
                  type="text" 
                  value={formData.esiNumber}
                  onChange={e => handleChange('esiNumber', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* 4. Bank Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 flex items-center">
              <Landmark size={16} className="mr-2" /> Bank Details
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
                <input 
                  type="text" 
                  value={formData.bankName}
                  onChange={e => handleChange('bankName', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
                <input 
                  type="text" 
                  value={formData.accountNumber}
                  onChange={e => handleChange('accountNumber', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IFSC Code</label>
                <input 
                  type="text" 
                  value={formData.ifsc}
                  onChange={e => handleChange('ifsc', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end space-x-3">
          <button onClick={onClose} className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center">
            <Save size={18} className="mr-2" /> Save Employee
          </button>
        </div>
      </div>
    </>
  );
};

const EmployeeDrawer: React.FC<{ employee: Employee | null; onClose: () => void }> = ({ employee, onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'salary'>('profile');

  // Reset tab when employee changes
  useEffect(() => {
    if (employee) setActiveTab('profile');
  }, [employee]);

  if (!employee) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[600px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex flex-col bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xl">
                  {employee.name.charAt(0)}
              </div>
              <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{employee.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{employee.code} • {employee.designation}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-6 space-x-6">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'profile' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Profile & Info
              {activeTab === 'profile' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('salary')}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'salary' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Salary Structure
              {activeTab === 'salary' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-t-full" />}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 dark:bg-gray-950/20">
            
            {activeTab === 'profile' ? (
              <div className="space-y-8 animate-fade-in">
                {/* Status & Quick Actions */}
                <div className="flex items-center justify-between">
                    <StatusBadge status={employee.status} />
                    <div className="flex space-x-2">
                        <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" title="Edit">
                            <Edit size={16} />
                        </button>
                        <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-red-600 transition-colors" title="Delete">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Personal Info */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
                        <User size={16} className="mr-2 text-gray-500" /> Personal Details
                    </h3>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center"><Mail size={14} className="mr-2"/> Email</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{employee.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center"><Phone size={14} className="mr-2"/> Phone</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{employee.phone}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center"><Calendar size={14} className="mr-2"/> Date of Joining</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{employee.joinDate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center"><Building2 size={14} className="mr-2"/> Department</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{employee.department}</span>
                        </div>
                    </div>
                </div>

                {/* Financial Info */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
                        <CreditCard size={16} className="mr-2 text-gray-500" /> Financial Details
                    </h3>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">PAN Number</span>
                            <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{employee.pan}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Bank Name</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{employee.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Account Number</span>
                            <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{employee.accountNumber}</span>
                        </div>
                    </div>
                </div>

                {/* Salary Structure Summary (Read-only overview) */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
                        <Banknote size={16} className="mr-2 text-gray-500" /> CTC Overview
                    </h3>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 rounded-xl p-4">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-xs text-green-800 dark:text-green-300 font-medium">Annual CTC</p>
                                <p className="text-xl font-bold text-green-900 dark:text-green-100">₹ {employee.ctc.toLocaleString()}</p>
                            </div>
                            <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">Effective Apr '23</span>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          Go to <strong>Salary Structure</strong> tab to view detailed breakdown.
                        </p>
                    </div>
                </div>
              </div>
            ) : (
              /* Salary Structure Form */
              <SalaryStructureForm ctc={employee.ctc} />
            )}

        </div>
      </div>
    </>
  );
};

// --- Main Component ---

const Payroll: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'directory' | 'processing'>('directory');

  // Filter Logic
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
        const matchesSearch = 
            emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            emp.code.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
        const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;

        return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchQuery, deptFilter, statusFilter]);

  // Unique Departments for Filter
  const departments = Array.from(new Set(employees.map(e => e.department)));

  const handleAddEmployee = (data: any) => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: data.name,
      code: data.code,
      designation: data.designation,
      department: data.department,
      email: data.email,
      phone: data.phone,
      status: data.status as EmployeeStatus,
      joinDate: data.joinDate,
      pan: data.pan,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      ctc: 0 // Default or could add to form
    };
    setEmployees([...employees, newEmployee]);
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight px-1">Payroll & HR</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 px-1 mt-1">Manage employees, salaries, and attendance.</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button 
                        onClick={() => setActiveTab('directory')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'directory' ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                    >
                        Employee Directory
                    </button>
                    <button 
                        onClick={() => setActiveTab('processing')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'processing' ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                    >
                        Monthly Payroll
                    </button>
                </div>
            </div>
        </div>

        {activeTab === 'processing' ? (
            <MonthlyPayroll employees={employees} />
        ) : (
            <>
                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-1 w-full gap-3 flex-col sm:flex-row">
                        <div className="relative w-full sm:w-72">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search by Name or Code..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                            />
                        </div>
                        
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            <select 
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                            >
                                <option value="All">All Departments</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                            >
                                <option value="All">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="On Leave">On Leave</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                        <button 
                            onClick={() => setIsAddDrawerOpen(true)}
                            className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors whitespace-nowrap"
                        >
                            <Plus size={18} className="mr-2" />
                            Add Employee
                        </button>
                    </div>
                </div>

                {/* Employee Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 flex flex-col">
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3">Employee Name</th>
                                    <th className="px-6 py-3">Code</th>
                                    <th className="px-6 py-3">Designation</th>
                                    <th className="px-6 py-3">Department</th>
                                    <th className="px-6 py-3">Phone</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                    <th className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                                {filteredEmployees.length > 0 ? filteredEmployees.map((emp) => (
                                    <tr 
                                        key={emp.id} 
                                        onClick={() => setSelectedEmployee(emp)}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{emp.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">{emp.email}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{emp.code}</td>
                                        <td className="px-6 py-4">{emp.designation}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-xs">{emp.department}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{emp.phone}</td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={emp.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-primary-600 transition-colors" title="View Details">
                                                    <User size={16} />
                                                </button>
                                                <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-blue-600 transition-colors" title="Edit">
                                                    <Edit size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <User size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                                                <p className="text-lg font-medium">No employees found</p>
                                                <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 flex justify-between">
                        <span>Total Employees: {filteredEmployees.length}</span>
                        <span>Active: {filteredEmployees.filter(e => e.status === 'Active').length}</span>
                    </div>
                </div>

                <EmployeeDrawer employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
                
                <AddEmployeeDrawer 
                    isOpen={isAddDrawerOpen}
                    onClose={() => setIsAddDrawerOpen(false)}
                    onSubmit={handleAddEmployee}
                />
            </>
        )}
    </div>
  );
};

export default Payroll;
