
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Save, 
  ChevronLeft, 
  ChevronRight, 
  Merge, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  Building2, 
  AlertTriangle, 
  CheckCircle, 
  ToggleLeft, 
  ToggleRight, 
  RefreshCw, 
  Link, 
  FileText, 
  History, 
  ArrowRightLeft, 
  Check, 
  Square, 
  CheckSquare, 
  Lock
} from 'lucide-react';
import { Customer, Ledger, CustomerInput, AuditLogEntry } from '../types';
import { CustomerService, generateLedgerCode } from '../services/DomainService';
import { AuthService } from '../services/AuthService';

// --- Mock Data for List View ---
interface CustomerView extends Customer {
  ledgerCode?: string;
  outstandingBalance: number;
  ledgerGroup?: string;
}

const MOCK_CUSTOMERS: CustomerView[] = [
  { 
    id: '1', name: 'Acme Traders India Pvt Ltd', gstin: '27ABCDE1234F1Z5', 
    phone: '+91 98765 43210', email: 'accounts@acme.in', billingAddress: 'Mumbai, Maharashtra', 
    ledgerId: 'L-101', ledgerCode: 'ACME-001', outstandingBalance: 45000, ledgerGroup: 'Sundry Debtors',
    createdBy: 'Admin', createdAt: new Date('2023-01-15'), updatedAt: new Date('2023-01-15') 
  },
  { 
    id: '2', name: 'Bharat Tech Solutions', gstin: '29XYZZZ9876L1Z2', 
    phone: '+91 99887 76655', email: 'finance@bharattech.com', billingAddress: 'Bangalore, Karnataka', 
    ledgerId: 'L-102', ledgerCode: 'BHAR-055', outstandingBalance: 12000, ledgerGroup: 'Sundry Debtors',
    createdBy: 'Admin', createdAt: new Date('2023-02-20'), updatedAt: new Date('2023-02-20') 
  },
  { 
    id: '3', name: 'Global Exports & Co.', gstin: '07QQQQQ1111A1Z9', 
    phone: '+91 88776 65544', email: 'info@globalexports.io', billingAddress: 'New Delhi', 
    ledgerId: 'L-103', ledgerCode: 'GLOB-999', outstandingBalance: -5000, ledgerGroup: 'Sundry Debtors',
    createdBy: 'Admin', createdAt: new Date('2023-03-10'), updatedAt: new Date('2023-03-10') 
  },
  { 
    id: '4', name: 'Sharma Enterprises', gstin: '24AAAAA9999A1Z1', 
    phone: '+91 77665 54433', email: 'sharma.ent@gmail.com', billingAddress: 'Ahmedabad, Gujarat', 
    ledgerId: 'L-104', ledgerCode: 'SHAR-123', outstandingBalance: 0, ledgerGroup: 'Sundry Debtors',
    createdBy: 'Sales', createdAt: new Date('2023-05-05'), updatedAt: new Date('2023-05-05') 
  },
  {
    id: '5', name: 'Rapid Logistics', gstin: '',
    phone: '+91 98700 12345', email: 'billing@rapidlogistics.in', billingAddress: 'Pune, Maharashtra',
    ledgerId: 'L-105', ledgerCode: 'RAPI-001', outstandingBalance: 28500, ledgerGroup: 'Sundry Debtors',
    createdBy: 'Manager', createdAt: new Date('2023-06-12'), updatedAt: new Date('2023-06-12')
  },
  {
    id: '6', name: 'Green Valley Organics', gstin: '27GVORG1234X1Z1',
    phone: '+91 99988 77766', email: 'contact@greenvalley.org', billingAddress: 'Nashik, Maharashtra',
    ledgerId: 'L-106', ledgerCode: 'GREE-101', outstandingBalance: 1500, ledgerGroup: 'Sundry Debtors',
    createdBy: 'Sales', createdAt: new Date('2023-07-01'), updatedAt: new Date('2023-07-01')
  },
  {
    id: '7', name: 'Acme Trades', gstin: '27ABCDE1234F1Z5', // Intentional duplicate for demo
    phone: '+91 98765 43210', email: 'accounts@acmetrades.in', billingAddress: 'Mumbai',
    ledgerId: 'L-107', ledgerCode: 'ACME-002', outstandingBalance: 5000, ledgerGroup: 'Sundry Debtors',
    createdBy: 'Admin', createdAt: new Date('2023-08-15'), updatedAt: new Date('2023-08-15')
  }
];

