
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  Download, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight,
  FileText,
  ChevronDown
} from 'lucide-react';

// --- Types ---

interface LedgerItem {
  id: string;
  name: string;
  code: string;
  unit: string;
  currentStock: number;
  openingStock: number; // Mock opening for the selected period
  openingValue: number;
}

type VoucherType = 'Purchase' | 'Purchase Return' | 'Sales' | 'Sales Return' | 'Journal' | 'Adjustment' | 'Opening Balance';

interface LedgerEntry {
  id: string;
  date: string;
  voucherType: VoucherType;
  voucherNo: string;
  inwardQty: number;
  outwardQty: number;
  rate: number;
}

// --- Mock Data ---

const MOCK_ITEMS_LIST: LedgerItem[] = [
  { id: '1', name: 'Dell XPS 15 Laptop', code: 'IT-LPT-001', unit: 'Nos', currentStock: 24, openingStock: 15, openingValue: 1350000 },
  { id: '2', name: 'Wireless Mouse', code: 'IT-ACC-005', unit: 'Nos', currentStock: 0, openingStock: 50, openingValue: 17500 },
  { id: '3', name: 'Office Chair Ergo', code: 'FUR-CHR-002', unit: 'Nos', currentStock: 4, openingStock: 10, openingValue: 65000 },
];

const MOCK_ENTRIES_DELL: LedgerEntry[] = [
  { id: '1', date: '2024-01-01', voucherType: 'Opening Balance', voucherNo: '-', inwardQty: 15, outwardQty: 0, rate: 90000 },
  { id: '2', date: '2024-01-05', voucherType: 'Purchase', voucherNo: 'PUR-001', inwardQty: 10, outwardQty: 0, rate: 92000 },
  { id: '3', date: '2024-01-10', voucherType: 'Sales', voucherNo: 'INV-001', inwardQty: 0, outwardQty: 2, rate: 110000 },
  { id: '4', date: '2024-01-15', voucherType: 'Sales', voucherNo: 'INV-005', inwardQty: 0, outwardQty: 1, rate: 112000 },
  { id: '5', date: '2024-01-20', voucherType: 'Sales Return', voucherNo: 'CN-001', inwardQty: 1, outwardQty: 0, rate: 110000 },
  { id: '6', date: '2024-01-25', voucherType: 'Purchase Return', voucherNo: 'DN-001', inwardQty: 0, outwardQty: 1, rate: 92000 },
  { id: '7', date: '2024-01-28', voucherType: 'Sales', voucherNo: 'INV-022', inwardQty: 0, outwardQty: 2, rate: 115000 },
];

const MOCK_ENTRIES_MOUSE: LedgerEntry[] = [
  { id: '1', date: '2024-01-01', voucherType: 'Opening Balance', voucherNo: '-', inwardQty: 50, outwardQty: 0, rate: 350 },
  { id: '2', date: '2024-01-10', voucherType: 'Sales', voucherNo: 'INV-002', inwardQty: 0, outwardQty: 20, rate: 600 },
  { id: '3', date: '2024-01-15', voucherType: 'Sales', voucherNo: 'INV-008', inwardQty: 0, outwardQty: 30, rate: 600 },
];

