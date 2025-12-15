
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  Package, 
  Info, 
  AlertCircle, 
  Check,
  Box
} from 'lucide-react';

// --- Types ---

export interface ItemMasterData {
  id: string;
  name: string;
  code: string;
  group: string;
  description: string;
  hsn: string;
  taxRate: number;
  isService: boolean;
  unit: string;
  openingStock: number;
  openingValue: number;
  reorderLevel: number;
  purchaseRate: number;
  salesRate: number;
  valuationMethod: string;
}

// --- Mock Data ---

const MOCK_ITEMS_MASTER: ItemMasterData[] = [
  { id: '1', name: 'Dell XPS 15 Laptop', code: 'IT-LPT-001', group: 'Finished Goods', description: 'High performance laptop', hsn: '8471', taxRate: 18, isService: false, unit: 'Nos', openingStock: 20, openingValue: 1800000, reorderLevel: 5, purchaseRate: 90000, salesRate: 110000, valuationMethod: 'Moving Avg' },
  { id: '2', name: 'Wireless Mouse', code: 'IT-ACC-005', group: 'Trading Items', description: 'Optical mouse', hsn: '8471', taxRate: 18, isService: false, unit: 'Nos', openingStock: 0, openingValue: 0, reorderLevel: 10, purchaseRate: 350, salesRate: 600, valuationMethod: 'FIFO' },
  { id: '3', name: 'Office Chair Ergo', code: 'FUR-CHR-002', group: 'Finished Goods', description: 'Ergonomic chair black', hsn: '9403', taxRate: 18, isService: false, unit: 'Nos', openingStock: 5, openingValue: 25000, reorderLevel: 10, purchaseRate: 4500, salesRate: 8500, valuationMethod: 'Moving Avg' },
  { id: '4', name: 'Web Dev Services', code: 'SVC-WEB-001', group: 'Services', description: 'Hourly development', hsn: '998311', taxRate: 18, isService: true, unit: 'Hrs', openingStock: 0, openingValue: 0, reorderLevel: 0, purchaseRate: 0, salesRate: 2500, valuationMethod: 'NA' },
];

const ITEM_GROUPS = ['Raw Material', 'Finished Goods', 'Trading Items', 'Consumables', 'Services'];
const UNITS = ['Nos', 'Kg', 'Ltr', 'Meter', 'SqFt', 'Box', 'Set', 'Hrs', 'Ream'];
const TAX_RATES = [0, 5, 12, 18, 28];

// --- Item Form Drawer ---

interface ItemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: ItemMasterData) => void;
  initialData?: ItemMasterData | null;
}

