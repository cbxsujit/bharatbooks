
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ClipboardEdit, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertCircle,
  Check
} from 'lucide-react';

// --- Types ---

type AdjustmentType = 'Opening' | 'Physical' | 'Other';

interface AdjustmentItem {
  id: string;
  itemId: string;
  itemName: string;
  systemQty: number;
  physicalQty: number;
  unit: string;
  rate: number;
}

interface StockAdjustment {
  id: string;
  adjNo: string;
  date: string;
  type: AdjustmentType;
  remarks: string;
  items: AdjustmentItem[];
  totalValueImpact: number;
}

// --- Mock Data ---

const MOCK_ITEMS_SOURCE = [
  { id: '1', name: 'Dell XPS 15 Laptop', currentStock: 24, unit: 'Nos', rate: 90000 },
  { id: '2', name: 'Wireless Mouse', currentStock: 0, unit: 'Nos', rate: 350 },
  { id: '3', name: 'Office Chair Ergo', currentStock: 4, unit: 'Nos', rate: 4500 },
  { id: '4', name: 'Teak Wood Plank', currentStock: 1500, unit: 'SqFt', rate: 250 },
  { id: '6', name: 'Steel Rods 10mm', currentStock: 5000, unit: 'Kg', rate: 65 },
];

const MOCK_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: '1',
    adjNo: 'ADJ-2024-001',
    date: '2024-01-01',
    type: 'Opening',
    remarks: 'Initial stock entry for FY 24-25',
    totalValueImpact: 1250000,
    items: [
      { id: 'i1', itemId: '1', itemName: 'Dell XPS 15 Laptop', systemQty: 0, physicalQty: 10, unit: 'Nos', rate: 90000 },
      { id: 'i2', itemId: '4', itemName: 'Teak Wood Plank', systemQty: 0, physicalQty: 1000, unit: 'SqFt', rate: 250 },
    ]
  },
  {
    id: '2',
    adjNo: 'ADJ-2024-002',
    date: '2024-01-15',
    type: 'Physical',
    remarks: 'Quarterly stock audit corrections',
    totalValueImpact: -1500,
    items: [
      { id: 'i3', itemId: '2', itemName: 'Wireless Mouse', systemQty: 50, physicalQty: 48, unit: 'Nos', rate: 350 }, // Shortage
      { id: 'i4', itemId: '6', itemName: 'Steel Rods 10mm', systemQty: 5000, physicalQty: 4990, unit: 'Kg', rate: 65 }, // Shortage
    ]
  },
  {
    id: '3',
    adjNo: 'ADJ-2024-003',
    date: '2024-01-20',
    type: 'Other',
    remarks: 'Found extra chair in store room',
    totalValueImpact: 4500,
    items: [
      { id: 'i5', itemId: '3', itemName: 'Office Chair Ergo', systemQty: 3, physicalQty: 4, unit: 'Nos', rate: 4500 }, // Excess
    ]
  }
];

// --- New Adjustment Form ---

interface AdjustmentFormProps {
  onCancel: () => void;
}

