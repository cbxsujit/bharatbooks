
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Send, 
  X, 
  FileText, 
  Calendar, 
  User,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  LayoutGrid,
  List,
  GripVertical,
  MoreHorizontal,
  Repeat
} from 'lucide-react';
import NewInvoice from './NewInvoice';
import RecurringInvoices from './RecurringInvoices';

// --- Types ---

type InvoiceStatus = 'Paid' | 'Unpaid' | 'Overdue' | 'Partially Paid';

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customer: string;
  status: InvoiceStatus;
  dueDate: string;
  amount: number;
  balanceDue: number;
}

interface SalesProps {
  globalAction?: string | null;
  resetGlobalAction?: () => void;
}

// --- Mock Data ---

const INITIAL_INVOICES: Invoice[] = [
  { id: '1', invoiceNumber: 'INV-2024-001', date: '2024-01-15', customer: 'Acme Traders India Pvt Ltd', status: 'Paid', dueDate: '2024-01-30', amount: 125000, balanceDue: 0 },
  { id: '2', invoiceNumber: 'INV-2024-002', date: '2024-01-18', customer: 'Bharat Tech Solutions', status: 'Unpaid', dueDate: '2024-02-02', amount: 45000, balanceDue: 45000 },
  { id: '3', invoiceNumber: 'INV-2024-003', date: '2024-01-20', customer: 'Global Exports & Co.', status: 'Overdue', dueDate: '2024-01-25', amount: 250000, balanceDue: 250000 },
  { id: '4', invoiceNumber: 'INV-2024-004', date: '2024-01-22', customer: 'Sharma Enterprises', status: 'Paid', dueDate: '2024-02-06', amount: 12000, balanceDue: 0 },
  { id: '5', invoiceNumber: 'INV-2024-005', date: '2024-01-25', customer: 'Rapid Logistics', status: 'Partially Paid', dueDate: '2024-02-10', amount: 78500, balanceDue: 25000 },
  { id: '6', invoiceNumber: 'INV-2024-006', date: '2024-01-26', customer: 'Green Valley Organics', status: 'Overdue', dueDate: '2024-01-20', amount: 34000, balanceDue: 15000 },
  { id: '7', invoiceNumber: 'INV-2024-007', date: '2024-01-28', customer: 'Creative Studios', status: 'Unpaid', dueDate: '2024-02-12', amount: 56000, balanceDue: 56000 },
  { id: '8', invoiceNumber: 'INV-2024-008', date: '2024-01-29', customer: 'Acme Traders India Pvt Ltd', status: 'Unpaid', dueDate: '2024-02-14', amount: 15000, balanceDue: 15000 },
];

// --- Helper Components ---

const StatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
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

const InvoiceDrawer: React.FC<{ invoice: Invoice | null; onClose: () => void }> = ({ invoice, onClose }) => {
  if (!invoice) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
             <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoice Details</h2>
             <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.invoiceNumber}</p>
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
                <StatusBadge status={invoice.status} />
                <div className="flex space-x-2">
                    <button className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors" title="Edit">
                        <Edit size={18} />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors" title="Send">
                        <Send size={18} />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors" title="Download PDF">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Bill To</h3>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.customer}</p>
                    <p className="text-sm text-gray-500">GSTIN: 27ABCDE1234F1Z5</p>
                    <p className="text-sm text-gray-500">Mumbai, Maharashtra</p>
                </div>
                <div className="text-right">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Dates</h3>
                    <p className="text-sm text-gray-500">Issued: <span className="text-gray-900 dark:text-white font-medium">{invoice.date}</span></p>
                    <p className="text-sm text-gray-500">Due: <span className="text-gray-900 dark:text-white font-medium">{invoice.dueDate}</span></p>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Items</h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-4 py-2">Item</th>
                                <th className="px-4 py-2 text-right">Qty</th>
                                <th className="px-4 py-2 text-right">Rate</th>
                                <th className="px-4 py-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <tr>
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-200">Web Development Services</td>
                                <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">1</td>
                                <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">25,000</td>
                                <td className="px-4 py-2 text-right text-gray-900 dark:text-gray-200">25,000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-base font-bold">
                    <span className="text-gray-900 dark:text-white">Total Amount</span>
                    <span className="text-gray-900 dark:text-white">₹ {invoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mt-2 text-sm font-semibold text-red-600">
                    <span>Balance Due</span>
                    <span>₹ {invoice.balanceDue.toLocaleString()}</span>
                </div>
            </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors">
                Record Payment
            </button>
        </div>
      </div>
    </>
  );
};

const ConfirmationModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string; 
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-fade-in border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-colors"
          >
            Yes, Mark as Paid
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

