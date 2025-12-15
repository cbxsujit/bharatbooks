import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  ChevronDown,
  Info,
  AlertTriangle,
  FileText
} from 'lucide-react';

// --- Mock Data ---

const MOCK_VENDORS = [
  { id: '1', name: 'Office Supplies Co.', state: 'Maharashtra', gstin: '27VENDOR1234X1Z5', bills: ['BILL-2024-882', 'BILL-2024-890'] },
  { id: '2', name: 'Tech Solutions Ltd', state: 'Karnataka', gstin: '29TECHSOL9876L1Z2', bills: ['BILL-2024-901'] },
  { id: '3', name: 'Furniture Mart', state: 'Delhi', gstin: '07FURNI1111A1Z9', bills: ['BILL-2024-756'] },
];

const MOCK_ITEMS = [
  { id: '1', name: 'Web Development Services', hsn: '998311', unit: 'Hrs', rate: 2000, tax: 18 },
  { id: '2', name: 'Dell XPS 15 Laptop', hsn: '8471', unit: 'Nos', rate: 110000, tax: 18 },
  { id: '3', name: 'Office Chair Ergo', hsn: '9403', unit: 'Nos', rate: 8500, tax: 18 },
  { id: '4', name: 'Wireless Mouse', hsn: '8471', unit: 'Nos', rate: 600, tax: 18 },
  { id: '5', name: 'Printer Paper (A4)', hsn: '4802', unit: 'Ream', rate: 250, tax: 12 },
];

// --- Types ---

interface LineItem {
  id: string;
  itemId: string;
  name: string;
  qty: number;
  unit: string;
  rate: number;
  taxRate: number;
}

interface NewDebitNoteProps {
  onCancel: () => void;
}