const ItemFormDrawer: React.FC<ItemDrawerProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<ItemMasterData>({
    id: '',
    name: '',
    code: '',
    group: '',
    description: '',
    hsn: '',
    taxRate: 18,
    isService: false,
    unit: 'Nos',
    openingStock: 0,
    openingValue: 0,
    reorderLevel: 0,
    purchaseRate: 0,
    salesRate: 0,
    valuationMethod: 'Moving Avg'
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
            id: '',
            name: '',
            code: '',
            group: '',
            description: '',
            hsn: '',
            taxRate: 18,
            isService: false,
            unit: 'Nos',
            openingStock: 0,
            openingValue: 0,
            reorderLevel: 0,
            purchaseRate: 0,
            salesRate: 0,
            valuationMethod: 'Moving Avg'
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Keyboard Shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Enter' && !e.ctrlKey && !e.altKey && !e.metaKey && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const drawer = drawerRef.current;
        if (drawer) {
            const elements = Array.from(drawer.querySelectorAll(focusableElements)) as HTMLElement[];
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
  }, [isOpen, formData]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.name.trim()) newErrors.name = "Item Name is required";
    if (!formData.group) newErrors.group = "Item Group is required";
    if (!formData.isService && formData.openingStock > 0 && formData.openingValue < 0) {
        newErrors.openingValue = "Opening value cannot be negative";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
        setShowSuccessToast(true);
        setTimeout(() => {
            setShowSuccessToast(false);
            onSubmit(formData);
            onClose();
        }, 1000);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[600px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-200 dark:border-gray-700" ref={drawerRef}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
             <h2 className="text-xl font-bold text-gray-900 dark:text-white">{initialData ? 'Edit Item' : 'New Item'}</h2>
             <p className="text-sm text-gray-500 dark:text-gray-400">Enter item details and configuration</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-primary-500">
            <X size={24} />
          </button>
        </div>

        {/* Success Toast */}
        {showSuccessToast && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-xl flex items-center animate-bounce-in text-sm">
                <Save size={16} className="mr-2" />
                Item Saved!
            </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Basic Details */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">1. Basic Details</h3>
                
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className={`w-full bg-gray-50 dark:bg-gray-800 border rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            autoFocus
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Code / SKU</label>
                        <input 
                            type="text" 
                            value={formData.code} 
                            onChange={e => setFormData({...formData, code: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Group <span className="text-red-500">*</span></label>
                        <select 
                            value={formData.group}
                            onChange={e => setFormData({...formData, group: e.target.value})}
                            className={`w-full bg-gray-50 dark:bg-gray-800 border rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none ${errors.group ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        >
                            <option value="">Select Group</option>
                            {ITEM_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        {errors.group && <p className="text-xs text-red-500 mt-1">{errors.group}</p>}
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            rows={3}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Tax & Compliance */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">2. Tax & Compliance</h3>
                
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HSN / SAC</label>
                        <input 
                            type="text" 
                            value={formData.hsn} 
                            onChange={e => setFormData({...formData, hsn: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GST Rate (%)</label>
                        <select 
                            value={formData.taxRate}
                            onChange={e => setFormData({...formData, taxRate: parseFloat(e.target.value)})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        >
                            {TAX_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <input 
                                type="checkbox" 
                                id="isService"
                                checked={formData.isService}
                                onChange={e => setFormData({...formData, isService: e.target.checked})}
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                            />
                            <div>
                                <label htmlFor="isService" className="text-sm font-medium text-gray-900 dark:text-white block">Is this item a service?</label>
                                <p className="text-xs text-gray-500">Services do not track quantity stock, only value.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Units & Stock */}
            {!formData.isService && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">3. Units & Stock</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit of Measure</label>
                            <select 
                                value={formData.unit}
                                onChange={e => setFormData({...formData, unit: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            >
                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reorder Level</label>
                            <input 
                                type="number" 
                                value={formData.reorderLevel} 
                                onChange={e => setFormData({...formData, reorderLevel: parseFloat(e.target.value) || 0})}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opening Stock Qty</label>
                            <input 
                                type="number" 
                                value={formData.openingStock} 
                                onChange={e => setFormData({...formData, openingStock: parseFloat(e.target.value) || 0})}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opening Stock Value (₹)</label>
                            <input 
                                type="number" 
                                value={formData.openingValue} 
                                onChange={e => setFormData({...formData, openingValue: parseFloat(e.target.value) || 0})}
                                className={`w-full bg-gray-50 dark:bg-gray-800 border rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none ${errors.openingValue ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            />
                            {errors.openingValue && <p className="text-xs text-red-500 mt-1">{errors.openingValue}</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Pricing */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">4. Pricing</h3>
                
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Rate (₹)</label>
                        <input 
                            type="number" 
                            value={formData.purchaseRate} 
                            onChange={e => setFormData({...formData, purchaseRate: parseFloat(e.target.value) || 0})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sales Rate (₹)</label>
                        <input 
                            type="number" 
                            value={formData.salesRate} 
                            onChange={e => setFormData({...formData, salesRate: parseFloat(e.target.value) || 0})}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end space-x-3">
            <button onClick={onClose} className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-primary-500">
                Cancel
            </button>
            <button 
                onClick={handleSubmit} 
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center focus:ring-2 focus:ring-primary-500"
                title="Ctrl+S to Save"
            >
                <Save size={18} className="mr-2" /> Save Item
            </button>
        </div>
      </div>
    </>
  );
};

// --- Main Component ---

const ItemMaster: React.FC = () => {
  const [items, setItems] = useState<ItemMasterData[]>(MOCK_ITEMS_MASTER);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemMasterData | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const handleSaveItem = (itemData: ItemMasterData) => {
    if (itemData.id) {
      // Edit existing
      setItems(prev => prev.map(i => i.id === itemData.id ? itemData : i));
    } else {
      // Create new
      const newItem = { ...itemData, id: Date.now().toString() };
      setItems(prev => [newItem, ...prev]);
    }
  };

  const handleEdit = (item: ItemMasterData) => {
    setEditingItem(item);
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    if(confirm('Are you sure you want to delete this item?')) {
        setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setIsDrawerOpen(true);
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-1 w-full gap-3 flex-col sm:flex-row">
              <div className="relative w-full sm:w-72">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                      type="text" 
                      placeholder="Search Item Name or Code..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  />
              </div>
              <button className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Filter size={18} />
              </button>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
              <button 
                  onClick={handleCreateNew}
                  className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors whitespace-nowrap"
              >
                  <Plus size={18} className="mr-2" />
                  New Item
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
                          <th className="px-6 py-3">Unit</th>
                          <th className="px-6 py-3">HSN/SAC</th>
                          <th className="px-6 py-3 text-right">Tax %</th>
                          <th className="px-6 py-3 text-right">Stock</th>
                          <th className="px-6 py-3">Method</th>
                          <th className="px-6 py-3 text-center">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                      {filteredItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                  {item.name}
                                  {item.isService && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Svc</span>}
                              </td>
                              <td className="px-6 py-4 text-gray-500">{item.code}</td>
                              <td className="px-6 py-4">{item.group}</td>
                              <td className="px-6 py-4">{item.unit}</td>
                              <td className="px-6 py-4 text-gray-500">{item.hsn}</td>
                              <td className="px-6 py-4 text-right">{item.taxRate}%</td>
                              <td className="px-6 py-4 text-right font-medium">
                                  {item.isService ? '-' : item.openingStock}
                              </td>
                              <td className="px-6 py-4 text-xs text-gray-500">{item.valuationMethod}</td>
                              <td className="px-6 py-4">
                                  <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={() => handleEdit(item)}
                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-blue-600 transition-colors" 
                                        title="Edit"
                                      >
                                          <Edit size={16} />
                                      </button>
                                      <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-red-600 transition-colors" 
                                        title="Delete"
                                      >
                                          <Trash2 size={16} />
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                      {filteredItems.length === 0 && (
                          <tr>
                              <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                  <div className="flex flex-col items-center justify-center">
                                      <Box size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                                      <p className="text-lg font-medium">No items found</p>
                                      <p className="text-sm mt-1">Create a new item to get started.</p>
                                  </div>
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>

      <ItemFormDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleSaveItem}
        initialData={editingItem}
      />
    </div>
  );
};

export default ItemMaster;
