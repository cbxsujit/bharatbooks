
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Save, 
  X, 
  ChevronDown,
  CreditCard,
  Briefcase,
  Info,
  Truck
} from 'lucide-react';

// --- Mock Data ---

const MOCK_VENDORS = [
  { id: '1', name: 'Office Supplies Co.', state: 'Maharashtra', gstin: '27VENDOR1234X1Z5' },
  { id: '2', name: 'Tech Solutions Ltd', state: 'Karnataka', gstin: '29TECHSOL9876L1Z2' },
  { id: '3', name: 'Furniture Mart', state: 'Delhi', gstin: '07FURNI1111A1Z9' },
];

const MOCK_ITEMS = [
  { id: '1', name: 'Web Development Services', hsn: '998311', unit: 'Hrs', rate: 2000, tax: 18 },
  { id: '2', name: 'Dell XPS 15 Laptop', hsn: '8471', unit: 'Nos', rate: 110000, tax: 18 },
  { id: '3', name: 'Office Chair Ergo', hsn: '9403', unit: 'Nos', rate: 8500, tax: 18 },
  { id: '4', name: 'Wireless Mouse', hsn: '8471', unit: 'Nos', rate: 600, tax: 18 },
  { id: '5', name: 'Printer Paper (A4)', hsn: '4802', unit: 'Ream', rate: 250, tax: 12 },
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
}

interface NewPurchaseBillProps {
  onCancel: () => void;
  initialData?: any; // Using any to avoid circular dep issues with ScannedData, but ideally typed
}

