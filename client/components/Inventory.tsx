
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Box,
  List,
  BookOpen,
  ClipboardEdit,
  ShoppingCart,
  Sparkles
} from 'lucide-react';
import ItemMaster from './ItemMaster';
import StockLedger from './StockLedger';
import StockAdjustments from './StockAdjustments';
import AiExplanationModal from './AiExplanationModal';

// --- Types ---

type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

interface InventoryItem {
  id: string;
  name: string;
  code: string;
  group: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  valuationRate: number;
  hsn: string;
  taxRate: number;
  warehouse: string;
}

interface StockMovement {
  id: string;
  date: string;
  type: 'In' | 'Out';
  qty: number;
  reference: string; // PO or Invoice number
}

// --- Mock Data ---

const MOCK_ITEMS: InventoryItem[] = [
  { id: '1', name: 'Dell XPS 15 Laptop', code: 'IT-LPT-001', group: 'Finished Goods', unit: 'Nos', currentStock: 24, reorderLevel: 5, valuationRate: 95000, hsn: '8471', taxRate: 18, warehouse: 'Main Warehouse' },
  { id: '2', name: 'Wireless Mouse', code: 'IT-ACC-005', group: 'Trading Items', unit: 'Nos', currentStock: 0, reorderLevel: 10, valuationRate: 450, hsn: '8471', taxRate: 18, warehouse: 'Store B' },
  { id: '3', name: 'Office Chair Ergo', code: 'FUR-CHR-002', group: 'Finished Goods', unit: 'Nos', currentStock: 4, reorderLevel: 10, valuationRate: 6500, hsn: '9403', taxRate: 18, warehouse: 'Main Warehouse' },
  { id: '4', name: 'Teak Wood Plank', code: 'RM-WD-101', group: 'Raw Material', unit: 'SqFt', currentStock: 1500, reorderLevel: 200, valuationRate: 450, hsn: '4407', taxRate: 12, warehouse: 'Store B' },
  { id: '5', name: 'Printer Paper (A4)', code: 'STAT-PPR-001', group: 'Consumables', unit: 'Ream', currentStock: 45, reorderLevel: 50, valuationRate: 220, hsn: '4802', taxRate: 12, warehouse: 'Main Warehouse' },
  { id: '6', name: 'Steel Rods 10mm', code: 'RM-STL-055', group: 'Raw Material', unit: 'Kg', currentStock: 5000, reorderLevel: 1000, valuationRate: 65, hsn: '7214', taxRate: 18, warehouse: 'Store B' },
];

const MOCK_MOVEMENTS: StockMovement[] = [
  { id: 'm1', date: '2024-01-28', type: 'Out', qty: 2, reference: 'INV-2024-001' },
  { id: 'm2', date: '2024-01-25', type: 'In', qty: 10, reference: 'GRN-2024-055' },
  { id: 'm3', date: '2024-01-20', type: 'Out', qty: 1, reference: 'INV-2024-003' },
  { id: 'm4', date: '2024-01-15', type: 'In', qty: 5, reference: 'GRN-2024-040' },
];

// --- Helper Components ---

const StatusBadge: React.FC<{ status: StockStatus }> = ({ status }) => {
  const config = {
    'In Stock': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/30', icon: CheckCircle2 },
    'Low Stock': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-900/30', icon: AlertTriangle },
    'Out of Stock': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/30', icon: XCircle },
  };

  const { color, icon: Icon } = config[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      <Icon size={12} className="mr-1" />
      {status}
    </span>
  );
};