const NewDebitNote: React.FC<NewDebitNoteProps> = ({ onCancel }) => {
  // --- State ---
  
  const [vendorId, setVendorId] = useState<string>('');
  const [linkedBill, setLinkedBill] = useState('');
  const [dnNumber, setDnNumber] = useState('DN-2024-001');
  const [dnDate, setDnDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', itemId: '', name: '', qty: 1, unit: '', rate: 0, taxRate: 0 }
  ]);

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // --- Helpers ---

  const selectedVendor = useMemo(() => MOCK_VENDORS.find(v => v.id === vendorId), [vendorId]);

  const availableBills = useMemo(() => {
    return selectedVendor ? selectedVendor.bills : [];
  }, [selectedVendor]);

  const calculateLineTotal = (item: LineItem) => {
    const baseAmount = item.qty * item.rate;
    const taxAmount = baseAmount * (item.taxRate / 100);
    return baseAmount + taxAmount;
  };

  const totals = useMemo(() => {
    let subTotal = 0;
    let totalTax = 0;

    items.forEach(item => {
      const baseAmount = item.qty * item.rate;
      const taxAmount = baseAmount * (item.taxRate / 100);
      subTotal += baseAmount;
      totalTax += taxAmount;
    });

    const grandTotal = subTotal + totalTax;
    return {
      subTotal,
      totalTax,
      grandTotal
    };
  }, [items]);

  const getAmountInWords = (amount: number) => {
    if (amount === 0) return 'Zero Only';
    return "Rupees " + amount.toLocaleString() + " Only (Placeholder)";
  };

  // --- Handlers ---

  const handleItemSelect = (index: number, itemId: string) => {
    const selectedItem = MOCK_ITEMS.find(i => i.id === itemId);
    if (!selectedItem) return;

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      itemId: selectedItem.id,
      name: selectedItem.name,
      unit: selectedItem.unit,
      rate: selectedItem.rate,
      taxRate: selectedItem.tax,
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
      { id: Date.now().toString(), itemId: '', name: '', qty: 1, unit: '', rate: 0, taxRate: 0 }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!vendorId) newErrors.vendor = "Vendor is required";
    if (!dnDate) newErrors.dnDate = "Date is required";
    if (!dnNumber.trim()) newErrors.dnNumber = "Debit Note No. is required";
    
    // Validate items
    const invalidItems = items.some(item => !item.itemId && (!item.name || item.qty <= 0 || item.rate <= 0));
    if (invalidItems) newErrors.items = "Ensure all lines have valid items, qty > 0, and rate > 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (action: string) => {
      if (validateForm()) {
          // In a real app, we would save the data here
          // console.log("Saving Debit Note", { action, vendorId, dnNumber, items, totals });
          onCancel();
      }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 animate-fade-in pb-20 lg:pb-0">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">New Debit Note</h1>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
          Draft Mode
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select 
                    value={vendorId}
                    onChange={(e) => { setVendorId(e.target.value); setLinkedBill(''); }}
                    className={`w-full appearance-none bg-gray-50 dark:bg-gray-900 border rounded-lg py-2.5 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow ${errors.vendor ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    <option value="">Select Vendor</option>
                    {MOCK_VENDORS.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                {errors.vendor && <p className="text-xs text-red-500 mt-1">{errors.vendor}</p>}
              </div>
              
              {selectedVendor && (
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedVendor.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-0.5">GSTIN: {selectedVendor.gstin}</p>
                  <p className="text-gray-500 dark:text-gray-400">{selectedVendor.state}, India</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link to Purchase Bill (Optional)</label>
                <div className="relative">
                    <select 
                        value={linkedBill}
                        onChange={(e) => setLinkedBill(e.target.value)}
                        disabled={!vendorId}
                        className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="">Select Bill</option>
                        {availableBills.map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                {linkedBill && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center">
                        <Info size={12} className="mr-1" />
                        Return quantities will be validated against bill {linkedBill}.
                    </p>
                )}
              </div>
            </div>

            {/* Right: DN Details & Reason */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Debit Note # <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={dnNumber}
                            onChange={(e) => setDnNumber(e.target.value)}
                            className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-lg py-2 px-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.dnNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                        {errors.dnNumber && <p className="text-xs text-red-500 mt-1">{errors.dnNumber}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date <span className="text-red-500">*</span></label>
                        <input 
                            type="date" 
                            value={dnDate}
                            onChange={(e) => setDnDate(e.target.value)}
                            className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-lg py-2 px-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.dnDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                         {errors.dnDate && <p className="text-xs text-red-500 mt-1">{errors.dnDate}</p>}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                    <textarea 
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g., Damaged goods received, Rate difference..."
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden ${errors.items ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 w-64">Item</th>
                    <th className="px-4 py-3 w-32 text-right">Return Qty</th>
                    <th className="px-4 py-3 w-24 text-center">Unit</th>
                    <th className="px-4 py-3 w-32 text-right">Rate (₹)</th>
                    <th className="px-4 py-3 w-24 text-right">Tax %</th>
                    <th className="px-4 py-3 w-32 text-right">Total</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item, index) => (
                    <tr key={item.id} className="group bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                      <td className="px-4 py-3 align-top">
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
                      </td>
                      
                      <td className="px-4 py-3 align-top">
                         <input 
                            type="number" 
                            min="1"
                            value={item.qty}
                            onChange={(e) => updateItem(index, 'qty', parseFloat(e.target.value) || 0)}
                            className="w-full text-right bg-transparent border-b border-gray-300 dark:border-gray-600 py-1 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                         />
                         {/* Mock Validation Warning */}
                         {linkedBill && item.qty > 5 && (
                             <div className="text-xs text-orange-500 mt-1 flex items-center justify-end font-medium">
                                 <AlertTriangle size={10} className="mr-1" />
                                 &gt; Billed Qty
                             </div>
                         )}
                      </td>

                      <td className="px-4 py-3 align-top text-center text-gray-500 dark:text-gray-400">
                          {item.unit}
                      </td>

                      <td className="px-4 py-3 align-top">
                         <input 
                            type="number" 
                            value={item.rate}
                            onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-full text-right bg-transparent border-b border-gray-300 dark:border-gray-600 py-1 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                         />
                      </td>

                      <td className="px-4 py-3 align-top text-right text-gray-500 dark:text-gray-400">
                          {item.taxRate}%
                      </td>

                      <td className="px-4 py-3 align-top text-right font-medium text-gray-900 dark:text-white">
                          {calculateLineTotal(item).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="px-4 py-3 align-top text-center">
                          <button 
                              onClick={() => removeItem(index)}
                              className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                              <Trash2 size={18} />
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700">
               <button 
                 onClick={addItem}
                 className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium transition-colors"
               >
                 <Plus size={16} className="mr-1" /> Add Line Item
               </button>
               {errors.items && <p className="text-xs text-red-500 mt-2">{errors.items}</p>}
            </div>
          </div>

          {/* Footer Totals */}
          <div className="flex flex-col lg:flex-row justify-between gap-8">
              
              {/* Left Footer: Words & Notes */}
              <div className="flex-1 space-y-4">
                   <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                       <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Amount In Words</p>
                       <p className="text-gray-900 dark:text-white italic font-medium">{getAmountInWords(totals.grandTotal)}</p>
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
            className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
             Cancel
          </button>
          <button 
             onClick={() => handleSave('save')}
             className="w-full sm:w-auto px-6 py-2.5 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
             Save
          </button>
          <button 
             onClick={() => handleSave('adjust')}
             className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center"
          >
             <Save size={18} className="mr-2" />
             Save & Adjust Balance
          </button>
      </div>
    </div>
  );
};

export default NewDebitNote;