
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  X, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  CreditCard, 
  DollarSign, 
  Briefcase, 
  Sparkles,
  RotateCcw,
  Wallet
} from 'lucide-react';
import NewPurchaseBill from './NewPurchaseBill';
import ScanBill from './ScanBill';
import DebitNotes from './DebitNotes';
import QuickExpenses from './QuickExpenses';

// --- Types ---

type BillStatus = 'Paid' | 'Unpaid' | 'Overdue' | 'Partially Paid';

interface PurchaseBill {
  id: string;
  billNumber: string;
  date: string;
  vendor: string;
  status: BillStatus;
  dueDate: string;
  amount: number;
  balanceDue: number;
}

interface PurchasesProps {
  globalAction?: string | null;
  resetGlobalAction?: () => void;
}

// --- Mock Data ---

const INITIAL_BILLS: PurchaseBill[] = [
  { id: '1', billNumber: 'BILL-2024-882', date: '2024-01-10', vendor: 'Office Supplies Co.', status: 'Paid', dueDate: '2024-01-25', amount: 12400, balanceDue: 0 },
  { id: '2', billNumber: 'BILL-2024-901', date: '2024-01-12', vendor: 'Tech Solutions Ltd', status: 'Unpaid', dueDate: '2024-02-12', amount: 45000, balanceDue: 45000 },
  { id: '3', billNumber: 'BILL-2024-756', date: '2024-01-05', vendor: 'Furniture Mart', status: 'Overdue', dueDate: '2024-01-20', amount: 85000, balanceDue: 85000 },
  { id: '4', billNumber: 'BILL-2024-999', date: '2024-01-22', vendor: 'Uber Corporate', status: 'Paid', dueDate: '2024-01-22', amount: 850, balanceDue: 0 },
  { id: '5', billNumber: 'BILL-2024-102', date: '2024-01-25', vendor: 'Creative Agencies', status: 'Partially Paid', dueDate: '2024-02-10', amount: 150000, balanceDue: 50000 },
  { id: '6', billNumber: 'BILL-2024-110', date: '2024-01-28', vendor: 'Internet Service Provider', status: 'Unpaid', dueDate: '2024-02-05', amount: 2500, balanceDue: 2500 },
];

// --- Helper Components ---

const StatusBadge: React.FC<{ status: BillStatus }> = ({ status }) => {
  const styles = {
    Paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/30',
    Unpaid: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-900/30',
    Overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/30',
    'Partially Paid': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30',
  };

  const icons = {
    Paid: CheckCircle2,
    Unpaid: Clock,
    Overdue: AlertCircle,
    'Partially Paid': Clock,
  };

  const Icon = icons[status] || Clock;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      <Icon size={12} className="mr-1" />
      {status}
    </span>
  );
};

const BillDrawer: React.FC<{ bill: PurchaseBill | null; onClose: () => void }> = ({ bill, onClose }) => {
  if (!bill) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
             <h2 className="text-xl font-bold text-gray-900 dark:text-white">Purchase Bill Details</h2>
             <p className="text-sm text-gray-500 dark:text-gray-400">{bill.billNumber}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <StatusBadge status={bill.status} />
                <div className="flex space-x-2">
                    <button className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors" title="Edit">
                        <Edit size={18} />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors" title="Download PDF">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Vendor</h3>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{bill.vendor}</p>
                    <p className="text-sm text-gray-500">GSTIN: 27VENDOR1234X1Z5</p>
                    <p className="text-sm text-gray-500">Mumbai, Maharashtra</p>
                </div>
                <div className="text-right">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Dates</h3>
                    <p className="text-sm text-gray-500">Bill Date: <span className="text-gray-900 dark:text-white font-medium">{bill.date}</span></p>
                    <p className="text-sm text-gray-500">Due Date: <span className="text-gray-900 dark:text-white font-medium">{bill.dueDate}</span></p>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Line Items</h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-4 py-2">Item / Description</th>
                                <th className="px-4 py-2 text-right">Qty</th>
                                <th className="px-4 py-2 text-right">Rate</th>
                                <th className="px-4 py-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <tr>
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-200">Office Chairs & Tables</td>
                                <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">5</td>
                                <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">2,480</td>
                                <td className="px-4 py-2 text-right text-gray-900 dark:text-gray-200">12,400</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-base font-bold">
                    <span className="text-gray-900 dark:text-white">Total Amount</span>
                    <span className="text-gray-900 dark:text-white">₹ {bill.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mt-2 text-sm font-semibold text-red-600">
                    <span>Balance Due</span>
                    <span>₹ {bill.balanceDue.toLocaleString()}</span>
                </div>
            </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center">
                <CreditCard size={18} className="mr-2" />
                Record Outgoing Payment
            </button>
        </div>
      </div>
    </>
  );
};

// --- Main Component ---