const ItemDrawer: React.FC<{ item: InventoryItem | null; onClose: () => void }> = ({ item, onClose }) => {
  if (!item) return null;

  const stockValue = item.currentStock * item.valuationRate;
  const status: StockStatus = item.currentStock === 0 ? 'Out of Stock' : item.currentStock < item.reorderLevel ? 'Low Stock' : 'In Stock';

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
             <h2 className="text-xl font-bold text-gray-900 dark:text-white">{item.name}</h2>
             <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300 font-mono">{item.code}</span>
                <span>•</span>
                <span>{item.group}</span>
             </div>
          </div>
          <div className="flex items-center space-x-3">
             <StatusBadge status={status} />
             <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <XCircle size={24} />
             </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Current Stock</p>
                    <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{item.currentStock}</span>
                        <span className="text-sm text-gray-500">{item.unit}</span>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Stock Value</p>
                    <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">₹ {stockValue.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Details */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Package size={16} className="mr-2 text-gray-500" /> Item Details
                </h3>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-100 dark:divide-gray-700">
                    <div className="flex justify-between p-3 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">HSN / SAC</span>
                        <span className="font-medium text-gray-900 dark:text-white">{item.hsn}</span>
                    </div>
                    <div className="flex justify-between p-3 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">GST Rate</span>
                        <span className="font-medium text-gray-900 dark:text-white">{item.taxRate}%</span>
                    </div>
                    <div className="flex justify-between p-3 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Valuation Rate</span>
                        <span className="font-medium text-gray-900 dark:text-white">₹ {item.valuationRate.toLocaleString()} / {item.unit}</span>
                    </div>
                    <div className="flex justify-between p-3 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Reorder Level</span>
                        <span className="font-medium text-gray-900 dark:text-white">{item.reorderLevel} {item.unit}</span>
                    </div>
                     <div className="flex justify-between p-3 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Default Warehouse</span>
                        <span className="font-medium text-gray-900 dark:text-white">{item.warehouse}</span>
                    </div>
                </div>
            </div>

            {/* Movement Timeline */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                    <History size={16} className="mr-2 text-gray-500" /> Recent Movements
                </h3>
                <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-2 before:border-l-2 before:border-gray-200 dark:before:border-gray-700 before:z-0">
                    {MOCK_MOVEMENTS.map(mov => (
                        <div key={mov.id} className="relative z-10 flex items-start pl-6">
                            <div className={`absolute left-0 p-1 rounded-full border-2 bg-white dark:bg-gray-900 ${mov.type === 'In' ? 'border-green-500 text-green-500' : 'border-blue-500 text-blue-500'}`}>
                                {mov.type === 'In' ? <ArrowDownRight size={10} /> : <ArrowUpRight size={10} />}
                            </div>
                            <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {mov.type === 'In' ? 'Stock In' : 'Stock Out'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Ref: {mov.reference}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${mov.type === 'In' ? 'text-green-600' : 'text-blue-600'}`}>
                                            {mov.type === 'In' ? '+' : '-'}{mov.qty} {item.unit}
                                        </p>
                                        <p className="text-xs text-gray-400">{mov.date}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </>
  );
};

// --- Alerts Component ---

const StockAlerts: React.FC = () => {
  const lowStockItems = MOCK_ITEMS.filter(item => item.currentStock < item.reorderLevel);

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
       <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center justify-between">
           <div className="flex items-center space-x-3">
               <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
               <div>
                   <h3 className="text-lg font-bold text-red-800 dark:text-red-300">Low Stock Alerts</h3>
                   <p className="text-sm text-red-600 dark:text-red-400">
                       {lowStockItems.length} items are below their reorder level. Immediate action recommended.
                   </p>
               </div>
           </div>
       </div>

       <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1">
           {lowStockItems.length > 0 ? (
               <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                       <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                           <tr>
                               <th className="px-6 py-3">Item Details</th>
                               <th className="px-6 py-3 text-center">Current Stock</th>
                               <th className="px-6 py-3 text-center">Reorder Level</th>
                               <th className="px-6 py-3 text-right">Suggested Qty</th>
                               <th className="px-6 py-3 text-right">Action</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                           {lowStockItems.map(item => {
                               const suggestedQty = Math.max((item.reorderLevel * 2) - item.currentStock, 0);
                               return (
                                   <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                       <td className="px-6 py-4">
                                           <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                           <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{item.code}</div>
                                       </td>
                                       <td className="px-6 py-4 text-center">
                                           <span className="text-red-600 font-bold">{item.currentStock}</span> 
                                           <span className="text-xs text-gray-500 ml-1">{item.unit}</span>
                                       </td>
                                       <td className="px-6 py-4 text-center font-medium">
                                           {item.reorderLevel}
                                       </td>
                                       <td className="px-6 py-4 text-right font-medium text-primary-600 dark:text-primary-400">
                                           {suggestedQty} {item.unit}
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                           <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-medium shadow-sm transition-colors inline-flex items-center">
                                               <ShoppingCart size={14} className="mr-1.5" />
                                               Add to Purchase Plan
                                           </button>
                                       </td>
                                   </tr>
                               );
                           })}
                       </tbody>
                   </table>
               </div>
           ) : (
               <div className="flex flex-col items-center justify-center h-64">
                   <CheckCircle2 size={48} className="text-green-500 mb-4" />
                   <h3 className="text-lg font-medium text-gray-900 dark:text-white">All Good!</h3>
                   <p className="text-gray-500 dark:text-gray-400">No stock alerts at the moment.</p>
               </div>
           )}
       </div>
    </div>
  );
};

// --- Main Component ---

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'summary' | 'alerts' | 'master' | 'ledger' | 'adjustments'>('summary');
  const [showAiModal, setShowAiModal] = useState(false);
  
  // Stock Summary State
  const [items] = useState<InventoryItem[]>(MOCK_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Derived Data for Summary
  const filteredItems = useMemo(() => {
    return items.filter(item => {
        const matchesSearch = 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.code.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesGroup = groupFilter === 'All' || item.group === groupFilter;

        let matchesStatus = true;
        if (statusFilter === 'In Stock') matchesStatus = item.currentStock >= item.reorderLevel;
        if (statusFilter === 'Low Stock') matchesStatus = item.currentStock > 0 && item.currentStock < item.reorderLevel;
        if (statusFilter === 'Out of Stock') matchesStatus = item.currentStock === 0;

        return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [items, searchQuery, groupFilter, statusFilter]);

  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.valuationRate), 0);
  const lowStockCount = items.filter(item => item.currentStock < item.reorderLevel).length;

  // Groups for dropdown
  const groups = Array.from(new Set(items.map(i => i.group)));

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
        
        {/* Header & Tabs */}
        <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-1">
             <div>
                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight px-1">Inventory Management</h1>
                 <div className="flex space-x-6 mt-4 overflow-x-auto no-scrollbar">
                    <button 
                        onClick={() => setActiveTab('summary')}
                        className={`pb-3 text-sm font-medium transition-colors relative flex items-center whitespace-nowrap ${activeTab === 'summary' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        <Box size={16} className="mr-1.5" />
                        Stock Summary
                        {activeTab === 'summary' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('alerts')}
                        className={`pb-3 text-sm font-medium transition-colors relative flex items-center whitespace-nowrap ${activeTab === 'alerts' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        <AlertTriangle size={16} className="mr-1.5" />
                        Alerts
                        {lowStockCount > 0 && <span className="ml-1.5 bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{lowStockCount}</span>}
                        {activeTab === 'alerts' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('master')}
                        className={`pb-3 text-sm font-medium transition-colors relative flex items-center whitespace-nowrap ${activeTab === 'master' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        <List size={16} className="mr-1.5" />
                        Item Master
                        {activeTab === 'master' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('ledger')}
                        className={`pb-3 text-sm font-medium transition-colors relative flex items-center whitespace-nowrap ${activeTab === 'ledger' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        <BookOpen size={16} className="mr-1.5" />
                        Stock Ledger
                        {activeTab === 'ledger' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('adjustments')}
                        className={`pb-3 text-sm font-medium transition-colors relative flex items-center whitespace-nowrap ${activeTab === 'adjustments' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        <ClipboardEdit size={16} className="mr-1.5" />
                        Stock Adjustments
                        {activeTab === 'adjustments' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>}
                    </button>
                 </div>
             </div>
        </div>

        {/* Content Area */}
        {activeTab === 'master' ? (
            <ItemMaster />
        ) : activeTab === 'ledger' ? (
            <StockLedger />
        ) : activeTab === 'adjustments' ? (
            <StockAdjustments />
        ) : activeTab === 'alerts' ? (
            <StockAlerts />
        ) : (
            /* Stock Summary View */
            <>
             <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900/30 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                {/* Left: Search & Group Filter */}
                <div className="flex flex-1 w-full gap-3 flex-col sm:flex-row">
                    <div className="relative w-full sm:w-72">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search Item Name or Code..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                        />
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        <select 
                            value={groupFilter}
                            onChange={(e) => setGroupFilter(e.target.value)}
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                        >
                            <option value="All">All Groups</option>
                            {groups.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        
                        <select 
                           className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                        >
                            <option value="All">All Locations</option>
                            <option>Main Warehouse</option>
                            <option>Store B</option>
                        </select>
                    </div>
                </div>
                
                {/* Right: Status Tabs & Actions */}
                <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                    <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
                        {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${statusFilter === status ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => setShowAiModal(true)}
                        className="flex items-center px-3 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors whitespace-nowrap"
                    >
                        <Sparkles size={16} className="mr-2" /> Explain with AI
                    </button>
                    <button className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                         <Download size={18} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3">Item Name</th>
                                <th className="px-6 py-3">Code</th>
                                <th className="px-6 py-3">Group</th>
                                <th className="px-6 py-3 text-right">Stock Qty</th>
                                <th className="px-6 py-3 text-right">Reorder Level</th>
                                <th className="px-6 py-3 text-right">Valuation Rate</th>
                                <th className="px-6 py-3 text-right">Stock Value</th>
                                <th className="px-6 py-3 text-center">Status</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                            {filteredItems.length > 0 ? filteredItems.map((item) => {
                                const status: StockStatus = item.currentStock === 0 ? 'Out of Stock' : item.currentStock < item.reorderLevel ? 'Low Stock' : 'In Stock';
                                const stockValue = item.currentStock * item.valuationRate;
                                const isLowStock = status === 'Low Stock' || status === 'Out of Stock';
                                
                                return (
                                    <tr 
                                        key={item.id} 
                                        onClick={() => setSelectedItem(item)}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.code}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-0.5 rounded">{item.group}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold">
                                            {item.currentStock} <span className="text-xs font-normal text-gray-500">{item.unit}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-500">{item.reorderLevel}</td>
                                        <td className="px-6 py-4 text-right">₹ {item.valuationRate.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">₹ {stockValue.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {isLowStock && (
                                                    <button 
                                                        className="p-1.5 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded text-gray-500 hover:text-primary-600 transition-colors" 
                                                        title="Create Purchase Suggestion"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveTab('alerts');
                                                        }}
                                                    >
                                                        <ShoppingCart size={16} />
                                                    </button>
                                                )}
                                                <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <Box size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                                            <p className="text-lg font-medium">No items found</p>
                                            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Footer */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 sticky bottom-0 z-30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg rounded-lg">
                 <div className="flex items-center gap-6 text-sm w-full sm:w-auto justify-between sm:justify-start">
                     <div>
                         <p className="text-gray-500 dark:text-gray-400 text-xs uppercase">Total Items</p>
                         <p className="font-bold text-gray-900 dark:text-white text-lg">{totalItems}</p>
                     </div>
                     <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
                     <div>
                         <p className="text-gray-500 dark:text-gray-400 text-xs uppercase">Total Stock Value</p>
                         <p className="font-bold text-gray-900 dark:text-white text-lg">₹ {totalValue.toLocaleString()}</p>
                     </div>
                     <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
                     <div className={`${lowStockCount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                         <p className="text-current text-xs uppercase font-semibold">Low Stock Items</p>
                         <p className="font-bold text-lg">{lowStockCount}</p>
                     </div>
                 </div>

                 <div className="flex gap-2 w-full sm:w-auto">
                     <button className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                         <ChevronLeft size={16} />
                     </button>
                     <button className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                         <ChevronRight size={16} />
                     </button>
                 </div>
            </div>

            {/* Drawer & Modal */}
            <ItemDrawer item={selectedItem} onClose={() => setSelectedItem(null)} />
            <AiExplanationModal 
                isOpen={showAiModal}
                onClose={() => setShowAiModal(false)}
                title="Stock Summary Report"
            />
            </>
        )}
    </div>
  );
};

export default Inventory;