const NewPurchaseBill: React.FC<NewPurchaseBillProps> = ({ onCancel, initialData }) => {
  // --- State ---
  
  // Header Details
  const [vendorId, setVendorId] = useState<string>('');
  const [vendorGstin, setVendorGstin] = useState('');
  const [billNo, setBillNo] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('');
  
  // Line Items
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', itemId: '', name: '', hsn: '', qty: 1, unit: '', rate: 0, discountPercent: 0, taxRate: 0 }
  ]);

  // Other Charges
  const [otherCharges, setOtherCharges] = useState<number>(0);

  // UI State
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  // --- Keyboard Handling ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S to Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave('booked');
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
  }, [vendorId, billNo, billDate, items]); 

  // --- Effects ---

  useEffect(() => {
    if (initialData) {
       // Try to match vendor by name
       const foundVendor = MOCK_VENDORS.find(v => v.name.toLowerCase().includes(initialData.vendorName.toLowerCase()));
       if (foundVendor) {
         setVendorId(foundVendor.id);
         setVendorGstin(foundVendor.gstin);
         setPlaceOfSupply(foundVendor.state);
       } else if (initialData.vendorName) {
         // We could set the name for "New Vendor" flow but for now just leave blank or use what we can
         // setVendorGstin(initialData.vendorGstin);
       }

       setBillNo(initialData.billNo);
       if(initialData.billDate) setBillDate(initialData.billDate);

       // Logic to map items
       if (initialData.items && initialData.items.length > 0) {
          const mappedItems = initialData.items.map((scannedItem: any, index: number) => {
              // Try to find matching item in master by fuzzy name match
              const masterItem = MOCK_ITEMS.find(i => i.name.toLowerCase().includes(scannedItem.description.toLowerCase()));
              return {
                  id: Date.now().toString() + index,
                  itemId: masterItem ? masterItem.id : '', // Link if found, else empty
                  name: scannedItem.description, // Use scanned description if no master found
                  hsn: masterItem ? masterItem.hsn : '',
                  qty: scannedItem.qty,
                  unit: masterItem ? masterItem.unit : 'Nos',
                  rate: scannedItem.rate,
                  discountPercent: 0,
                  taxRate: scannedItem.taxPercent || 0
              }
          });
          setItems(mappedItems);
       }
    }
  }, [initialData]);

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

    const grandTotalBeforeRound = subTotal + totalTax + otherCharges;
    const roundedTotal = Math.round(grandTotalBeforeRound);
    const roundOff = roundedTotal - grandTotalBeforeRound;

    return {
      subTotal,
      totalTax,
      roundOff,
      grandTotal: roundedTotal
    };
  }, [items, otherCharges]);

  // --- Handlers ---

  const handleVendorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id === 'new') {
      setShowVendorModal(true);
    } else {
      setVendorId(id);
      const vendor = MOCK_VENDORS.find(v => v.id === id);
      if (vendor) {
        setVendorGstin(vendor.gstin);
        setPlaceOfSupply(vendor.state);
        if (errors.vendor) {
            const newErrors = { ...errors };
            delete newErrors.vendor;
            setErrors(newErrors);
        }
      } else {
        setVendorGstin('');
        setPlaceOfSupply('');
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
      qty: 1
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
      { id: Date.now().toString(), itemId: '', name: '', hsn: '', qty: 1, unit: '', rate: 0, discountPercent: 0, taxRate: 0 }
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
    if (!billNo.trim()) newErrors.billNo = "Bill No. is required";
    if (!billDate) newErrors.billDate = "Bill Date is required";
    
    const invalidItems = items.some(item => item.qty <= 0 || item.rate <= 0);
    // Relaxed item check: allow items without itemId (adhoc items from scan) as long as they have rate/qty
    if (invalidItems) newErrors.items = "Ensure all lines have qty > 0 and rate > 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (action: string) => {
    if (validateForm()) {
      // console.log("Saving Bill", { action, vendorId, billNo, items, totals });
      setShowSuccessToast(true);
      setTimeout(() => {
          setShowSuccessToast(false);
          onCancel();
      }, 1500);
    }
  };

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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">New Purchase Bill</h1>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
          {initialData ? 'AI Pre-filled' : 'Not Saved'}
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
          <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center animate-bounce-in">
              <Save size={20} className="mr-2" />
              Bill Saved Successfully!
          </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: Vendor Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select 
                    value={vendorId}
                    onChange={handleVendorChange}
                    className={`w-full appearance-none bg-gray-50 dark:bg-gray-900 border rounded-lg py-2.5 pl-4 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow ${errors.vendor ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    autoFocus
                  >
                    <option value="">Select Vendor</option>
                    {MOCK_VENDORS.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                    <option value="new" className="font-bold text-primary-600">+ Add New Vendor</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                {errors.vendor && <p className="text-xs text-red-500 mt-1">{errors.vendor}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor GSTIN</label>
                       <input 
                          type="text" 
                          value={vendorGstin}
                          onChange={(e) => setVendorGstin(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Ex: 27ABCDE..."
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
              </div>
            </div>

            {/* Right: Bill Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bill No. <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={billNo}
                  onChange={(e) => setBillNo(e.target.value)}
                  className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-lg py-2 px-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.billNo ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  placeholder="e.g. BILL-2024-001"
                />
                {errors.billNo && <p className="text-xs text-red-500 mt-1">{errors.billNo}</p>}
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bill Date <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-lg py-2 px-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.billDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {errors.billDate && <p className="text-xs text-red-500 mt-1">{errors.billDate}</p>}
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  {items.map((item, index) => (
                    <tr key={item.id} className="group bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                      {/* Item Selection */}
                      <td className="px-4 py-3 align-top">
                        <div className="relative">
                          <div className="flex flex-col">
                            <select
                                value={item.itemId}
                                onChange={(e) => handleItemSelect(index, e.target.value)}
                                className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 py-1 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
                            >
                                <option value="">{item.name ? item.name : 'Select Item'}</option>
                                {MOCK_ITEMS.map(i => (
                                <option key={i.id} value={i.id}>{i.name}</option>
                                ))}
                            </select>
                            {/* Fallback input for name if item not in master (from scan) */}
                            {!item.itemId && (
                                <input 
                                    type="text" 
                                    placeholder="Item Name"
                                    value={item.name}
                                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                                    className="w-full text-xs mt-1 bg-transparent border-none focus:ring-0 p-0 text-gray-500 dark:text-gray-400"
                                />
                            )}
                          </div>
                          {item.itemId && (
                              <div className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center">
                                  <Info size={10} className="mr-1" />
                                  Updates stock
                              </div>
                          )}
                        </div>
                      </td>
                      
                      {/* HSN */}
                      <td className="px-4 py-3 align-top">
                         <input 
                            type="text" 
                            value={item.hsn} 
                            readOnly={!!item.itemId}
                            onChange={(e) => updateItem(index, 'hsn', e.target.value)}
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
                            className="w-full text-right bg-transparent border-b border-gray-300 dark:border-gray-600 py-1 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none"
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
                          <div className="flex items-center justify-end">
                             <input 
                                type="number"
                                value={item.taxRate}
                                onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                                className="w-12 text-right bg-transparent border-none focus:ring-0 p-0"
                             />
                             <span>%</span>
                          </div>
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
                  ))}
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
               {errors.items && <p className="text-xs text-red-500 mt-2">{errors.items}</p>}
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
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                       <textarea 
                          rows={3}
                          placeholder="Internal notes about this purchase..."
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
                      
                      {/* Other Charges Input */}
                      <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                          <div className="flex items-center">
                              <Truck size={14} className="mr-1.5 text-gray-400" />
                              <span>Other Charges</span>
                          </div>
                          <div className="w-24">
                              <input 
                                type="number" 
                                value={otherCharges}
                                onChange={(e) => setOtherCharges(parseFloat(e.target.value) || 0)}
                                className="w-full text-right bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-primary-500 dark:text-white"
                              />
                          </div>
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
             onClick={() => handleSave('draft')}
             className="w-full sm:w-auto px-6 py-2.5 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg font-medium transition-colors focus:ring-2 focus:ring-gray-500"
          >
             Save as Draft
          </button>
          <button 
             onClick={() => handleSave('booked')}
             className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
             title="Ctrl+S to Save"
          >
             <Save size={18} className="mr-2" />
             Save & Mark Booked
          </button>
      </div>

      {/* Add Vendor Modal */}
      {showVendorModal && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-96 border border-gray-200 dark:border-gray-700 animate-fade-in">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                     <Briefcase size={20} className="mr-2 text-primary-600" />
                     Add New Vendor
                 </h3>
                 <div className="space-y-4">
                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor Name</label>
                         <input 
                            type="text" 
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white"
                            value={newVendorName}
                            onChange={(e) => setNewVendorName(e.target.value)}
                            autoFocus
                         />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                         <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white">
                             {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GSTIN</label>
                         <input 
                            type="text" 
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white"
                            placeholder="Optional"
                         />
                     </div>
                 </div>
                 <div className="flex justify-end space-x-3 mt-6">
                     <button 
                        onClick={() => { setShowVendorModal(false); setVendorId(''); }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                     >
                         Cancel
                     </button>
                     <button 
                        onClick={() => { setShowVendorModal(false); setVendorId('1'); }} // Mock success
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                     >
                         Add Vendor
                     </button>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
};

export default NewPurchaseBill;