const Purchases: React.FC<PurchasesProps> = ({ globalAction, resetGlobalAction }) => {
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [activeTab, setActiveTab] = useState<'bills' | 'scan' | 'debit-notes' | 'quick-expenses'>('bills');
  
  const [bills] = useState<PurchaseBill[]>(INITIAL_BILLS);
  const [selectedBill, setSelectedBill] = useState<PurchaseBill | null>(null);
  
  // State to hold data passed from ScanBill to NewPurchaseBill
  const [scannedData, setScannedData] = useState<any>(null);

  useEffect(() => {
    if (globalAction === 'new-bill') {
        setActiveTab('bills');
        setViewMode('create');
        if (resetGlobalAction) resetGlobalAction();
    }
  }, [globalAction, resetGlobalAction]);

  // Derived Metrics
  const totalBills = bills.length;
  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalOverdue = bills.filter(b => b.status === 'Overdue').reduce((sum, bill) => sum + bill.balanceDue, 0);
  const unpaidBalance = bills.reduce((sum, bill) => sum + bill.balanceDue, 0);

  const handleCreateFromScan = (data: any) => {
    setScannedData(data);
    setViewMode('create');
    setActiveTab('bills'); // Switch back to bills tab context for creation
  };

  if (viewMode === 'create' && activeTab === 'bills') {
    return (
      <NewPurchaseBill 
        onCancel={() => { 
          setViewMode('list'); 
          setScannedData(null); 
        }} 
        initialData={scannedData}
      />
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-1">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight px-1">Purchases & Expenses</h1>
            <div className="flex space-x-6 mt-4 overflow-x-auto no-scrollbar">
                <button 
                    onClick={() => setActiveTab('bills')}
                    className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'bills' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    Purchase Bills
                    {activeTab === 'bills' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>}
                </button>
                <button 
                    onClick={() => setActiveTab('scan')}
                    className={`pb-3 text-sm font-medium transition-colors relative flex items-center whitespace-nowrap ${activeTab === 'scan' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <Sparkles size={14} className="mr-1.5" />
                    Scan to Bill (AI)
                    {activeTab === 'scan' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>}
                </button>
                <button 
                    onClick={() => setActiveTab('debit-notes')}
                    className={`pb-3 text-sm font-medium transition-colors relative flex items-center whitespace-nowrap ${activeTab === 'debit-notes' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <RotateCcw size={14} className="mr-1.5" />
                    Debit Notes
                    {activeTab === 'debit-notes' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>}
                </button>
                <button 
                    onClick={() => setActiveTab('quick-expenses')}
                    className={`pb-3 text-sm font-medium transition-colors relative flex items-center whitespace-nowrap ${activeTab === 'quick-expenses' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <Wallet size={14} className="mr-1.5" />
                    Quick Expenses
                    {activeTab === 'quick-expenses' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>}
                </button>
            </div>
        </div>

        {activeTab === 'bills' && (
            <button 
                onClick={() => setViewMode('create')}
                className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-all mb-2 whitespace-nowrap"
            >
                <Plus size={18} className="mr-2" />
                New Purchase Bill
            </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'scan' ? (
        <ScanBill onCreateBill={handleCreateFromScan} />
      ) : activeTab === 'debit-notes' ? (
        <DebitNotes />
      ) : activeTab === 'quick-expenses' ? (
        <QuickExpenses />
      ) : (
        <>
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Bills</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{totalBills}</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                      <FileText size={20} />
                  </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">₹ {totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                      <DollarSign size={20} />
                  </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Overdue</p>
                      <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">₹ {totalOverdue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                      <AlertCircle size={20} />
                  </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Unpaid Balance</p>
                      <p className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1">₹ {unpaidBalance.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                      <CreditCard size={20} />
                  </div>
              </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex-1 flex flex-col overflow-hidden">
            
            {/* Toolbar: Search & Filters */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                
                {/* Left: Search */}
                <div className="relative w-full lg:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search Bill # or Vendor..." 
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
                    />
                </div>
                
                {/* Right: Filters */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    <select className="appearance-none bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
                        <option>All Status</option>
                        <option>Paid</option>
                        <option>Unpaid</option>
                        <option>Overdue</option>
                    </select>
                    <select className="appearance-none bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
                        <option>All Vendors</option>
                        <option>Office Supplies Co.</option>
                        <option>Tech Solutions Ltd</option>
                    </select>
                    <button className="flex items-center space-x-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 whitespace-nowrap">
                        <Calendar size={16} className="text-gray-400" />
                        <span>Date Range</span>
                    </button>
                </div>
            </div>

            {/* Table View */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3">Bill No.</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Vendor</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Due Date</th>
                            <th className="px-6 py-3 text-right">Amount</th>
                            <th className="px-6 py-3 text-right">Balance Due</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                        {bills.map((bill) => (
                            <tr 
                                key={bill.id} 
                                onClick={() => setSelectedBill(bill)}
                                className="hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer group"
                            >
                                <td className="px-6 py-4 font-medium text-primary-600 dark:text-primary-400">{bill.billNumber}</td>
                                <td className="px-6 py-4">{bill.date}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    <div className="flex items-center">
                                        <Briefcase size={14} className="mr-2 text-gray-400" />
                                        {bill.vendor}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={bill.status} />
                                </td>
                                <td className="px-6 py-4">{bill.dueDate}</td>
                                <td className="px-6 py-4 text-right font-medium">₹ {bill.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right text-gray-500">₹ {bill.balanceDue.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                        <button className="p-1 hover:text-primary-600 transition-colors" title="View">
                                            <Eye size={16} />
                                        </button>
                                        <button className="p-1 hover:text-blue-600 transition-colors" title="Edit">
                                            <Edit size={16} />
                                        </button>
                                        <button className="p-1 hover:text-green-600 transition-colors" title="Record Payment">
                                            <CreditCard size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing <span className="font-medium text-gray-900 dark:text-white">1</span> to <span className="font-medium text-gray-900 dark:text-white">{bills.length}</span> of <span className="font-medium text-gray-900 dark:text-white">{bills.length}</span> results
                </div>
                <div className="flex items-center space-x-2">
                    <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ChevronLeft size={16} />
                    </button>
                    <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
          </div>
        </>
      )}

      {/* Drawer */}
      <BillDrawer bill={selectedBill} onClose={() => setSelectedBill(null)} />

    </div>
  );
};

export default Purchases;