// Mock Ledgers for Matching Simulation (Hidden from view usually)
const MOCK_EXISTING_LEDGERS: Ledger[] = [
    { id: 'L-101', ledgerName: 'Acme Traders India Pvt Ltd', ledgerCode: 'ACME-001', group: 'Sundry Debtors', openingBalance: 0, balanceType: 'Dr', gstApplicable: true, contactMeta: { gstin: '27ABCDE1234F1Z5' }, createdBy: 'sys', createdAt: new Date(), updatedAt: new Date() },
    { id: 'L-999', ledgerName: 'Old Global Exports', ledgerCode: 'OLD-GLO', group: 'Sundry Debtors', openingBalance: 500, balanceType: 'Dr', gstApplicable: false, contactMeta: { email: 'info@global.com' }, createdBy: 'sys', createdAt: new Date(), updatedAt: new Date() }
];

const STATES = ['Maharashtra', 'Karnataka', 'Delhi', 'Gujarat', 'Tamil Nadu', 'Uttar Pradesh', 'Telangana', 'Rajasthan'];
const PAYMENT_TERMS = ['Due on Receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60'];

// --- View Customer Drawer ---

const CustomerDrawer: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  customer: CustomerView | null; 
}> = ({ isOpen, onClose, customer }) => {
  if (!isOpen || !customer) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[60] w-full sm:w-[500px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in-right">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div>
             <h2 className="text-xl font-bold text-gray-900 dark:text-white">{customer.name}</h2>
             <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${customer.gstin ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {customer.gstin ? 'Registered' : 'Unregistered'}
                </span>
                <span className="text-sm text-gray-500">{customer.ledgerCode}</span>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Ledger Summary Card */}
            <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-primary-800 dark:text-primary-300 uppercase tracking-wider mb-3 flex items-center">
                    <Briefcase size={14} className="mr-1.5" /> Linked Ledger Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">Ledger Name</p>
                        <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">Group</p>
                        <p className="font-medium text-gray-900 dark:text-white">{customer.ledgerGroup || 'Sundry Debtors'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">Current Balance</p>
                        <p className={`font-bold ${customer.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ₹ {Math.abs(customer.outstandingBalance).toLocaleString()} {customer.outstandingBalance >= 0 ? 'Dr' : 'Cr'}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">GST Treatment</p>
                        <p className="font-medium text-gray-900 dark:text-white">{customer.gstin ? 'Regular' : 'Unregistered'}</p>
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 pb-2">Contact Information</h3>
                
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start">
                        <Mail size={16} className="mt-0.5 mr-3 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-xs">Email Address</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.email || '-'}</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <Phone size={16} className="mt-0.5 mr-3 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-xs">Phone Number</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.phone || '-'}</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <MapPin size={16} className="mt-0.5 mr-3 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-xs">Billing Address</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.billingAddress || '-'}</p>
                        </div>
                    </div>
                     <div className="flex items-start">
                        <Building2 size={16} className="mt-0.5 mr-3 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-xs">GSTIN</p>
                            <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">{customer.gstin || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm">
                View Ledger Report
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                Close
            </button>
        </div>
      </div>
    </>
  );
};

// --- Sync & Audit Drawer ---

const SyncAuditDrawer: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void;
    onSync: () => void;
    logs: AuditLogEntry[];
}> = ({ isOpen, onClose, onSync, logs }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 z-[60] w-full sm:w-[500px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in-right">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                            <History size={20} className="mr-2 text-primary-600" />
                            Ledger Sync & Audit
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Backfill missing ledgers and track changes.</p>
                    </div>
                    <button onClick={onClose}><X size={24} className="text-gray-500" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-2">Auto-Sync Operation</h4>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mb-4">
                            This will check all customers without a linked ledger. If a matching ledger exists (by GSTIN/Name), it will link them. Otherwise, it creates a new ledger.
                        </p>
                        <button onClick={onSync} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
                            <RefreshCw size={16} className="mr-2" /> Run Sync
                        </button>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Recent Activity Log</h4>
                        <div className="space-y-3">
                            {logs.length > 0 ? logs.map(log => (
                                <div key={log.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800">
                                    <div className="flex justify-between mb-1">
                                        <span className={`font-bold text-xs px-2 py-0.5 rounded ${log.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {log.action}
                                        </span>
                                        <span className="text-xs text-gray-400">{log.timestamp.toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-gray-800 dark:text-gray-200 font-medium">{log.description}</p>
                                    {log.details && <p className="text-xs text-gray-500 mt-1">{log.details}</p>}
                                </div>
                            )) : (
                                <p className="text-center text-gray-400 text-sm py-4">No audit logs found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// --- Merge Compare Drawer ---

interface MergeDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCustomers: CustomerView[];
    onMerge: (primaryId: string, mergeBalances: boolean) => void;
}

const MergeDrawer: React.FC<MergeDrawerProps> = ({ isOpen, onClose, selectedCustomers, onMerge }) => {
    const [primaryId, setPrimaryId] = useState<string>('');
    const [mergeBalances, setMergeBalances] = useState(true);

    useEffect(() => {
        if (isOpen && selectedCustomers.length > 0) {
            // Default primary is the one with GSTIN or the first one
            const priority = selectedCustomers.find(c => c.gstin) || selectedCustomers[0];
            setPrimaryId(priority.id);
        }
    }, [isOpen, selectedCustomers]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (window.confirm("Are you sure? This will merge records and cannot be fully undone (audit trail kept).")) {
            onMerge(primaryId, mergeBalances);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 z-[60] w-full sm:w-[800px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in-right">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                            <Merge size={20} className="mr-2 text-orange-600" />
                            Merge Customers
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Select primary record and consolidation options.</p>
                    </div>
                    <button onClick={onClose}><X size={24} className="text-gray-500" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Comparison Table */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left w-32">Field</th>
                                    {selectedCustomers.map(c => (
                                        <th key={c.id} className={`px-4 py-3 text-left ${primaryId === c.id ? 'bg-green-50 dark:bg-green-900/10' : ''}`}>
                                            <div className="flex items-center space-x-2">
                                                <input 
                                                    type="radio" 
                                                    name="primary" 
                                                    checked={primaryId === c.id} 
                                                    onChange={() => setPrimaryId(c.id)}
                                                    className="text-green-600 focus:ring-green-500 cursor-pointer"
                                                />
                                                <span className={primaryId === c.id ? 'text-green-700 dark:text-green-400 font-bold' : ''}>
                                                    {primaryId === c.id ? 'Primary' : 'Secondary'}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {[
                                    { label: 'Name', key: 'name' },
                                    { label: 'GSTIN', key: 'gstin' },
                                    { label: 'Email', key: 'email' },
                                    { label: 'Phone', key: 'phone' },
                                    { label: 'Ledger', key: 'ledgerCode' },
                                    { label: 'Outstanding', key: 'outstandingBalance', format: (v: number) => `₹ ${v.toLocaleString()}` }
                                ].map((row) => (
                                    <tr key={row.label}>
                                        <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-900/30">{row.label}</td>
                                        {selectedCustomers.map(c => (
                                            <td key={c.id} className={`px-4 py-3 text-gray-900 dark:text-white ${primaryId === c.id ? 'bg-green-50/30 dark:bg-green-900/5 font-medium' : ''}`}>
                                                {row.format ? row.format((c as any)[row.key]) : ((c as any)[row.key] || '-')}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Options */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Merge Configuration</h4>
                        
                        <div className="flex items-start space-x-3">
                            <input 
                                type="checkbox" 
                                id="mergeBal" 
                                checked={mergeBalances} 
                                onChange={(e) => setMergeBalances(e.target.checked)}
                                className="mt-1 w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                            />
                            <div>
                                <label htmlFor="mergeBal" className="block text-sm font-medium text-gray-900 dark:text-white">Merge Ledger Balances</label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    If checked, outstanding amounts from secondary records will be added to the primary record's ledger.
                                    Otherwise, secondary balances are ignored (not recommended if they represent real debt).
                                </p>
                            </div>
                        </div>
                        
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-300 flex items-start">
                            <AlertTriangle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                            <p>
                                Secondary records will be soft-deleted. All historical transactions (Invoices/Payments) associated with secondary records will be re-linked to the Primary Record: <strong>{selectedCustomers.find(c => c.id === primaryId)?.name}</strong>.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleConfirm} className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center">
                        <Merge size={18} className="mr-2" /> Confirm Merge
                    </button>
                </div>
            </div>
        </>
    );
};

// --- New Customer Drawer Component ---

interface NewCustomerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer, ledger?: Ledger) => void;
  initialData?: CustomerView | null;
}

const NewCustomerDrawer: React.FC<NewCustomerDrawerProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const canCreateLedger = AuthService.hasPermission('ledger.create');

  const initialFormState: CustomerInput = {
    name: '',
    displayName: '',
    gstin: '',
    pan: '',
    email: '',
    phone: '',
    billingAddress: '',
    shippingAddress: '',
    defaultPaymentTerms: 'Net 30',
    defaultPlaceOfSupply: '',
    createLedger: canCreateLedger, // Respect permission
    ledgerCode: '',
    openingBalance: 0,
    balanceType: 'Dr',
    notes: '',
    existingLedgerId: ''
  };

  const [formData, setFormData] = useState<CustomerInput>(initialFormState);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSameShipping, setIsSameShipping] = useState(true);
  
  // Matching State
  const [suggestedLedger, setSuggestedLedger] = useState<Ledger | null>(null);
  const [matchReason, setMatchReason] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            // Populate for Edit Mode
            setFormData({
                name: initialData.name,
                displayName: initialData.displayName || '',
                gstin: initialData.gstin,
                pan: initialData.pan || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                billingAddress: initialData.billingAddress || '',
                shippingAddress: initialData.shippingAddress || '',
                defaultPaymentTerms: initialData.defaultPaymentTerms || 'Net 30',
                defaultPlaceOfSupply: initialData.defaultPlaceOfSupply || '',
                createLedger: false, // Ledger already exists
                ledgerCode: initialData.ledgerCode || '',
                openingBalance: initialData.outstandingBalance, // Simulating opening balance edit
                balanceType: initialData.outstandingBalance >= 0 ? 'Dr' : 'Cr',
                notes: '',
                existingLedgerId: initialData.ledgerId
            });
        } else {
            // Reset for Create Mode
            setFormData(initialFormState);
        }
        setErrors({});
        setIsSameShipping(true);
        setSuggestedLedger(null);
    }
  }, [isOpen, initialData]);

  // Auto-generate Ledger Code and Check for Matches (Only in Create Mode)
  useEffect(() => {
      if (!initialData && formData.name && !formData.ledgerCode) {
          setFormData(prev => ({ ...prev, ledgerCode: generateLedgerCode(prev.name) }));
      }
      
      // Real-time check (Mocking with timeout) - Only if creating new
      if (!initialData) {
          const timer = setTimeout(() => {
              if (formData.name || formData.gstin || formData.email) {
                const match = CustomerService.findMatchingLedger(formData, MOCK_EXISTING_LEDGERS);
                if (match.matchFound && match.ledger) {
                    setSuggestedLedger(match.ledger);
                    setMatchReason(match.reason || 'Similar Record');
                } else {
                    setSuggestedLedger(null);
                }
              }
          }, 800);
          return () => clearTimeout(timer);
      }

  }, [formData.name, formData.gstin, formData.email, formData.phone, initialData]);

  const handleChange = (field: keyof CustomerInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
        setErrors(prev => {
            const newErrs = { ...prev };
            delete newErrs[field];
            return newErrs;
        });
    }
  };

  const useSuggestedLedger = () => {
      if (suggestedLedger) {
          setFormData(prev => ({
              ...prev,
              createLedger: false,
              existingLedgerId: suggestedLedger.id
          }));
      }
  };

  const validate = () => {
      const newErrors: {[key: string]: string} = {};
      if (!formData.name.trim()) newErrors.name = "Customer Name is required";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
      if (validate()) {
          try {
              const payload = { 
                  ...formData, 
                  shippingAddress: isSameShipping ? formData.billingAddress : formData.shippingAddress 
              };
              
              // For mock purposes, we use the same create service even for edit, 
              // but in real app this would be separate UpdateCustomer logic.
              // Here we just return the object to update state.
              const { customer, ledger } = CustomerService.createCustomerWithLedger(payload);
              
              // If editing, preserve original ID (simulated)
              if (initialData) {
                  customer.id = initialData.id;
              }

              onSave(customer, ledger || suggestedLedger || undefined);
              onClose();
          } catch (e: any) {
              alert("Error: " + e.message);
          }
      }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[60] w-full sm:w-[600px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-200 dark:border-gray-700 animate-slide-in-right">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{initialData ? 'Edit Customer' : 'New Customer'}</h2>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Match Suggestion */}
              {!initialData && suggestedLedger && formData.createLedger && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg animate-fade-in">
                      <div className="flex items-start">
                          <AlertTriangle size={20} className="text-orange-600 dark:text-orange-400 mr-3 mt-0.5" />
                          <div className="flex-1">
                              <h4 className="text-sm font-bold text-orange-800 dark:text-orange-300">Potential Duplicate Ledger Found</h4>
                              <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                                  We found a ledger "<strong>{suggestedLedger.ledgerName}</strong>" matching {matchReason}.
                              </p>
                              <button 
                                onClick={useSuggestedLedger}
                                className="mt-3 flex items-center text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded transition-colors"
                              >
                                  <Link size={12} className="mr-1.5" /> Link to Existing Ledger
                              </button>
                          </div>
                      </div>
                  </div>
              )}

              {/* 1. Basic Info */}
              <section className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 pb-2">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name <span className="text-red-500">*</span></label>
                          <input 
                              type="text" 
                              value={formData.name}
                              onChange={e => handleChange('name', e.target.value)}
                              className={`w-full bg-gray-50 dark:bg-gray-800 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                              autoFocus
                          />
                      </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GSTIN</label>
                          <input 
                              type="text" 
                              value={formData.gstin}
                              onChange={e => handleChange('gstin', e.target.value.toUpperCase())}
                              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white uppercase"
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
                  </div>
              </section>

              {/* 3. Accounting & Ledger */}
              <section className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Accounting</h3>
                      
                      {!initialData && canCreateLedger ? (
                          <button 
                            onClick={() => handleChange('createLedger', !formData.createLedger)}
                            className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors"
                            disabled={!!formData.existingLedgerId}
                          >
                              {formData.createLedger ? <ToggleRight size={24} className="text-primary-600 mr-2" /> : <ToggleLeft size={24} className="mr-2" />}
                              Create Ledger
                          </button>
                      ) : (
                         // In edit mode or restricted mode
                         <span className="text-xs text-gray-400 italic">Ledger settings managed by admin</span>
                      )}
                  </div>
                  
                  {formData.existingLedgerId ? (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800 flex items-center justify-between">
                          <div>
                              <p className="text-xs font-bold text-green-800 dark:text-green-300 uppercase">Linked to Existing Ledger</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{suggestedLedger?.ledgerName || formData.ledgerCode}</p>
                          </div>
                          {!initialData && (
                            <button 
                                onClick={() => { setFormData(prev => ({ ...prev, existingLedgerId: '', createLedger: canCreateLedger })); }}
                                className="p-1 bg-white dark:bg-gray-800 rounded shadow-sm hover:text-red-600"
                            >
                                <X size={16} />
                            </button>
                          )}
                      </div>
                  ) : formData.createLedger || initialData ? (
                      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800 grid grid-cols-2 gap-4 animate-fade-in">
                          <div>
                              <label className="block text-xs font-medium text-blue-800 dark:text-blue-300 mb-1 uppercase">Ledger Name</label>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{formData.name || '—'}</p>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ledger Code</label>
                              <input 
                                  type="text" 
                                  value={formData.ledgerCode}
                                  onChange={e => handleChange('ledgerCode', e.target.value)}
                                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white font-mono"
                                  disabled={!!initialData} // Lock code on edit
                              />
                          </div>
                      </div>
                  ) : (
                      <div className="flex items-start p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 text-sm">
                          <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                          <p>
                              Ledger creation is disabled. This customer will be created without a linked ledger account. {canCreateLedger ? 'You can map a ledger later.' : 'Contact admin to enable ledger creation.'}
                          </p>
                      </div>
                  )}
              </section>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
              <button onClick={onClose} className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Cancel
              </button>
              <button onClick={handleSave} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center">
                  <Save size={18} className="mr-2" /> {initialData ? 'Update Customer' : 'Save Customer'}
              </button>
          </div>
      </div>
    </>
  );
};

// --- Main Component ---

export default function CustomerMaster() {
  const [customers, setCustomers] = useState<CustomerView[]>(MOCK_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [isMergeOpen, setIsMergeOpen] = useState(false);
  
  // Drawers State
  const [viewCustomer, setViewCustomer] = useState<CustomerView | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerView | null>(null);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Duplicate Warning State
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  // Permissions
  const canView = AuthService.hasPermission('customer.view');
  const canCreate = AuthService.hasPermission('customer.create');
  const canEdit = AuthService.hasPermission('customer.edit');
  const canDelete = AuthService.hasPermission('customer.delete');
  const canMerge = AuthService.hasPermission('customer.merge');
  const canImport = AuthService.hasPermission('customer.import');
  const canExport = AuthService.hasPermission('customer.export');

  // Duplicate Detection on Mount
  useEffect(() => {
      const gstinCounts = customers.reduce((acc, c) => {
          if (c.gstin) acc[c.gstin] = (acc[c.gstin] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);
      
      const hasDupes = Object.values(gstinCounts).some((count: number) => count > 1);
      if (hasDupes) setShowDuplicateWarning(true);
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    if (!canView) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return customers.filter(c => 
      (c.name || '').toLowerCase().includes(lowerQuery) || 
      (c.gstin || '').toLowerCase().includes(lowerQuery)
    );
  }, [customers, searchQuery, canView]);

  // Checkbox logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          setSelectedIds(new Set(filteredCustomers.map(c => c.id)));
      } else {
          setSelectedIds(new Set());
      }
  };

  const handleSelectRow = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const handleCustomerSave = (customer: Customer, ledger?: Ledger) => {
    if (editingCustomer) {
        // Update Logic
        const updatedCustomers = customers.map(c => 
            c.id === customer.id ? { ...c, ...customer, ledgerCode: ledger?.ledgerCode || c.ledgerCode } : c
        );
        setCustomers(updatedCustomers);
        setToastMessage(`Customer updated successfully.`);
        setEditingCustomer(null);
    } else {
        // Create Logic
        const newCustomerView: CustomerView = {
            ...customer,
            ledgerCode: ledger?.ledgerCode,
            outstandingBalance: ledger?.openingBalance || 0
        };
        setCustomers([newCustomerView, ...customers]);
        setToastMessage(`Customer created successfully.`);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRunSync = () => {
      const { updatedCustomers, logs } = CustomerService.runLedgerSync(customers, MOCK_EXISTING_LEDGERS);
      
      // Sync logic for view update
      const merged = customers.map(c => {
          const updated = updatedCustomers.find(uc => uc.id === c.id);
          if (updated) return { ...c, ledgerId: updated.ledgerId, ledgerCode: 'SYNCED-AUTO' };
          return c;
      });
      
      setCustomers(merged);
      setAuditLogs([...logs, ...auditLogs]);
      setToastMessage(`Sync Complete. ${logs.length} updates.`);
      setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMerge = (primaryId: string, mergeBalances: boolean) => {
      try {
          const result = CustomerService.mergeCustomers(
              primaryId, 
              (Array.from(selectedIds) as string[]).filter(id => id !== primaryId),
              customers,
              mergeBalances
          );

          // Update View
          const updatedList = customers
            .filter(c => !result.mergedIds.includes(c.id)) // Remove merged
            .map(c => c.id === primaryId ? { ...c, outstandingBalance: result.consolidatedBalance } : c); // Update primary
          
          setCustomers(updatedList);
          setAuditLogs([result.auditLog, ...auditLogs]);
          setSelectedIds(new Set());
          setIsMergeOpen(false);
          setToastMessage(`Merged ${result.mergedIds.length + 1} records successfully.`);
          setTimeout(() => setToastMessage(null), 3000);
      } catch (e: any) {
          alert(e.message);
      }
  };

  const handleDelete = (id: string) => {
      if (!canDelete) {
          alert("Permission denied.");
          return;
      }
      if (confirm("Are you sure you want to delete this customer?")) {
          setCustomers(prev => prev.filter(c => c.id !== id));
          setToastMessage("Customer deleted.");
          setTimeout(() => setToastMessage(null), 3000);
      }
  };

  const handleEdit = (customer: CustomerView) => {
      setEditingCustomer(customer);
      setIsCreateOpen(true);
  };

  if (!canView) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 animate-fade-in">
              <Lock size={48} className="mb-4 opacity-50" />
              <h3 className="text-lg font-bold">Access Restricted</h3>
              <p>You do not have permission to view this page.</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
        
        {/* Duplicate Warning Banner */}
        {showDuplicateWarning && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3 mb-4 rounded-lg flex items-center justify-between animate-fade-in-down">
                <div className="flex items-center text-orange-800 dark:text-orange-300 text-sm">
                    <AlertTriangle size={16} className="mr-2" />
                    <span><strong>Warning:</strong> Duplicate GSTINs detected in customer list.</span>
                </div>
                <button 
                    onClick={() => {
                        // Pre-select duplicates logic would go here for real app
                        setIsMergeOpen(true); 
                    }}
                    className="text-xs font-bold text-orange-700 dark:text-orange-400 hover:underline"
                >
                    Open Merge Tool
                </button>
            </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-6">
            <div className="flex flex-1 w-full gap-3">
                <div className="relative w-full sm:w-72">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search Customer..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                </div>
                
                {/* Merge Action */}
                {canMerge && selectedIds.size > 1 && (
                    <button 
                        onClick={() => setIsMergeOpen(true)}
                        className="flex items-center px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors animate-fade-in"
                    >
                        <ArrowRightLeft size={18} className="mr-2" />
                        Merge ({selectedIds.size})
                    </button>
                )}
            </div>
            
            <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
                <button 
                    onClick={() => setIsSyncOpen(true)}
                    className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    <RefreshCw size={18} className="mr-2" />
                    Sync & Audit
                </button>
                
                {canImport && (
                    <button className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" title="Import CSV">
                        <Upload size={18} />
                    </button>
                )}
                
                {canExport && (
                    <button className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" title="Export CSV">
                        <Download size={18} />
                    </button>
                )}
                
                {canCreate && (
                    <button 
                        onClick={() => { setEditingCustomer(null); setIsCreateOpen(true); }}
                        className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors whitespace-nowrap"
                    >
                        <Plus size={18} className="mr-2" />
                        New Customer
                    </button>
                )}
            </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 w-12 text-center">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                    onChange={handleSelectAll}
                                    checked={selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0}
                                />
                            </th>
                            <th className="px-6 py-3">Customer Name</th>
                            <th className="px-6 py-3">GSTIN</th>
                            <th className="px-6 py-3">Ledger Code</th>
                            <th className="px-6 py-3 text-right">Outstanding (₹)</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                        {filteredCustomers.map((customer) => (
                            <tr key={customer.id} className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group ${selectedIds.has(customer.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                <td className="px-4 py-4 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                        checked={selectedIds.has(customer.id)}
                                        onChange={() => handleSelectRow(customer.id)}
                                    />
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{customer.name}</td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{customer.gstin || '-'}</td>
                                <td className="px-6 py-4 font-mono text-xs bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded w-fit">{customer.ledgerCode}</td>
                                <td className="px-6 py-4 text-right font-medium">{customer.outstandingBalance.toLocaleString()}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button 
                                            onClick={() => setViewCustomer(customer)}
                                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-primary-600 transition-colors" 
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        
                                        {canEdit && (
                                            <button 
                                                onClick={() => handleEdit(customer)}
                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-blue-600 transition-colors" 
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                        )}
                                        
                                        {canDelete && (
                                            <button 
                                                onClick={() => handleDelete(customer.id)}
                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-red-600 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Drawers */}
        <CustomerDrawer 
            isOpen={!!viewCustomer}
            onClose={() => setViewCustomer(null)}
            customer={viewCustomer}
        />

        <NewCustomerDrawer 
            isOpen={isCreateOpen}
            onClose={() => { setIsCreateOpen(false); setEditingCustomer(null); }}
            onSave={handleCustomerSave}
            initialData={editingCustomer}
        />
        
        <SyncAuditDrawer 
            isOpen={isSyncOpen}
            onClose={() => setIsSyncOpen(false)}
            onSync={handleRunSync}
            logs={auditLogs}
        />

        <MergeDrawer 
            isOpen={isMergeOpen}
            onClose={() => setIsMergeOpen(false)}
            selectedCustomers={customers.filter(c => selectedIds.has(c.id))}
            onMerge={handleMerge}
        />

        {/* Success Toast */}
        {toastMessage && (
            <div className="fixed bottom-6 right-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-3 rounded-lg shadow-lg flex items-center animate-bounce-in z-50">
                <CheckCircle size={18} className="mr-2 text-green-500" />
                {toastMessage}
            </div>
        )}
    </div>
  );
}