const StockLedger: React.FC = () => {
  const [selectedItemId, setSelectedItemId] = useState<string>(MOCK_ITEMS_LIST[0].id);
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-01-31' });
  const [warehouse, setWarehouse] = useState('All');
  const [transactionFilter, setTransactionFilter] = useState<'All' | 'In' | 'Out'>('All');

  // Helpers
  const selectedItem = useMemo(() => MOCK_ITEMS_LIST.find(i => i.id === selectedItemId), [selectedItemId]);
  
  const rawEntries = useMemo(() => {
    if (selectedItemId === '1') return MOCK_ENTRIES_DELL;
    if (selectedItemId === '2') return MOCK_ENTRIES_MOUSE;
    return [];
  }, [selectedItemId]);

  const filteredEntries = useMemo(() => {
    return rawEntries.filter(entry => {
      if (transactionFilter === 'In') return entry.inwardQty > 0;
      if (transactionFilter === 'Out') return entry.outwardQty > 0;
      return true;
    });
  }, [rawEntries, transactionFilter]);

  // Running Balance Calculation
  const { entriesWithBalance, totals } = useMemo(() => {
    let balanceQty = 0;
    let totalIn = 0;
    let totalOut = 0;

    // If filtering "In" or "Out" only, running balance usually loses context in standard ledgers, 
    // but typically you show the full ledger and just highlight/filter rows. 
    // For true ledger, we usually calculate balance sequentially on ALL entries, then filter for display if needed.
    // Here we calculate balance on the raw list first.
    
    const calculated = rawEntries.map(entry => {
      // Opening Balance logic handled loosely here for mock
      if (entry.voucherType === 'Opening Balance') {
        balanceQty = entry.inwardQty; 
      } else {
        balanceQty = balanceQty + entry.inwardQty - entry.outwardQty;
      }
      
      return { ...entry, balanceQty };
    });

    // Now filter for display
    const displayEntries = calculated.filter(entry => {
       if (transactionFilter === 'In') return entry.inwardQty > 0;
       if (transactionFilter === 'Out') return entry.outwardQty > 0;
       return true;
    });

    // Calculate Totals based on Display Entries (except Opening/Closing which are period based)
    const displayTotalIn = displayEntries.reduce((sum, e) => sum + (e.voucherType === 'Opening Balance' ? 0 : e.inwardQty), 0);
    const displayTotalOut = displayEntries.reduce((sum, e) => sum + e.outwardQty, 0);
    
    // Closing based on the very last entry of the full raw list (mock logic)
    const closingQty = calculated.length > 0 ? calculated[calculated.length - 1].balanceQty : 0;
    const closingValue = closingQty * (calculated.length > 0 ? calculated[calculated.length - 1].rate : 0); // Simplified Valuation

    return {
      entriesWithBalance: displayEntries,
      totals: {
        openingQty: selectedItem?.openingStock || 0,
        totalIn: displayTotalIn,
        totalOut: displayTotalOut,
        closingQty,
        closingValue
      }
    };
  }, [rawEntries, transactionFilter, selectedItem]);

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
        
        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col lg:flex-row gap-4">
            {/* Item Selector */}
            <div className="flex-1 min-w-[250px]">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase">Select Item</label>
                <div className="relative">
                    <select 
                        value={selectedItemId}
                        onChange={(e) => setSelectedItemId(e.target.value)}
                        className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-3 pr-10 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                        {MOCK_ITEMS_LIST.map(item => (
                            <option key={item.id} value={item.id}>{item.name} ({item.code})</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
            </div>

            {/* Date Range */}
            <div className="flex-1 min-w-[250px]">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase">Date Range</label>
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                        <input 
                            type="date" 
                            value={dateRange.start}
                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                    </div>
                    <span className="text-gray-400">-</span>
                    <div className="relative flex-1">
                        <input 
                            type="date" 
                            value={dateRange.end}
                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap lg:flex-nowrap">
                <div className="w-40">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase">Warehouse</label>
                    <select 
                        value={warehouse}
                        onChange={(e) => setWarehouse(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                        <option value="All">All Warehouses</option>
                        <option value="Main">Main Warehouse</option>
                        <option value="Store B">Store B</option>
                    </select>
                </div>
                <div className="w-40">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase">Show</label>
                    <select 
                        value={transactionFilter}
                        onChange={(e) => setTransactionFilter(e.target.value as any)}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                        <option value="All">All Transactions</option>
                        <option value="In">Only Inward</option>
                        <option value="Out">Only Outward</option>
                    </select>
                </div>
            </div>

            {/* Action */}
            <div className="flex items-end">
                <button className="flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm h-[38px]">
                    <Download size={18} className="mr-2" />
                    Export
                </button>
            </div>
        </div>

        {/* Item Header */}
        {selectedItem && (
            <div className="bg-primary-600 dark:bg-primary-700 rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
                        <span className="bg-white/20 px-2 py-0.5 rounded text-sm font-mono text-white/90">{selectedItem.code}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-primary-100">
                        <span>Unit: <span className="font-medium text-white">{selectedItem.unit}</span></span>
                        <span>|</span>
                        <span>Current Stock: <span className="font-medium text-white">{selectedItem.currentStock} {selectedItem.unit}</span></span>
                    </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 min-w-[150px] text-right">
                    <p className="text-xs text-primary-200 uppercase font-semibold">Opening Balance</p>
                    <p className="text-xl font-bold">{selectedItem.openingStock} {selectedItem.unit}</p>
                    <p className="text-xs text-primary-200">₹ {selectedItem.openingValue.toLocaleString()}</p>
                </div>
            </div>
        )}

        {/* Ledger Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Voucher Type</th>
                            <th className="px-4 py-3">Voucher No.</th>
                            <th className="px-4 py-3 text-right text-green-600 dark:text-green-400">Inward Qty</th>
                            <th className="px-4 py-3 text-right text-blue-600 dark:text-blue-400">Outward Qty</th>
                            <th className="px-4 py-3 text-right font-bold border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">Balance Qty</th>
                            <th className="px-4 py-3 text-right">Rate (₹)</th>
                            <th className="px-4 py-3 text-right">Value (₹)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                        {entriesWithBalance.length > 0 ? entriesWithBalance.map((entry) => (
                            <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap">{entry.date}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                        entry.voucherType === 'Purchase' || entry.voucherType === 'Sales Return' || entry.voucherType === 'Opening Balance'
                                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                        : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                    }`}>
                                        {entry.voucherType === 'Opening Balance' ? <FileText size={10} className="mr-1"/> : 
                                         (entry.inwardQty > 0 ? <ArrowDownLeft size={10} className="mr-1" /> : <ArrowUpRight size={10} className="mr-1" />)
                                        }
                                        {entry.voucherType}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs">{entry.voucherNo}</td>
                                <td className="px-4 py-3 text-right font-medium">{entry.inwardQty > 0 ? entry.inwardQty : '-'}</td>
                                <td className="px-4 py-3 text-right font-medium">{entry.outwardQty > 0 ? entry.outwardQty : '-'}</td>
                                <td className="px-4 py-3 text-right font-bold border-l border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10">
                                    {entry.balanceQty}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-500">{entry.rate.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right font-medium">
                                    {(Math.abs(entry.inwardQty || entry.outwardQty) * entry.rate).toLocaleString()}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <FileText size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                                        <p className="text-lg font-medium">No transactions found</p>
                                        <p className="text-sm mt-1">Try changing the date range or item.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary Footer */}
            <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 p-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm sticky bottom-0 z-20">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Opening Qty</span>
                    <span className="font-bold text-gray-900 dark:text-white">{totals.openingQty}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-green-600 dark:text-green-400 uppercase font-semibold">Total Inward</span>
                    <span className="font-bold text-green-700 dark:text-green-300">+{totals.totalIn}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-blue-600 dark:text-blue-400 uppercase font-semibold">Total Outward</span>
                    <span className="font-bold text-blue-700 dark:text-blue-300">-{totals.totalOut}</span>
                </div>
                <div className="flex flex-col border-l border-gray-200 dark:border-gray-700 pl-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Closing Qty</span>
                    <span className="font-bold text-gray-900 dark:text-white text-lg">{totals.closingQty} {selectedItem?.unit}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Closing Value</span>
                    <span className="font-bold text-gray-900 dark:text-white text-lg">₹ {totals.closingValue.toLocaleString()}</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default StockLedger;
