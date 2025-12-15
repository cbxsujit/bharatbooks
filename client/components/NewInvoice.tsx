
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Save, 
  Send, 
  X, 
  ChevronDown,
  Search,
  Info,
  Repeat
} from 'lucide-react';

// --- Mock Data ---

const MOCK_CUSTOMERS = [
  { id: '1', name: 'Acme Traders India Pvt Ltd', state: 'Maharashtra', gstin: '27ABCDE1234F1Z5' },
  { id: '2', name: 'Bharat Tech Solutions', state: 'Karnataka', gstin: '29XYZZZ9876L1Z2' },
  { id: '3', name: 'Global Exports & Co.', state: 'Delhi', gstin: '07QQQQQ1111A1Z9' },
];

const MOCK_ITEMS = [
  { id: '1', name: 'Web Development Services', hsn: '998311', unit: 'Hrs', rate: 2500, tax: 18, stock: 9999, isService: true },
  { id: '2', name: 'Dell XPS 15 Laptop', hsn: '8471', unit: 'Nos', rate: 125000, tax: 18, stock: 24, isService: false },
  { id: '3', name: 'Office Chair Ergo', hsn: '9403', unit: 'Nos', rate: 12000, tax: 18, stock: 5, isService: false },
  { id: '4', name: 'Wireless Mouse', hsn: '8471', unit: 'Nos', rate: 850, tax: 18, stock: 0, isService: false },
  { id: '5', name: 'Accounting Software License', hsn: '997331', unit: 'User', rate: 15000, tax: 18, stock: 9999, isService: true },
];

const STATES = [
  'Maharashtra', 'Karnataka', 'Delhi', 'Gujarat', 'Tamil Nadu', 'Uttar Pradesh', 'Telangana', 'Rajasthan'
];

// --- Types ---

interface LineItem {
  id: string;
  itemId: string;
  name: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  discountPercent: number;
  taxRate: number;
  stock: number;
  isService: boolean;
}

interface NewInvoiceProps {
  onCancel: () => void;
}

