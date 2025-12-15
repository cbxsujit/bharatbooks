
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  CreditCard,
  Info
} from 'lucide-react';

// --- Types ---

type VoucherStatus = 'Draft' | 'Posted';
type VoucherType = 'Journal' | 'Contra' | 'Payment' | 'Receipt';
type PaymentMode = 'Cash' | 'Bank Transfer' | 'UPI' | 'Cheque';

interface JournalEntryRow {
  id: string;
  ledgerId: string;
  debit: number;
  credit: number;
  costCentre?: string;
}

interface JournalVoucher {
  id: string;
  type: VoucherType;
  voucherNo: string;
  date: string;
  narration: string;
  entries: JournalEntryRow[];
  totalAmount: number;
  status: VoucherStatus;
  // Extra fields for simple forms to persist state (in real app, derived from entries)
  paymentMode?: PaymentMode;
  referenceNo?: string;
}

// --- Mock Data ---

interface LedgerOption {
  id: string;
  name: string;
  code: string;
  type: 'Bank' | 'Cash' | 'General';
}

const MOCK_LEDGERS_DROPDOWN: LedgerOption[] = [
  { id: '1', name: 'HDFC Bank', code: 'BK-001', type: 'Bank' },
  { id: '2', name: 'Petty Cash', code: 'CS-001', type: 'Cash' },
  { id: '3', name: 'Furniture & Fixtures', code: 'FA-001', type: 'General' },
  { id: '4', name: 'Sales Account', code: 'INC-001', type: 'General' },
  { id: '5', name: 'Office Rent', code: 'EXP-001', type: 'General' },
  { id: '6', name: 'Acme Traders (Debtor)', code: 'DB-001', type: 'General' },
  { id: '7', name: 'Tech Solutions (Creditor)', code: 'CR-001', type: 'General' },
  { id: '8', name: 'Salary Expense', code: 'EXP-002', type: 'General' },
  { id: '9', name: 'Electricity Bill', code: 'EXP-003', type: 'General' },
];

const MOCK_VOUCHERS: JournalVoucher[] = [
  {
    id: '1',
    type: 'Payment',
    voucherNo: 'PAY-2024-001',
    date: '2024-01-28',
    narration: 'Rent paid for Jan 2024',
    status: 'Posted',
    totalAmount: 45000,
    paymentMode: 'Cheque',
    entries: [
      { id: 'e1', ledgerId: '5', debit: 45000, credit: 0 },
      { id: 'e2', ledgerId: '1', debit: 0, credit: 45000 },
    ]
  },
  {
    id: '2',
    type: 'Contra',
    voucherNo: 'CNT-2024-001',
    date: '2024-01-25',
    narration: 'Cash withdrawal from bank',
    status: 'Posted',
    totalAmount: 10000,
    entries: [
      { id: 'e3', ledgerId: '2', debit: 10000, credit: 0 },
      { id: 'e4', ledgerId: '1', debit: 0, credit: 10000 },
    ]
  },
  {
    id: '3',
    type: 'Journal',
    voucherNo: 'JV-2024-003',
    date: '2024-01-20',
    narration: 'Correction entry for salary',
    status: 'Draft',
    totalAmount: 5000,
    entries: [
      { id: 'e5', ledgerId: '8', debit: 5000, credit: 0 },
      { id: 'e6', ledgerId: '2', debit: 0, credit: 5000 },
    ]
  }
];

// --- Helper Components ---

const StatusBadge: React.FC<{ status: VoucherStatus }> = ({ status }) => {
  const styles = {
    Posted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/30',
    Draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status === 'Posted' ? <CheckCircle2 size={12} className="mr-1" /> : <Clock size={12} className="mr-1" />}
      {status}
    </span>
  );
};

