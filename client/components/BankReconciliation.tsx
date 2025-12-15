
import React, { useState, useMemo } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Landmark,
  ArrowLeftRight,
  RefreshCw,
  Check,
  AlertOctagon,
  PlusCircle,
  XCircle,
  Clock,
  Sparkles
} from 'lucide-react';

// --- Types ---

interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  currency: string;
  openingBalance: number;
  currentBookBalance: number;
  lastReconciled: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  debit: number; // Withdrawal
  credit: number; // Deposit
  status: 'Matched' | 'Unmatched';
  matchedWith?: string; // ID of the counterpart
}

// --- Mock Data ---

const MOCK_ACCOUNTS: BankAccount[] = [
  { 
    id: '1', 
    name: 'HDFC Current A/c', 
    accountNumber: '50200012345678', 
    bankName: 'HDFC Bank', 
    currency: 'INR', 
    openingBalance: 1250000, 
    currentBookBalance: 1450000, 
    lastReconciled: '2023-12-31' 
  },
  { 
    id: '2', 
    name: 'ICICI Corporate', 
    accountNumber: '000405009988', 
    bankName: 'ICICI Bank', 
    currency: 'INR', 
    openingBalance: 500000, 
    currentBookBalance: 480000, 
    lastReconciled: '2023-12-31' 
  }
];

// Book Transactions (System)
const INITIAL_BOOK_TXNS: Transaction[] = [
  { id: 'bk-1', date: '2024-01-02', description: 'Payment to Vendor (Office Supplies)', debit: 12400, credit: 0, status: 'Unmatched' },
  { id: 'bk-2', date: '2024-01-05', description: 'Receipt from Acme Traders', debit: 0, credit: 125000, status: 'Unmatched' },
  { id: 'bk-3', date: '2024-01-10', description: 'Utility Bill Payment', debit: 2400, credit: 0, status: 'Unmatched' },
  { id: 'bk-4', date: '2024-01-12', description: 'Cash Deposit', debit: 0, credit: 50000, status: 'Unmatched' },
  { id: 'bk-5', date: '2024-01-15', description: 'Salary Advance', debit: 15000, credit: 0, status: 'Unmatched' },
  { id: 'bk-6', date: '2024-01-18', description: 'Bank Charges (Est)', debit: 150, credit: 0, status: 'Unmatched' },
];

// Bank Statement Lines (Imported)
const INITIAL_BANK_TXNS: Transaction[] = [
  { id: 'bnk-1', date: '2024-01-03', description: 'NEFT-DR-OFFICE SUPPLIES', debit: 12400, credit: 0, status: 'Unmatched' },
  { id: 'bnk-2', date: '2024-01-05', description: 'NEFT-CR-ACME TRADERS PVT LTD', debit: 0, credit: 125000, status: 'Unmatched' },
  { id: 'bnk-3', date: '2024-01-11', description: 'BIL/000928/AIRTEL', debit: 2400, credit: 0, status: 'Unmatched' },
  { id: 'bnk-4', date: '2024-01-12', description: 'CASH DEP BRANCH MUMBAI', debit: 0, credit: 50000, status: 'Unmatched' },
  { id: 'bnk-5', date: '2024-01-15', description: 'IMPS-DR-RAJESH KUMAR', debit: 15000, credit: 0, status: 'Unmatched' },
  { id: 'bnk-6', date: '2024-01-20', description: 'CONSOLIDATED CHARGES JAN', debit: 236, credit: 0, status: 'Unmatched' },
];

// --- Helper Modal for Creating Entry ---

const CreateEntryModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  txn: Transaction | null;
}> = ({ isOpen, onClose, txn }) => {
  if (!isOpen || !txn) return null;

  const type = txn.debit > 0 ? 'Payment' : 'Receipt';
  const amount = txn.debit > 0 ? txn.debit : txn.credit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
          <div className="flex justify-between items-start mb-6">
              <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create {type} Entry</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Record missing transaction from bank statement</p>
              </div>
              <button onClick={onClose}><XCircle className="text-gray-400 hover:text-gray-600" /></button>
          </div>

          <div className="space-y-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <p><span className="font-semibold">Bank Line:</span> {txn.description}</p>
                  <p><span className="font-semibold">Date:</span> {txn.date}</p>
                  <p><span className="font-semibold">Amount:</span> ₹ {amount.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Date</label>
                       <input type="date" defaultValue={txn.date} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:text-white" />
                   </div>
                   <div>
                       <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Ledger Account</label>
                       <select className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:text-white">
                           <option>Select Ledger...</option>
                           <option>Bank Charges</option>
                           <option>Interest Income</option>
                           <option>Suspense Account</option>
                       </select>
                   </div>
              </div>
              <div>
                   <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Narration</label>
                   <input type="text" defaultValue={`Bank Recon: ${txn.description}`} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:text-white" />
              </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
              <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={() => { alert('Entry Created!'); onClose(); }} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium">Save & Reconcile</button>
          </div>
       </div>
    </div>
  );
};

