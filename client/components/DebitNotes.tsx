import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  MoreVertical, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  Clock,
  FileText
} from 'lucide-react';
import NewDebitNote from './NewDebitNote';

// --- Types ---

type DNStatus = 'Open' | 'Adjusted';

interface DebitNote {
  id: string;
  dnNumber: string;
  date: string;
  vendor: string;
  linkedBill?: string;
  reason: string;
  amount: number;
  status: DNStatus;
}

// --- Mock Data ---

const MOCK_DNS: DebitNote[] = [
  { id: '1', dnNumber: 'DN-2024-001', date: '2024-01-20', vendor: 'Office Supplies Co.', linkedBill: 'BILL-2024-882', reason: 'Damaged goods', amount: 2400, status: 'Open' },
  { id: '2', dnNumber: 'DN-2024-002', date: '2024-01-22', vendor: 'Tech Solutions Ltd', linkedBill: 'BILL-2024-901', reason: 'Rate difference', amount: 5000, status: 'Adjusted' },
  { id: '3', dnNumber: 'DN-2024-003', date: '2024-01-25', vendor: 'Furniture Mart', reason: 'Late delivery penalty', amount: 1000, status: 'Open' },
];

const DebitNotes: React.FC = () => {
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [debitNotes] = useState<DebitNote[]>(MOCK_DNS);

  if (mode === 'create') {
    return <NewDebitNote onCancel={() => setMode('list')} />;
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
        
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-1 w-full gap-3">
                 <div className="relative w-full lg:w-72">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search DN # or Vendor..." 
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                </div>
                <button className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <Filter size={18} />
                </button>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                <div className="hidden sm:flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg text-sm">
                     <Calendar size={16} className="text-gray-400" />
                     <span>This Month</span>
                </div>
                <button 
                    onClick={() => setMode('create')}
                    className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors whitespace-nowrap"
                >
                    <Plus size={18} className="mr-2" />
                    New Debit Note
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3">DN No.</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Vendor</th>
                            <th className="px-6 py-3">Linked Bill</th>
                            <th className="px-6 py-3">Reason</th>
                            <th className="px-6 py-3 text-right">Amount</th>
                            <th className="px-6 py-3 text-center">Status</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                        {debitNotes.map((dn) => (
                            <tr key={dn.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group">
                                <td className="px-6 py-4 font-medium text-primary-600 dark:text-primary-400">{dn.dnNumber}</td>
                                <td className="px-6 py-4">{dn.date}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{dn.vendor}</td>
                                <td className="px-6 py-4">
                                    {dn.linkedBill ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                            <FileText size={10} className="mr-1" />
                                            {dn.linkedBill}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 max-w-xs truncate text-gray-500">{dn.reason}</td>
                                <td className="px-6 py-4 text-right font-medium">₹ {dn.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                        dn.status === 'Adjusted' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/30' 
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/30'
                                    }`}>
                                        {dn.status === 'Adjusted' ? <CheckCircle2 size={12} className="mr-1" /> : <Clock size={12} className="mr-1" />}
                                        {dn.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1 hover:text-primary-600 transition-colors" title="View">
                                            <Eye size={16} />
                                        </button>
                                        <button className="p-1 hover:text-blue-600 transition-colors" title="Edit">
                                            <Edit size={16} />
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
                    Showing <span className="font-medium text-gray-900 dark:text-white">1</span> to <span className="font-medium text-gray-900 dark:text-white">{debitNotes.length}</span> of <span className="font-medium text-gray-900 dark:text-white">{debitNotes.length}</span> results
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
    </div>
  );
};

export default DebitNotes;