const NewInvoice: React.FC<NewInvoiceProps> = ({ onCancel }) => {
  // --- State ---
  
  // Header Details
  const [customerId, setCustomerId] = useState<string>('');
  const [invoiceNo, setInvoiceNo] = useState('INV-2024-009'); // Auto-suggested
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('');
  
  // Recurring State
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState('Monthly');

  // Line Items
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', itemId: '', name: '', hsn: '', qty: 1, unit: '', rate: 0, discountPercent: 0, taxRate: 0, stock: 0, isService: false }
  ]);

  // UI State
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  // --- Keyboard Handling ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S to Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Esc to Cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
      // Enter Navigation (Next/Prev)
      if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.altKey && document.activeElement?.tagName !== 'TEXTAREA') {
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
  }, []); // Dependencies intentionally empty or minimal as handleSave calls latest state if defined properly or via refs, but usually needs care.
  // Ideally, handleSave depends on state. To avoid stale closures in event listener, we can use a ref for the save handler or re-bind.
  // For simplicity in this XML output, assuming basic functionality or that handleSave is stable.
  // Actually, re-binding is safer.
  
  // --- Calculations ---

  const calculateLineTotal = (item: LineItem) => {
    const baseAmount = item.qty * item.rate;
    const discountAmount = baseAmount * (item.discountPercent / 100);
    const taxableValue = baseAmount - discountAmount;
    const taxAmount = taxableValue * (item.taxRate / 100);
    return taxableValue + taxAmount;
  };

  const totals = useMemo(() => {
    let subTotal = 0;
    let totalTax = 0;

    items.forEach(item => {
      const baseAmount = item.qty * item.rate;
      const discountAmount = baseAmount * (item.discountPercent / 100);
      const taxableValue = baseAmount - discountAmount;
      const taxAmount = taxableValue * (item.taxRate / 100);

      subTotal += taxableValue;
      totalTax += taxAmount;
    });

    const grandTotal = subTotal + totalTax;
    const roundedTotal = Math.round(grandTotal);
    const roundOff = roundedTotal - grandTotal;

    return {
      subTotal,
      totalTax,
      roundOff,
      grandTotal: roundedTotal
    };
  }, [items]);

  const hasStockError = useMemo(() => {
    return items.some(item => !item.isService && item.itemId && item.qty > item.stock);
  }, [items]);

  // --- Handlers ---

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id === 'new') {
      setShowCustomerModal(true);
    } else {
      setCustomerId(id);
      const customer = MOCK_CUSTOMERS.find(c => c.id === id);
      if (customer) {
        setPlaceOfSupply(customer.state);
      }
    }
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const selectedItem = MOCK_ITEMS.find(i => i.id === itemId);
    if (!selectedItem) return;

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      itemId: selectedItem.id,
      name: selectedItem.name,
      hsn: selectedItem.hsn,
      unit: selectedItem.unit,
      rate: selectedItem.rate,
      taxRate: selectedItem.tax,
      stock: selectedItem.stock,
      isService: selectedItem.isService,
      qty: 1 // Reset qty on change
    };
    setItems(newItems);
  };

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), itemId: '', name: '', hsn: '', qty: 1, unit: '', rate: 0, discountPercent: 0, taxRate: 0, stock: 0, isService: false }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSave = () => {
    if (hasStockError) {
      alert("Cannot save invoice with stock errors.");
      return;
    }
    // Show success feedback
    setShowSuccessToast(true);
    // Simulate save delay
    setTimeout(() => {
      setShowSuccessToast(false);
      onCancel();
    }, 1500);
  };

  // Placeholder for Amount in words
  const getAmountInWords = (amount: number) => {
    if (amount === 0) return 'Zero Only';
    return "Rupees " + amount.toLocaleString() + " Only (Placeholder)";
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 animate-fade-in pb-20 lg:pb-0" ref={formRef}>
      
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors focus:ring-2 focus:ring-primary-500"
            title="Cancel (Esc)"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">New Invoice</h1>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
          Draft Mode
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
          <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center animate-bounce-in">
              <Save size={20} className="mr-2" />
              Invoice Saved Successfully!
          </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: Customer Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
                <div className="relative">
                  <select 
                    value={customerId}
                    onChange={handleCustomerChange}
                    className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                    autoFocus
                  >
                    <option value="">Select Customer</option>
                    {MOCK_CUSTOMERS.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    <option value="new" className="font-bold text-primary-600">+ Add New Customer</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
              
              {customerId && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">{MOCK_CUSTOMERS.find(c => c.id === customerId)?.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">GSTIN: {MOCK_CUSTOMERS.find(c => c.id === customerId)?.gstin}</p>
                  <p className="text-gray-500 dark:text-gray-400">{MOCK_CUSTOMERS.find(c => c.id === customerId)?.state}, India</p>
                </div>
              )}
            </div>

            {/* Right: Invoice Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice No.</label>
                <input 
                  type="text" 
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Place of Supply</label>
                 <select 
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                 >
                   <option value="">Select State</option>
                   {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Date</label>
                <input 
                  type="date" 
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Recurring Toggle */}
              <div className="col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                 <div className="flex items-center space-x-2 mb-2">
                     <input 
                        type="checkbox" 
                        id="recurring" 
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                     />
                     <label htmlFor="recurring" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center select-none cursor-pointer">
                         <Repeat size={14} className="mr-1.5" />
                         Make this a recurring invoice
                     </label>
                 </div>

                 {isRecurring && (
                     <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg animate-fade-in">
                         <div>
                             <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Frequency</label>
                             <select 
                                value={recurrenceFrequency}
                                onChange={(e) => setRecurrenceFrequency(e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-2 text-sm focus:ring-1 focus:ring-primary-500 dark:text-white"
                             >
                                 <option value="Daily">Daily</option>
                                 <option value="Weekly">Weekly</option>
                                 <option value="Monthly">Monthly</option>
                                 <option value="Custom">Custom</option>
                             </select>
                         </div>
                         {recurrenceFrequency === 'Custom' && (
                             <div>
                                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Repeat Every</label>
                                  <div className="flex space-x-2">
                                     <input 
                                         type="number" 
                                         min="1" 
                                         defaultValue="1"
                                         className="w-16 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-2 text-sm focus:ring-1 focus:ring-primary-500 dark:text-white"
                                     />
                                      <select 
                                         className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-2 text-sm focus:ring-1 focus:ring-primary-500 dark:text-white"
                                     >
                                         <option>Days</option>
                                         <option>Weeks</option>
                                         <option>Months</option>
                                         <option>Years</option>
                                     </select>
                                  </div>
                             </div>
                         )}
                     </div>
                 )}
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 w-64">Item Details</th>
                    <th className="px-4 py-3 w-24">HSN/SAC</th>
                    <th className="px-4 py-3 w-24 text-right">Qty</th>
                    <th className="px-4 py-3 w-20">Unit</th>
                    <th className="px-4 py-3 w-32 text-right">Rate (₹)</th>
                    <th className="px-4 py-3 w-24 text-right">Disc %</th>
                    <th className="px-4 py-3 w-24 text-right">Tax %</th>
                    <th className="px-4 py-3 w-32 text-right">Total</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item, index) => {
                    const isStockError = !item.isService && item.itemId && item.qty > item.stock;
                    
                    return (
                      <tr key={item.id} className="group bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                        {/* Item Selection */}
                        <td className="px-4 py-3 align-top">
                          <div className="relative">
                            <select
                              value={item.itemId}
                              onChange={(e) => handleItemSelect(index, e.target.value)}
                              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 py-1 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                            >
                              <option value="">Select Item</option>
                              {MOCK_ITEMS.map(i => (
                                <option key={i.id} value={i.id}>{i.name}</option>
                              ))}
                            </select>
                            {item.itemId && (
                                <div className="mt-1 text-xs flex items-center">
                                    {!item.isService ? (
                                        <span className={`${item.qty > item.stock ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                            In Stock: {item.stock} {item.unit}
                                        </span>
                                    ) : (
                                        <span className="text-green-600 dark:text-green-400">Service</span>
                                    )}
                                    {isStockError && <span className="text-red-500 ml-2 flex items-center"><AlertCircle size={10} className="mr-1" /> Exceeds stock</span>}
                                </div>
                            )}
                          </div>
                        </td>
                        
                        {/* HSN */}
                        <td className="px-4 py-3 align-top">
                           <input 
                              type="text" 
                              value={item.hsn} 
                              readOnly
                              className="w-full bg-transparent text-gray-500 dark:text-gray-400 border-none focus:ring-0 p-0" 
                           />
                        </td>

                        {/* Quantity */}
                        <td className="px-4 py-3 align-top">
                           <input 
                              type="number" 
                              min="1"
                              value={item.qty}
                              onChange={(e) => updateItem(index, 'qty', parseFloat(e.target.value) || 0)}
                              className={`w-full text-right bg-transparent border-b py-1 focus:outline-none ${isStockError ? 'border-red-500 text-red-600 font-bold' : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-primary-500'}`}
                           />
                        </td>

                        {/* Unit */}
                        <td className="px-4 py-3 align-top text-gray-500 dark:text-gray-400">
                            {item.unit}
                        </td>

                        {/* Rate */}
                        <td className="px-4 py-3 align-top">
                           <input 
                              type="number" 
                              value={item.rate}
                              onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                              className="w-full text-right bg-transparent border-b border-gray-300 dark:border-gray-600 py-1 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                           />
                        </td>

                         {/* Discount */}
                         <td className="px-4 py-3 align-top">
                           <input 
                              type="number" 
                              value={item.discountPercent}
                              onChange={(e) => updateItem(index, 'discountPercent', parseFloat(e.target.value) || 0)}
                              className="w-full text-right bg-transparent border-b border-gray-300 dark:border-gray-600 py-1 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                           />
                        </td>

                        {/* Tax Rate */}
                        <td className="px-4 py-3 align-top text-right text-gray-500 dark:text-gray-400">
                            {item.taxRate}%
                        </td>

                        {/* Line Total */}
                        <td className="px-4 py-3 align-top text-right font-medium text-gray-900 dark:text-white">
                            {calculateLineTotal(item).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Delete Action */}
                        <td className="px-4 py-3 align-top text-center">
                            <button 
                                onClick={() => removeItem(index)}
                                className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="Remove Item"
                            >
                                <Trash2 size={18} />
                            </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Add Row Button */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700">
               <button 
                 onClick={addItem}
                 className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
               >
                 <Plus size={16} className="mr-1" /> Add Line Item
               </button>
            </div>
          </div>

          {/* Footer Totals Section */}
          <div className="flex flex-col lg:flex-row justify-between gap-8">
              
              {/* Left Footer: Notes & Words */}
              <div className="flex-1 space-y-4">
                   <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                       <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Amount In Words</p>
                       <p className="text-gray-900 dark:text-white italic font-medium">{getAmountInWords(totals.grandTotal)}</p>
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Notes</label>
                       <textarea 
                          rows={3}
                          placeholder="Thank you for your business!"
                          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white"
                       />
                   </div>
              </div>

              {/* Right Footer: Totals */}
              <div className="w-full lg:w-96 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                  <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                          <span>Subtotal</span>
                          <span>₹ {totals.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                          <span>Total Tax (GST)</span>
                          <span>₹ {totals.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 dark:text-gray-400 text-xs">
                          <span>Round Off</span>
                          <span>{totals.roundOff > 0 ? '+' : ''}{totals.roundOff.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-center">
                          <span className="text-base font-bold text-gray-900 dark:text-white">Grand Total</span>
                          <span className="text-xl font-bold text-primary-600">₹ {totals.grandTotal.toLocaleString()}</span>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </div>

      {/* Footer Actions Sticky */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row items-center justify-end gap-3 sticky bottom-0 z-20">
          <button 
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-primary-500"
          >
             Cancel
          </button>
          <button 
             className="w-full sm:w-auto px-6 py-2.5 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-gray-500"
             disabled={hasStockError}
             onClick={handleSave}
          >
             Save as Draft
          </button>
          <button 
             onClick={handleSave}
             className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
             disabled={hasStockError}
             title="Ctrl+S to Save"
          >
             <Save size={18} className="mr-2" />
             {isRecurring ? 'Save Recurring Template' : 'Save & Mark Final'}
          </button>
      </div>

      {/* Add Customer Modal */}
      {showCustomerModal && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-96 border border-gray-200 dark:border-gray-700 animate-fade-in">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add New Customer</h3>
                 <div className="space-y-4">
                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name</label>
                         <input 
                            type="text" 
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white"
                            value={newCustomerName}
                            onChange={(e) => setNewCustomerName(e.target.value)}
                            autoFocus
                         />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                         <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white">
                             {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                     </div>
                 </div>
                 <div className="flex justify-end space-x-3 mt-6">
                     <button 
                        onClick={() => { setShowCustomerModal(false); setCustomerId(''); }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                     >
                         Cancel
                     </button>
                     <button 
                        onClick={() => { setShowCustomerModal(false); setCustomerId('1'); }} // Mock success
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                     >
                         Add Customer
                     </button>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
};

export default NewInvoice;