const TypeBadge: React.FC<{ type: VoucherType }> = ({ type }) => {
  const config = {
    Journal: { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400', icon: FileText },
    Contra: { color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400', icon: ArrowRightLeft },
    Payment: { color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400', icon: ArrowUpRight },
    Receipt: { color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400', icon: ArrowDownLeft },
  };
  const { color, icon: Icon } = config[type];
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${color}`}>
      <Icon size={12} className="mr-1.5" />
      {type}
    </span>
  );
};

// --- Creation Form Component ---

interface VoucherFormProps {
  type: VoucherType;
  onCancel: () => void;
}

const VoucherForm: React.FC<VoucherFormProps> = ({ type, onCancel }) => {
  // Common State
  const [voucherNo, setVoucherNo] = useState(`${type.toUpperCase().substring(0,3)}-2024-00X`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [narration, setNarration] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Journal Specific State
  const [journalRows, setJournalRows] = useState<JournalEntryRow[]>([
    { id: '1', ledgerId: '', debit: 0, credit: 0 },
    { id: '2', ledgerId: '', debit: 0, credit: 0 }
  ]);

  // Simple Form State (Contra, Payment, Receipt)
  const [sourceLedger, setSourceLedger] = useState(''); // From
  const [destLedger, setDestLedger] = useState(''); // To
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Bank Transfer');
  const [referenceNo, setReferenceNo] = useState('');

  // Derived Calculations for Journal
  const { totalDebit, totalCredit, difference } = useMemo(() => {
    const totalDebit = journalRows.reduce((sum, row) => sum + (row.debit || 0), 0);
    const totalCredit = journalRows.reduce((sum, row) => sum + (row.credit || 0), 0);
    return { totalDebit, totalCredit, difference: totalDebit - totalCredit };
  }, [journalRows]);
  
  const isBalanced = Math.abs(difference) < 0.01;

  // Filtered Ledgers
  const cashBankLedgers = MOCK_LEDGERS_DROPDOWN.filter(l => l.type === 'Bank' || l.type === 'Cash');
  const allLedgers = MOCK_LEDGERS_DROPDOWN;

  // --- Journal Handlers ---
  const updateJournalRow = (index: number, field: keyof JournalEntryRow, value: any) => {
    const newRows = [...journalRows];
    if (field === 'debit' && value > 0) newRows[index] = { ...newRows[index], debit: value, credit: 0 };
    else if (field === 'credit' && value > 0) newRows[index] = { ...newRows[index], credit: value, debit: 0 };
    else newRows[index] = { ...newRows[index], [field]: value };
    setJournalRows(newRows);
  };

  const addJournalRow = () => setJournalRows([...journalRows, { id: Date.now().toString(), ledgerId: '', debit: 0, credit: 0 }]);
  const removeJournalRow = (index: number) => {
    if (journalRows.length > 2) setJournalRows(journalRows.filter((_, i) => i !== index));
  };

  // --- Validation ---
  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    if (!date) newErrors.date = "Date is required";
    if (!voucherNo) newErrors.voucherNo = "Voucher No is required";

    if (type === 'Journal') {
      if (journalRows.some(r => !r.ledgerId)) newErrors.rows = "Select ledgers for all rows.";
      if (journalRows.some(r => r.debit === 0 && r.credit === 0)) newErrors.rows = "Enter amounts.";
      if (!isBalanced) newErrors.balance = "Entry not balanced.";
    } else {
      if (!sourceLedger) newErrors.source = type === 'Receipt' ? "Payer is required" : "Source ledger is required";
      if (!destLedger) newErrors.dest = type === 'Receipt' ? "Deposit ledger is required" : "Payee ledger is required";
      if (!amount || amount <= 0) newErrors.amount = "Valid amount is required";
      if (sourceLedger === destLedger) newErrors.dest = "Source and destination cannot be same";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (status: VoucherStatus) => {
    if (validate()) {
        setShowSuccessToast(true);
        setTimeout(() => {
            setShowSuccessToast(false);
            onCancel();
        }, 1500);
    }
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S to Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave('Posted');
      }
      // Esc to Cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
      // Enter Navigation
      if (e.key === 'Enter' && !e.ctrlKey && !e.altKey && !e.metaKey && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const form = formRef.current;
        if (form) {
            const elements = Array.from(form.querySelectorAll(focusableElements)) as HTMLElement[];
            const index = elements.indexOf(document.activeElement as HTMLElement);
            if (index > -1) {
                if (e.shiftKey) {
                    if (index > 0) elements[index - 1].focus();
                } else {
                    if (index < elements.length - 1) elements[index + 1].focus();
                }
            }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [journalRows, sourceLedger, destLedger, amount, paymentMode, referenceNo]);

  // --- Renders ---

  const renderJournalTable = () => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden ${errors.rows || errors.balance ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <th className="px-4 py-3 w-12 text-center">#</th>
                        <th className="px-4 py-3">Ledger Account</th>
                        <th className="px-4 py-3 w-40 text-right">Debit (₹)</th>
                        <th className="px-4 py-3 w-40 text-right">Credit (₹)</th>
                        <th className="px-4 py-3 w-12"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {journalRows.map((row, index) => (
                        <tr key={row.id} className="bg-white dark:bg-gray-800">
                            <td className="px-4 py-3 text-center text-gray-400">{index + 1}</td>
                            <td className="px-4 py-3">
                                <select 
                                    value={row.ledgerId}
                                    onChange={e => updateJournalRow(index, 'ledgerId', e.target.value)}
                                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 py-1 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                                    autoFocus={index === 0}
                                >
                                    <option value="">Select Ledger</option>
                                    {allLedgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </td>
                            <td className="px-4 py-3">
                                <input type="number" min="0" value={row.debit || ''} onChange={e => updateJournalRow(index, 'debit', parseFloat(e.target.value) || 0)} className="w-full text-right bg-transparent border-b border-gray-300 dark:border-gray-600 py-1 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none" />
                            </td>
                            <td className="px-4 py-3">
                                <input type="number" min="0" value={row.credit || ''} onChange={e => updateJournalRow(index, 'credit', parseFloat(e.target.value) || 0)} className="w-full text-right bg-transparent border-b border-gray-300 dark:border-gray-600 py-1 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none" />
                            </td>
                            <td className="px-4 py-3 text-center">
                                <button onClick={() => removeJournalRow(index)} className="text-gray-400 hover:text-red-500 focus:text-red-500" disabled={journalRows.length <= 2}><Trash2 size={16} /></button>
                            </td>
                        </tr>
                    ))}
                    <tr className="bg-gray-50 dark:bg-gray-900/50 font-bold text-gray-900 dark:text-white">
                        <td colSpan={2} className="px-4 py-3 text-right">Total</td>
                        <td className="px-4 py-3 text-right">{totalDebit.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{totalCredit.toLocaleString()}</td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div className="p-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
            <button onClick={addJournalRow} className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"><Plus size={16} className="mr-1" /> Add Row</button>
            {!isBalanced && <span className="text-red-500 text-sm font-medium flex items-center"><AlertTriangle size={14} className="mr-1" /> Unbalanced: {Math.abs(difference)}</span>}
        </div>
    </div>
  );

  const renderSimpleForm = () => {
    // Labels configuration based on type
    const config = {
      Contra: { 
        sourceLabel: 'Transfer From (Cr)', destLabel: 'Transfer To (Dr)', 
        sourceOptions: cashBankLedgers, destOptions: cashBankLedgers 
      },
      Payment: { 
        sourceLabel: 'Paid From (Cr)', destLabel: 'Paid To (Dr)', 
        sourceOptions: cashBankLedgers, destOptions: allLedgers 
      },
      Receipt: { 
        sourceLabel: 'Received From (Cr)', destLabel: 'Received In (Dr)', 
        sourceOptions: allLedgers, destOptions: cashBankLedgers 
      }
    };

    const { sourceLabel, destLabel, sourceOptions, destOptions } = config[type as 'Contra' | 'Payment' | 'Receipt'];

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source */}
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{sourceLabel} <span className="text-red-500">*</span></label>
               <select 
                  value={sourceLedger} 
                  onChange={e => setSourceLedger(e.target.value)} 
                  className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-lg px-3 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none ${errors.source ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  autoFocus
               >
                  <option value="">Select Ledger</option>
                  {sourceOptions.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
               </select>
               {errors.source && <p className="text-xs text-red-500 mt-1">{errors.source}</p>}
            </div>

            {/* Destination */}
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{destLabel} <span className="text-red-500">*</span></label>
               <select 
                  value={destLedger} 
                  onChange={e => setDestLedger(e.target.value)} 
                  className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-lg px-3 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none ${errors.dest ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
               >
                  <option value="">Select Ledger</option>
                  {destOptions.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
               </select>
               {errors.dest && <p className="text-xs text-red-500 mt-1">{errors.dest}</p>}
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹) <span className="text-red-500">*</span></label>
               <input 
                  type="number" 
                  value={amount || ''} 
                  onChange={e => setAmount(parseFloat(e.target.value))} 
                  className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none ${errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
               />
            </div>
            {type !== 'Contra' && (
               <>
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mode</label>
                   <select 
                      value={paymentMode} 
                      onChange={e => setPaymentMode(e.target.value as PaymentMode)} 
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                   >
                      <option>Cash</option>
                      <option>Bank Transfer</option>
                      <option>UPI</option>
                      <option>Cheque</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ref / Cheque No.</label>
                   <input 
                      type="text" 
                      value={referenceNo} 
                      onChange={e => setReferenceNo(e.target.value)} 
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                   />
                </div>
               </>
            )}
         </div>
         <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <Info size={12} className="mr-1" />
            This will generate a double-entry record automatically.
         </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 animate-fade-in" ref={formRef}>
       <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
           <div className="flex items-center space-x-4">
               <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors focus:ring-2 focus:ring-primary-500">
                   <ArrowLeft size={20} />
               </button>
               <h1 className="text-xl font-bold text-gray-900 dark:text-white">New {type} Voucher</h1>
           </div>
           {type === 'Journal' && (
               <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${isBalanced ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {isBalanced ? 'Balanced' : 'Unbalanced'}
               </div>
           )}
       </div>

       {/* Success Toast */}
       {showSuccessToast && (
          <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center animate-bounce-in">
              <Save size={20} className="mr-2" />
              Voucher Posted Successfully!
          </div>
       )}

       <div className="flex-1 overflow-y-auto p-6">
           <div className="max-w-5xl mx-auto space-y-6">
               {/* Common Header Fields */}
               <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Voucher No. <span className="text-red-500">*</span></label>
                           <input type="text" value={voucherNo} onChange={e => setVoucherNo(e.target.value)} className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none ${errors.voucherNo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date <span className="text-red-500">*</span></label>
                           <input type="date" value={date} onChange={e => setDate(e.target.value)} className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none ${errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Narration</label>
                           <textarea rows={1} value={narration} onChange={e => setNarration(e.target.value)} placeholder="Description..." className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none" />
                       </div>
                   </div>
               </div>

               {/* Form Body */}
               {type === 'Journal' ? renderJournalTable() : renderSimpleForm()}

               {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={onCancel} className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-primary-500">Cancel</button>
                    <button onClick={() => handleSave('Draft')} className="px-6 py-2.5 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg font-medium transition-colors focus:ring-2 focus:ring-gray-500">Save as Draft</button>
                    <button 
                        onClick={() => handleSave('Posted')} 
                        className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center focus:ring-2 focus:ring-primary-500"
                        disabled={type === 'Journal' && !isBalanced}
                        title="Ctrl+S to Post"
                    >
                        <Save size={18} className="mr-2" /> Post Entry
                    </button>
                </div>
           </div>
       </div>
    </div>
  );
};

// --- Main Component ---

const JournalVouchers: React.FC<{ initialMode?: 'list' | 'create' }> = ({ initialMode = 'list' }) => {
  const [activeTab, setActiveTab] = useState<VoucherType>('Journal');
  const [mode, setMode] = useState<'list' | 'create'>(initialMode);
  const [vouchers] = useState<JournalVoucher[]>(MOCK_VOUCHERS);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => v.type === activeTab);
  }, [vouchers, activeTab]);

  if (mode === 'create') {
    return <VoucherForm type={activeTab} onCancel={() => setMode('list')} />;
  }

  const tabs: VoucherType[] = ['Journal', 'Contra', 'Payment', 'Receipt'];

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
        
        {/* Header & Tabs */}
        <div className="flex flex-col gap-4">
             {/* Tabs */}
             <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                    >
                        {tab}
                    </button>
                ))}
             </div>

             {/* Toolbar */}
             <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex flex-1 w-full gap-3">
                    <div className="relative w-full lg:w-72">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder={`Search ${activeTab} Vouchers...`} className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" />
                    </div>
                    <button className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"><Filter size={18} /></button>
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                    <div className="hidden sm:flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg text-sm"><Calendar size={16} className="text-gray-400" /><span>Date Range</span></div>
                    <button onClick={() => setMode('create')} className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors whitespace-nowrap">
                        <Plus size={18} className="mr-2" /> New {activeTab}
                    </button>
                </div>
            </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3">Voucher No</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Narration</th>
                            <th className="px-6 py-3 text-right">Amount</th>
                            <th className="px-6 py-3 text-center">Status</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                        {filteredVouchers.length > 0 ? filteredVouchers.map((v) => (
                            <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group">
                                <td className="px-6 py-4 font-medium text-primary-600 dark:text-primary-400">{v.voucherNo}</td>
                                <td className="px-6 py-4">{v.date}</td>
                                <td className="px-6 py-4"><TypeBadge type={v.type} /></td>
                                <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{v.narration}</td>
                                <td className="px-6 py-4 text-right font-medium">₹ {v.totalAmount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-center"><StatusBadge status={v.status} /></td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1 hover:text-primary-600 transition-colors"><Eye size={16} /></button>
                                        <button className="p-1 hover:text-blue-600 transition-colors"><Edit size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No {activeTab} vouchers found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default JournalVouchers;