const BankReconciliation: React.FC = () => {
  // --- State ---
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [viewMode, setViewMode] = useState<'match' | 'exceptions'>('match');
  
  const [bookTxns, setBookTxns] = useState<Transaction[]>(INITIAL_BOOK_TXNS);
  const [bankTxns, setBankTxns] = useState<Transaction[]>(INITIAL_BANK_TXNS);
  
  // Selection for matching
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);

  // Exceptions Modal
  const [createEntryTxn, setCreateEntryTxn] = useState<Transaction | null>(null);

  // --- Derived Data ---
  const selectedAccount = MOCK_ACCOUNTS.find(a => a.id === selectedAccountId);

  const matchedCount = bookTxns.filter(t => t.status === 'Matched').length;
  const unmatchedCount = bookTxns.length - matchedCount;
  
  // Unmatched lists for Exceptions View
  const bookExceptions = bookTxns.filter(t => t.status === 'Unmatched');
  const bankExceptions = bankTxns.filter(t => t.status === 'Unmatched');

  // Calculate implied bank balance based on matched items
  const reconciledBankBalance = useMemo(() => {
    if (!selectedAccount) return 0;
    let balance = selectedAccount.openingBalance;
    bankTxns.forEach(txn => {
      if (txn.status === 'Matched') {
        balance = balance - txn.debit + txn.credit;
      }
    });
    return balance;
  }, [selectedAccount, bankTxns]);

  const difference = selectedAccount ? selectedAccount.currentBookBalance - reconciledBankBalance : 0;

  // --- Handlers ---

  const handleImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      setStep(3);
    }, 1500);
  };

  const handleMatch = () => {
    if (!selectedBookId || !selectedBankId) return;

    setBookTxns(prev => prev.map(t => t.id === selectedBookId ? { ...t, status: 'Matched', matchedWith: selectedBankId } : t));
    setBankTxns(prev => prev.map(t => t.id === selectedBankId ? { ...t, status: 'Matched', matchedWith: selectedBookId } : t));
    
    setSelectedBookId(null);
    setSelectedBankId(null);
  };

  const handleAutoMatch = () => {
    const newBook = [...bookTxns];
    const newBank = [...bankTxns];

    newBook.forEach(bTxn => {
      if (bTxn.status === 'Matched') return;

      const matchIndex = newBank.findIndex(bnk => 
        bnk.status === 'Unmatched' && 
        bnk.debit === bTxn.debit && 
        bnk.credit === bTxn.credit
      );

      if (matchIndex !== -1) {
        bTxn.status = 'Matched';
        bTxn.matchedWith = newBank[matchIndex].id;
        newBank[matchIndex].status = 'Matched';
        newBank[matchIndex].matchedWith = bTxn.id;
      }
    });

    setBookTxns(newBook);
    setBankTxns(newBank);
  };

  // --- Render Steps ---

  // Step 1: Account Selection
  if (step === 1) {
    return (
      <div className="flex flex-col h-full animate-fade-in space-y-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm max-w-2xl mx-auto w-full mt-10 text-center">
            <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600 dark:text-primary-400">
                <Landmark size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bank Reconciliation</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Select a bank account to start reconciling your books with your bank statement.</p>
            
            <div className="mb-8 text-left max-w-md mx-auto">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bank Account</label>
                <select 
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                    <option value="">Select Account...</option>
                    {MOCK_ACCOUNTS.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name} - {acc.accountNumber}</option>
                    ))}
                </select>
            </div>

            {selectedAccount && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-left">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Opening Balance</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">₹ {selectedAccount.openingBalance.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Book Balance</p>
                        <p className="text-lg font-bold text-primary-600 dark:text-primary-400 mt-1">₹ {selectedAccount.currentBookBalance.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Last Reconciled</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{selectedAccount.lastReconciled}</p>
                    </div>
                </div>
            )}

            <button 
              disabled={!selectedAccountId}
              onClick={() => setStep(2)}
              className="w-full max-w-md bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
            >
                Continue to Import <ArrowRight size={18} className="ml-2" />
            </button>
        </div>
      </div>
    );
  }

  // Step 2: Import Statement
  if (step === 2) {
    return (
      <div className="flex flex-col h-full animate-fade-in max-w-4xl mx-auto w-full pt-6">
        
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Import Bank Statement</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Upload your bank statement (CSV/XLS) for {selectedAccount?.name}</p>
            </div>
            <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Cancel</button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center min-h-[300px] hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors cursor-pointer mb-6">
             <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                 <UploadCloud size={32} />
             </div>
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Upload Statement File</h3>
             <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
                 Drag and drop your CSV, XLS, or PDF file here. Ensure columns match: Date, Description, Withdrawal, Deposit.
             </p>
             <button 
                onClick={handleImport}
                disabled={isImporting}
                className="px-6 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center"
             >
                {isImporting ? (
                   <>
                     <RefreshCw size={18} className="mr-2 animate-spin" /> Processing...
                   </>
                ) : (
                   <>Select File</>
                )}
             </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
             <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center"><FileText size={16} className="mr-2" /> Expected Format</h4>
             <div className="overflow-x-auto">
                 <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400">
                     <thead className="bg-gray-100 dark:bg-gray-800 uppercase font-medium">
                         <tr>
                             <th className="px-4 py-2">Date</th>
                             <th className="px-4 py-2">Description</th>
                             <th className="px-4 py-2 text-right">Withdrawal</th>
                             <th className="px-4 py-2 text-right">Deposit</th>
                             <th className="px-4 py-2 text-right">Balance</th>
                         </tr>
                     </thead>
                     <tbody>
                         <tr className="border-b border-gray-200 dark:border-gray-700">
                             <td className="px-4 py-2">2024-01-01</td>
                             <td className="px-4 py-2">NEFT TRANSFER...</td>
                             <td className="px-4 py-2 text-right">12,000.00</td>
                             <td className="px-4 py-2 text-right">-</td>
                             <td className="px-4 py-2 text-right">1,45,000.00</td>
                         </tr>
                         <tr>
                             <td className="px-4 py-2">2024-01-02</td>
                             <td className="px-4 py-2">CASH DEPOSIT...</td>
                             <td className="px-4 py-2 text-right">-</td>
                             <td className="px-4 py-2 text-right">5,000.00</td>
                             <td className="px-4 py-2 text-right">1,50,000.00</td>
                         </tr>
                     </tbody>
                 </table>
             </div>
        </div>
      </div>
    );
  }

  // Step 3: Reconciliation (Match or Exceptions)
  return (
    <div className="flex flex-col h-full animate-fade-in space-y-4">
        
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 gap-4">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
                <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
                    <Landmark size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedAccount?.name}</h2>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-3 mt-0.5">
                        <span>{selectedAccount?.bankName}</span>
                        <span>•</span>
                        <span>{selectedAccount?.accountNumber}</span>
                    </div>
                </div>
            </div>
            
            {/* View Switcher */}
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('match')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center ${viewMode === 'match' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                >
                   <ArrowLeftRight size={14} className="mr-2" /> Match Transactions
                </button>
                <button 
                   onClick={() => setViewMode('exceptions')}
                   className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center ${viewMode === 'exceptions' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                >
                   <AlertCircle size={14} className="mr-2" /> Review Exceptions
                   {(bookExceptions.length + bankExceptions.length) > 0 && (
                      <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{bookExceptions.length + bankExceptions.length}</span>
                   )}
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {viewMode === 'match' ? (
                /* Matching View */
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden relative">
                    {/* Tools */}
                    <div className="absolute top-2 right-4 z-20 flex gap-2">
                       <button onClick={handleAutoMatch} className="flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 shadow-sm border border-blue-100 dark:border-blue-900/30">
                           <Sparkles size={14} className="mr-1.5" /> Auto Match
                       </button>
                    </div>

                    {/* Match Button (Floating/Center) */}
                    <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-200 ${selectedBookId && selectedBankId ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                        <button 
                            onClick={handleMatch}
                            className="bg-primary-600 text-white px-6 py-3 rounded-full shadow-xl font-bold flex items-center hover:bg-primary-700 hover:scale-105 transition-all ring-4 ring-white dark:ring-gray-900"
                        >
                            <ArrowLeftRight size={20} className="mr-2" /> Match
                        </button>
                    </div>

                    {/* Left: Book Transactions */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 font-semibold text-gray-700 dark:text-gray-300 flex justify-between">
                            <span>Book Transactions</span>
                            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{bookExceptions.length} Open</span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 font-medium sticky top-0 z-10">
                                    <tr>
                                        <th className="px-3 py-2">Date</th>
                                        <th className="px-3 py-2">Particulars</th>
                                        <th className="px-3 py-2 text-right">Debit</th>
                                        <th className="px-3 py-2 text-right">Credit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {bookTxns.map(txn => {
                                        const isMatched = txn.status === 'Matched';
                                        const isSelected = selectedBookId === txn.id;
                                        return (
                                            <tr 
                                                key={txn.id} 
                                                onClick={() => !isMatched && setSelectedBookId(txn.id)}
                                                className={`
                                                    transition-colors cursor-pointer border-l-4
                                                    ${isMatched ? 'bg-green-50/50 dark:bg-green-900/10 text-gray-400 border-green-500' : 
                                                      isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'}
                                                `}
                                            >
                                                <td className="px-3 py-3">{txn.date}</td>
                                                <td className="px-3 py-3 max-w-[180px] truncate" title={txn.description}>{txn.description}</td>
                                                <td className="px-3 py-3 text-right">{txn.debit ? txn.debit.toLocaleString() : '-'}</td>
                                                <td className="px-3 py-3 text-right">{txn.credit ? txn.credit.toLocaleString() : '-'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right: Bank Statement */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 font-semibold text-gray-700 dark:text-gray-300 flex justify-between">
                            <span>Bank Statement Lines</span>
                            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{bankExceptions.length} Open</span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 font-medium sticky top-0 z-10">
                                    <tr>
                                        <th className="px-3 py-2">Date</th>
                                        <th className="px-3 py-2">Description</th>
                                        <th className="px-3 py-2 text-right">Withdrawal</th>
                                        <th className="px-3 py-2 text-right">Deposit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {bankTxns.map(txn => {
                                        const isMatched = txn.status === 'Matched';
                                        const isSelected = selectedBankId === txn.id;
                                        return (
                                            <tr 
                                                key={txn.id} 
                                                onClick={() => !isMatched && setSelectedBankId(txn.id)}
                                                className={`
                                                    transition-colors cursor-pointer border-r-4
                                                    ${isMatched ? 'bg-green-50/50 dark:bg-green-900/10 text-gray-400 border-green-500' : 
                                                      isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'}
                                                `}
                                            >
                                                <td className="px-3 py-3">{txn.date}</td>
                                                <td className="px-3 py-3 max-w-[180px] truncate" title={txn.description}>{txn.description}</td>
                                                <td className="px-3 py-3 text-right">{txn.debit ? txn.debit.toLocaleString() : '-'}</td>
                                                <td className="px-3 py-3 text-right">{txn.credit ? txn.credit.toLocaleString() : '-'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                /* Exceptions View */
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto p-1">
                    
                    {/* Left: Book Exceptions */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center mb-4">
                           <Clock size={20} className="mr-2 text-orange-500" /> 
                           Unmatched Book Entries 
                           <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">({bookExceptions.length})</span>
                        </h3>
                        <div className="space-y-3">
                           {bookExceptions.length > 0 ? bookExceptions.map(txn => (
                              <div key={txn.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex flex-col gap-2">
                                 <div className="flex justify-between items-start">
                                     <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{txn.description}</p>
                                        <p className="text-xs text-gray-500">{txn.date}</p>
                                     </div>
                                     <div className="text-right">
                                        <p className="font-bold text-gray-900 dark:text-white">₹ {(txn.debit || txn.credit).toLocaleString()}</p>
                                        <span className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">Unpresented</span>
                                     </div>
                                 </div>
                                 <div className="flex gap-2 mt-1">
                                     <button className="flex-1 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">Edit Entry</button>
                                     <button className="flex-1 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200">Mark Pending</button>
                                 </div>
                              </div>
                           )) : (
                              <p className="text-sm text-gray-400 text-center py-8">No book exceptions found.</p>
                           )}
                        </div>
                    </div>

                    {/* Right: Bank Exceptions */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center mb-4">
                           <AlertOctagon size={20} className="mr-2 text-red-500" /> 
                           Unmatched Bank Entries 
                           <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">({bankExceptions.length})</span>
                        </h3>
                        <div className="space-y-3">
                           {bankExceptions.length > 0 ? bankExceptions.map(txn => (
                              <div key={txn.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-red-50/30 dark:bg-red-900/10 flex flex-col gap-2">
                                 <div className="flex justify-between items-start">
                                     <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{txn.description}</p>
                                        <p className="text-xs text-gray-500">{txn.date}</p>
                                     </div>
                                     <div className="text-right">
                                        <p className="font-bold text-gray-900 dark:text-white">₹ {(txn.debit || txn.credit).toLocaleString()}</p>
                                        <span className="text-xs text-red-600 bg-red-100 dark:bg-red-900/20 px-1.5 py-0.5 rounded">Action Req.</span>
                                     </div>
                                 </div>
                                 <div className="flex gap-2 mt-1">
                                     <button 
                                        onClick={() => setCreateEntryTxn(txn)}
                                        className="flex-1 py-1.5 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded flex items-center justify-center"
                                     >
                                        <PlusCircle size={12} className="mr-1" /> Create Ledger Entry
                                     </button>
                                     <button className="py-1.5 px-3 text-xs border border-red-200 text-red-600 hover:bg-red-50 rounded" title="Mark as Bank Error">
                                        <AlertCircle size={12} />
                                     </button>
                                 </div>
                              </div>
                           )) : (
                              <p className="text-sm text-gray-400 text-center py-8">No bank exceptions found.</p>
                           )}
                        </div>
                    </div>
                </div>
            )}

        </div>

        {/* Summary Footer */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 sticky bottom-0 z-30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
             <div className="flex items-center gap-6 text-sm">
                 <div>
                     <p className="text-gray-500 dark:text-gray-400 text-xs">Book Balance</p>
                     <p className="font-bold text-gray-900 dark:text-white">₹ {selectedAccount?.currentBookBalance.toLocaleString()}</p>
                 </div>
                 <div>
                     <p className="text-gray-500 dark:text-gray-400 text-xs">Bank Balance (Reconciled)</p>
                     <p className="font-bold text-gray-900 dark:text-white">₹ {reconciledBankBalance.toLocaleString()}</p>
                 </div>
                 <div>
                     <p className="text-gray-500 dark:text-gray-400 text-xs">Difference</p>
                     <p className={`font-bold ${difference === 0 ? 'text-green-600' : 'text-red-600'}`}>₹ {difference.toLocaleString()}</p>
                 </div>
                 <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                 <div className="hidden sm:block text-xs text-gray-500">
                     <span className="text-green-600 font-bold">{matchedCount}</span> Matched • <span className="text-orange-600 font-bold">{unmatchedCount}</span> Unmatched
                 </div>
             </div>

             <div className="flex gap-3">
                 <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                     Save for Later
                 </button>
                 <button 
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-colors text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={difference !== 0 || unmatchedCount > 0}
                 >
                     <Check size={16} className="mr-2" /> Finish Reconciliation
                 </button>
             </div>
        </div>

        {/* Create Entry Modal */}
        <CreateEntryModal 
            isOpen={!!createEntryTxn} 
            onClose={() => setCreateEntryTxn(null)}
            txn={createEntryTxn}
        />
    </div>
  );
};

export default BankReconciliation;