const Sales: React.FC<SalesProps> = ({ globalAction, resetGlobalAction }) => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'recurring'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'board' | 'create'>('table');
  
  // Drag and Drop State
  const [draggedInvoice, setDraggedInvoice] = useState<Invoice | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [pendingDropInvoice, setPendingDropInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (globalAction === 'new-invoice') {
      setActiveTab('invoices');
      setViewMode('create');
      if (resetGlobalAction) resetGlobalAction();
    }
  }, [globalAction, resetGlobalAction]);

  // Derived Metrics
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'Overdue').reduce((sum, inv) => sum + inv.balanceDue, 0);

  // -- Drag Handlers --
  
  const handleDragStart = (e: React.DragEvent, invoice: Invoice) => {
    setDraggedInvoice(invoice);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumn: 'Unpaid' | 'Partially Paid' | 'Paid') => {
    e.preventDefault();
    
    if (!draggedInvoice) return;
    
    if (targetColumn === 'Paid' && draggedInvoice.status !== 'Paid') {
        setPendingDropInvoice(draggedInvoice);
        setShowPayModal(true);
    } else if (targetColumn !== 'Paid') {
        let newStatus: InvoiceStatus = targetColumn;
        if (targetColumn === 'Unpaid' && draggedInvoice.status === 'Overdue') {
            newStatus = 'Overdue';
        }
        updateInvoiceStatus(draggedInvoice.id, newStatus);
    }
    setDraggedInvoice(null);
  };

  const confirmPayment = () => {
    if (pendingDropInvoice) {
        const updatedInvoices = invoices.map(inv => 
            inv.id === pendingDropInvoice.id 
            ? { ...inv, status: 'Paid' as InvoiceStatus, balanceDue: 0 } 
            : inv
        );
        setInvoices(updatedInvoices);
    }
    setShowPayModal(false);
    setPendingDropInvoice(null);
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
      const updatedInvoices = invoices.map(inv => 
        inv.id === id ? { ...inv, status } : inv
      );
      setInvoices(updatedInvoices);
  };

  const renderBoardView = () => {
    const columns: { id: 'Unpaid' | 'Partially Paid' | 'Paid', title: string, color: string }[] = [
        { id: 'Unpaid', title: 'Unpaid', color: 'border-orange-200 bg-orange-50 dark:bg-orange-900/10' },
        { id: 'Partially Paid', title: 'Partially Paid', color: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10' },
        { id: 'Paid', title: 'Paid', color: 'border-green-200 bg-green-50 dark:bg-green-900/10' }
    ];

    return (
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
            <div className="flex h-full space-x-6 min-w-[1000px]">
                {columns.map(col => {
                    const colInvoices = invoices.filter(inv => {
                        if (col.id === 'Unpaid') return inv.status === 'Unpaid' || inv.status === 'Overdue';
                        return inv.status === col.id;
                    });

                    return (
                        <div 
                            key={col.id}
                            className={`flex-1 flex flex-col rounded-xl border ${col.color} dark:border-opacity-10 backdrop-blur-sm min-w-[300px]`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/30 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{col.title}</h3>
                                <span className="bg-white dark:bg-gray-800 text-gray-500 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                    {colInvoices.length}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {colInvoices.map(invoice => (
                                    <div
                                        key={invoice.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, invoice)}
                                        onClick={() => setSelectedInvoice(invoice)}
                                        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 cursor-grab active:cursor-grabbing transition-all group relative"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-1.5 py-0.5 rounded">
                                                {invoice.invoiceNumber}
                                            </span>
                                            <GripVertical size={16} className="text-gray-300" />
                                        </div>
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate" title={invoice.customer}>
                                            {invoice.customer}
                                        </h4>
                                        <div className="flex justify-between items-end mt-3">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Due: {invoice.dueDate}</p>
                                                <div className="mt-1">
                                                    <StatusBadge status={invoice.status} />
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400">Amount</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">₹ {invoice.amount.toLocaleString()}</p>
                                                {invoice.balanceDue > 0 && (
                                                    <p className="text-xs text-red-500 font-medium mt-0.5">Bal: ₹ {invoice.balanceDue.toLocaleString()}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {colInvoices.length === 0 && (
                                    <div className="h-full flex items-center justify-center text-gray-400 text-sm italic border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg m-2 p-4">
                                        Drop items here
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  const renderTableView = () => (
    <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <tr>
                    <th className="px-6 py-3">Invoice No.</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Due Date</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-right">Balance Due</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                {invoices.map((invoice) => (
                    <tr 
                        key={invoice.id} 
                        onClick={() => setSelectedInvoice(invoice)}
                        className="hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer group"
                    >
                        <td className="px-6 py-4 font-medium text-primary-600 dark:text-primary-400">{invoice.invoiceNumber}</td>
                        <td className="px-6 py-4">{invoice.date}</td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{invoice.customer}</td>
                        <td className="px-6 py-4">
                            <StatusBadge status={invoice.status} />
                        </td>
                        <td className="px-6 py-4">{invoice.dueDate}</td>
                        <td className="px-6 py-4 text-right font-medium">₹ {invoice.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-gray-500">₹ {invoice.balanceDue.toLocaleString()}</td>
                        <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                <button className="p-1 hover:text-primary-600 transition-colors" title="View">
                                    <Eye size={16} />
                                </button>
                                <button className="p-1 hover:text-blue-600 transition-colors" title="Edit">
                                    <Edit size={16} />
                                </button>
                                <button className="p-1 hover:text-green-600 transition-colors" title="Send">
                                    <Send size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );

  if (viewMode === 'create') {
    return <NewInvoice onCancel={() => setViewMode('table')} />;
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-1">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight px-1">Sales & Invoicing</h1>
            <div className="flex space-x-6 mt-4">
                <button 
                    onClick={() => setActiveTab('invoices')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'invoices' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    Invoices
                    {activeTab === 'invoices' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>}
                </button>
                <button 
                    onClick={() => setActiveTab('recurring')}
                    className={`pb-3 text-sm font-medium transition-colors relative flex items-center ${activeTab === 'recurring' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <Repeat size={14} className="mr-1.5" />
                    Recurring Templates
                    {activeTab === 'recurring' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>}
                </button>
            </div>
        </div>

        {/* Only show New Invoice button in Invoices tab */}
        {activeTab === 'invoices' && (
            <button 
                onClick={() => setViewMode('create')}
                className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-all mb-2"
            >
                <Plus size={18} className="mr-2" />
                New Invoice
            </button>
        )}
      </div>

      {/* Content Area based on Tab */}
      {activeTab === 'recurring' ? (
        <RecurringInvoices />
      ) : (
        <>
          {/* Summary Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Invoices</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalInvoices}</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                      <FileText size={24} />
                  </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹ {totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                      <CheckCircle2 size={24} />
                  </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Overdue</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">₹ {totalOverdue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                      <AlertCircle size={24} />
                  </div>
              </div>
          </div>

          {/* Main Invoices Content Area */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex-1 flex flex-col overflow-hidden">
            
            {/* Toolbar: Search, Filters, View Toggle */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                
                {/* Left: Search & Filters */}
                <div className="flex flex-1 flex-col lg:flex-row gap-3 w-full">
                    <div className="relative w-full lg:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search Invoice # or Customer..." 
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
                        />
                    </div>
                    
                    {/* Quick Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        <select className="appearance-none bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
                            <option>All Status</option>
                            <option>Paid</option>
                            <option>Unpaid</option>
                            <option>Overdue</option>
                        </select>
                        <button className="flex items-center space-x-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 whitespace-nowrap">
                            <Calendar size={16} className="text-gray-400" />
                            <span>This Month</span>
                        </button>
                    </div>
                </div>

                {/* Right: View Toggle */}
                <div className="flex items-center bg-white dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-600">
                    <button 
                        onClick={() => setViewMode('table')}
                        className={`p-1.5 rounded-md flex items-center space-x-2 text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        <List size={16} />
                        <span className="hidden sm:inline">List</span>
                    </button>
                    <button 
                        onClick={() => setViewMode('board')}
                        className={`p-1.5 rounded-md flex items-center space-x-2 text-sm font-medium transition-all ${viewMode === 'board' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        <LayoutGrid size={16} />
                        <span className="hidden sm:inline">Board</span>
                    </button>
                </div>
            </div>

            {/* View Content */}
            {viewMode === 'table' ? renderTableView() : renderBoardView()}

            {/* Pagination */}
            {viewMode === 'table' && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-medium text-gray-900 dark:text-white">1</span> to <span className="font-medium text-gray-900 dark:text-white">{invoices.length}</span> of <span className="font-medium text-gray-900 dark:text-white">{invoices.length}</span> results
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
            )}
          </div>
        </>
      )}

      {/* Modals & Drawers */}
      <InvoiceDrawer invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      
      <ConfirmationModal 
        isOpen={showPayModal}
        onClose={() => { setShowPayModal(false); setPendingDropInvoice(null); }}
        onConfirm={confirmPayment}
        title="Mark Invoice as Paid?"
        message={`Are you sure you want to mark ${pendingDropInvoice?.invoiceNumber} as fully paid? This will set the balance due to ₹ 0.`}
      />

    </div>
  );
};

export default Sales;