const AdjustmentForm: React.FC<AdjustmentFormProps> = ({ onCancel }) => {
  const [adjType, setAdjType] = useState<AdjustmentType>('Physical');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [adjNo] = useState('ADJ-2024-004'); // Auto-generated mock

  const [rows, setRows] = useState<AdjustmentItem[]>([
    { id: '1', itemId: '', itemName: '', systemQty: 0, physicalQty: 0, unit: '', rate: 0 }
  ]);

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Helpers
  const calculateRowDiff = (row: AdjustmentItem) => row.physicalQty - row.systemQty;
  const calculateRowImpact = (row: AdjustmentItem) => calculateRowDiff(row) * row.rate;

  const totals = useMemo(() => {
    let positiveVal = 0;
    let negativeVal = 0;

    rows.forEach(row => {
      const impact = calculateRowImpact(row);
      if (impact > 0) positiveVal += impact;
      else negativeVal += Math.abs(impact);
    });

    return { positiveVal, negativeVal, net: positiveVal - negativeVal };
  }, [rows]);

  // Handlers
  const handleItemSelect = (index: number, itemId: string) => {
    const selected = MOCK_ITEMS_SOURCE.find(i => i.id === itemId);
    if (!selected) return;

    const newRows = [...rows];
    newRows[index] = {
      ...newRows[index],
      itemId: selected.id,
      itemName: selected.name,
      systemQty: adjType === 'Opening' ? 0 : selected.currentStock,
      physicalQty: adjType === 'Opening' ? 0 : selected.currentStock, // Default to current
      unit: selected.unit,
      rate: selected.rate
    };
    setRows(newRows);
  };

  const updateRow = (index: number, field: keyof AdjustmentItem, value: any) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, { id: Date.now().toString(), itemId: '', itemName: '', systemQty: 0, physicalQty: 0, unit: '', rate: 0 }]);
  };

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!date) newErrors.date = "Date is required";
    
    const invalidRows = rows.some(r => !r.itemId || r.physicalQty < 0);
    if (invalidRows) newErrors.rows = "Please select items and ensure quantities are valid (>= 0).";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      // console.log("Saving Adjustment", { adjNo, date, type: adjType, items: rows });
      onCancel();
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in pb-20 lg:pb-0">
       {/* Header */}
       <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div>
             <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Stock Adjustment</h2>
             <p className="text-sm text-gray-500 dark:text-gray-400">{adjNo}</p>
          </div>
          <button onClick={onCancel} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
             <X size={24} />
          </button>
       </div>

       <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
             
             {/* Details Card */}
             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adjustment Type</label>
                      <select 
                        value={adjType} 
                        onChange={e => setAdjType(e.target.value as AdjustmentType)}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      >
                         <option value="Physical">Physical Stock Count</option>
                         <option value="Opening">Opening Stock</option>
                         <option value="Other">Other Adjustment</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date <span className="text-red-500">*</span></label>
                      <input 
                        type="date" 
                        value={date} 
                        onChange={e => setDate(e.target.value)} 
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
                      <input 
                        type="text" 
                        value={remarks} 
                        onChange={e => setRemarks(e.target.value)} 
                        placeholder="Reason for adjustment..."
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      />
                   </div>
                </div>
             </div>

             {/* Items Table */}
             <div className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden ${errors.rows ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                         <tr>
                            <th className="px-4 py-3 w-64">Item</th>
                            <th className="px-4 py-3 w-24 text-right bg-gray-100/50 dark:bg-gray-800/50">System Qty</th>
                            <th className="px-4 py-3 w-32 text-right">Physical Qty</th>
                            <th className="px-4 py-3 w-24 text-right font-bold">Difference</th>
                            <th className="px-4 py-3 w-20 text-center">Unit</th>
                            <th className="px-4 py-3 w-32 text-right">Rate (₹)</th>
                            <th className="px-4 py-3 w-32 text-right">Value Impact</th>
                            <th className="px-4 py-3 w-10"></th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                         {rows.map((row, index) => {
                            const diff = calculateRowDiff(row);
                            const impact = calculateRowImpact(row);
                            return (
                               <tr key={row.id} className="group bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                  <td className="px-4 py-3">
                                     <select 
                                        value={row.itemId}
                                        onChange={e => handleItemSelect(index, e.target.value)}
                                        className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 py-1 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                                     >
                                        <option value="">Select Item</option>
                                        {MOCK_ITEMS_SOURCE.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                     </select>
                                  </td>
                                  <td className="px-4 py-3 text-right text-gray-500 bg-gray-50 dark:bg-gray-900/20">
                                     {row.itemId ? row.systemQty : '-'}
                                  </td>
                                  <td className="px-4 py-3">
                                     <input 
                                        type="number" 
                                        min="0"
                                        value={row.physicalQty}
                                        onChange={e => updateRow(index, 'physicalQty', parseFloat(e.target.value) || 0)}
                                        className="w-full text-right bg-transparent border-b border-gray-300 dark:border-gray-600 py-1 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none font-bold"
                                     />
                                  </td>
                                  <td className={`px-4 py-3 text-right font-bold ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                     {diff > 0 ? '+' : ''}{diff}
                                  </td>
                                  <td className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">{row.unit}</td>
                                  <td className="px-4 py-3">
                                     <input 
                                        type="number" 
                                        value={row.rate}
                                        onChange={e => updateRow(index, 'rate', parseFloat(e.target.value) || 0)}
                                        className="w-full text-right bg-transparent border-b border-gray-300 dark:border-gray-600 py-1 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                                     />
                                  </td>
                                  <td className={`px-4 py-3 text-right font-medium ${impact > 0 ? 'text-green-600' : impact < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                                     {impact.toLocaleString()}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                     <button onClick={() => removeRow(index)} className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                                  </td>
                               </tr>
                            );
                         })}
                      </tbody>
                   </table>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                   <button onClick={addRow} className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"><Plus size={16} className="mr-1" /> Add Item</button>
                   {errors.rows && <span className="text-xs text-red-500 font-medium">{errors.rows}</span>}
                </div>
             </div>

             {/* Summary Footer */}
             <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div className="flex gap-6 text-sm">
                     <div>
                         <p className="text-gray-500 text-xs">Total Positive Adj.</p>
                         <p className="font-bold text-green-600">₹ {totals.positiveVal.toLocaleString()}</p>
                     </div>
                     <div>
                         <p className="text-gray-500 text-xs">Total Negative Adj.</p>
                         <p className="font-bold text-red-600">₹ {totals.negativeVal.toLocaleString()}</p>
                     </div>
                     <div className="pl-4 border-l border-gray-200 dark:border-gray-700">
                         <p className="text-gray-900 dark:text-white text-xs font-bold uppercase">Net Impact</p>
                         <p className={`font-bold text-lg ${totals.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                             {totals.net >= 0 ? '+' : ''} ₹ {totals.net.toLocaleString()}
                         </p>
                     </div>
                 </div>
                 
                 <div className="flex gap-3">
                     <button onClick={onCancel} className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                     <button onClick={handleSave} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center">
                         <Save size={18} className="mr-2" /> Save Adjustment
                     </button>
                 </div>
             </div>

          </div>
       </div>
    </div>
  );
};

// --- Main Component ---

const StockAdjustments: React.FC = () => {
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredAdjustments = useMemo(() => {
    return MOCK_ADJUSTMENTS.filter(adj => {
        const matchesSearch = adj.adjNo.toLowerCase().includes(searchQuery.toLowerCase()) || adj.remarks.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'All' || adj.type === typeFilter;
        return matchesSearch && matchesType;
    });
  }, [searchQuery, typeFilter]);

  if (mode === 'create') {
    return <AdjustmentForm onCancel={() => setMode('list')} />;
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
       
       {/* Toolbar */}
       <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-1 w-full gap-3 flex-col sm:flex-row">
              <div className="relative w-full sm:w-72">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                      type="text" 
                      placeholder="Search Adjustments..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  />
              </div>
              
              <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                  <option value="All">All Types</option>
                  <option value="Opening">Opening Stock</option>
                  <option value="Physical">Physical Count</option>
                  <option value="Other">Others</option>
              </select>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
              <button 
                  onClick={() => setMode('create')}
                  className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors whitespace-nowrap"
              >
                  <Plus size={18} className="mr-2" />
                  New Stock Adjustment
              </button>
          </div>
       </div>

       {/* Table */}
       <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                      <tr>
                          <th className="px-6 py-3">Adj No.</th>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Type</th>
                          <th className="px-6 py-3">Remarks</th>
                          <th className="px-6 py-3 text-center">Items</th>
                          <th className="px-6 py-3 text-right">Value Impact (₹)</th>
                          <th className="px-6 py-3 text-center">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                      {filteredAdjustments.length > 0 ? filteredAdjustments.map((adj) => (
                          <tr key={adj.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                              <td className="px-6 py-4 font-medium text-primary-600 dark:text-primary-400">{adj.adjNo}</td>
                              <td className="px-6 py-4">{adj.date}</td>
                              <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                                      adj.type === 'Opening' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30' :
                                      adj.type === 'Physical' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30' :
                                      'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                                  }`}>
                                      {adj.type}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-gray-500 truncate max-w-xs" title={adj.remarks}>{adj.remarks}</td>
                              <td className="px-6 py-4 text-center">{adj.items.length}</td>
                              <td className={`px-6 py-4 text-right font-bold ${adj.totalValueImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {adj.totalValueImpact >= 0 ? '+' : ''}{adj.totalValueImpact.toLocaleString()}
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-primary-600 transition-colors"><Eye size={16} /></button>
                                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-blue-600 transition-colors"><Edit size={16} /></button>
                                  </div>
                              </td>
                          </tr>
                      )) : (
                          <tr>
                              <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                  <div className="flex flex-col items-center justify-center">
                                      <ClipboardEdit size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                                      <p className="text-lg font-medium">No stock adjustments found</p>
                                  </div>
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
       </div>
    </div>
  );
};

export default StockAdjustments;
