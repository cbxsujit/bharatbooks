
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  X, 
  Save, 
  UploadCloud, 
  Calendar, 
  CreditCard, 
  MoreVertical, 
  Trash2, 
  Edit,
  Wallet,
  Banknote,
  Smartphone,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// --- Types ---

type PaymentMode = 'Cash' | 'Bank Transfer' | 'UPI' | 'Card';
type ExpenseCategory = 'Rent' | 'Salaries' | 'Utilities' | 'Travel' | 'Office Supplies' | 'Maintenance' | 'Others';

interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  payee: string;
  amount: number;
  paymentMode: PaymentMode;
  referenceNo?: string;
}

// --- Mock Data ---

const MOCK_EXPENSES: Expense[] = [
  { id: '1', date: '2024-01-28', category: 'Travel', description: 'Uber for Client Meeting', payee: 'Uber', amount: 850, paymentMode: 'Card' },
  { id: '2', date: '2024-01-25', category: 'Utilities', description: 'Internet Bill Jan 2024', payee: 'Airtel Broadband', amount: 2400, paymentMode: 'UPI' },
  { id: '3', date: '2024-01-20', category: 'Office Supplies', description: 'Pantry items & Coffee', payee: 'Local Mart', amount: 1200, paymentMode: 'Cash' },
  { id: '4', date: '2024-01-15', category: 'Maintenance', description: 'AC Servicing', payee: 'Cool Air Services', amount: 4500, paymentMode: 'Bank Transfer' },
  { id: '5', date: '2024-01-10', category: 'Rent', description: 'Office Rent Jan 2024', payee: 'Landlord', amount: 45000, paymentMode: 'Bank Transfer' },
];

// --- Helper Components ---

const CategoryBadge: React.FC<{ category: ExpenseCategory }> = ({ category }) => {
  const styles: Record<ExpenseCategory, string> = {
    Rent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    Salaries: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    Utilities: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    Travel: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'Office Supplies': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    Maintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    Others: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[category]}`}>
      {category}
    </span>
  );
};

const ModeIcon: React.FC<{ mode: PaymentMode }> = ({ mode }) => {
  switch (mode) {
    case 'Cash': return <Banknote size={14} className="mr-1.5 text-green-600" />;
    case 'Card': return <CreditCard size={14} className="mr-1.5 text-blue-600" />;
    case 'UPI': return <Smartphone size={14} className="mr-1.5 text-orange-600" />;
    case 'Bank Transfer': return <Wallet size={14} className="mr-1.5 text-purple-600" />;
    default: return null;
  }
};

const ExpenseDrawer: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (expense: Omit<Expense, 'id'>, addAnother: boolean) => void;
  initialData?: Expense | null;
}> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Omit<Expense, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    category: 'Others',
    description: '',
    payee: '',
    amount: 0,
    paymentMode: 'Cash',
    referenceNo: ''
  });

  // Reset or populate form when opening
  React.useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                date: new Date().toISOString().split('T')[0],
                category: 'Others',
                description: '',
                payee: '',
                amount: 0,
                paymentMode: 'Cash',
                referenceNo: ''
            });
        }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (addAnother: boolean) => {
      onSubmit(formData, addAnother);
      if (addAnother) {
          setFormData(prev => ({
              ...prev,
              description: '',
              amount: 0,
              referenceNo: ''
          }));
      }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {initialData ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Date & Category */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input 
                        type="date" 
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value as ExpenseCategory})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                    >
                        <option value="Rent">Rent</option>
                        <option value="Salaries">Salaries</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Travel">Travel</option>
                        <option value="Office Supplies">Office Supplies</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Others">Others</option>
                    </select>
                </div>
            </div>

            {/* Payee */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor / Payee</label>
                <input 
                    type="text" 
                    placeholder="e.g. Uber, Landlord, Airtel"
                    value={formData.payee}
                    onChange={e => setFormData({...formData, payee: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea 
                    rows={2}
                    placeholder="What was this expense for?"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white resize-none"
                />
            </div>

            {/* Amount & Mode */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
                    <input 
                        type="number" 
                        min="0"
                        value={formData.amount || ''}
                        onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white font-medium"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Mode</label>
                    <select 
                        value={formData.paymentMode}
                        onChange={e => setFormData({...formData, paymentMode: e.target.value as PaymentMode})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                    >
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                    </select>
                </div>
            </div>

            {/* Reference & Attachment */}
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference No. (Optional)</label>
                    <input 
                        type="text" 
                        placeholder="Txn ID, Cheque No."
                        value={formData.referenceNo}
                        onChange={e => setFormData({...formData, referenceNo: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachment</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                        <UploadCloud className="text-gray-400 mb-2" size={24} />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Click to upload bill or receipt</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col gap-3">
            <div className="flex gap-3">
                <button 
                    onClick={() => handleSubmit(false)}
                    className="flex-1 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 py-2.5 rounded-lg font-medium transition-colors"
                >
                    Save Expense
                </button>
                <button 
                    onClick={() => handleSubmit(true)}
                    className="flex-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                    Save & Add Another
                </button>
            </div>
            <button 
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-center mt-1"
            >
                Cancel
            </button>
        </div>
      </div>
    </>
  );
};

// --- Main Component ---

const QuickExpenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');

  // Handlers
  const handleSave = (data: Omit<Expense, 'id'>, addAnother: boolean) => {
      if (editingExpense) {
          setExpenses(prev => prev.map(ex => ex.id === editingExpense.id ? { ...data, id: editingExpense.id } : ex));
          setEditingExpense(null);
      } else {
          const newExpense = { ...data, id: Date.now().toString() };
          setExpenses(prev => [newExpense, ...prev]);
      }
      
      if (!addAnother) {
          setIsDrawerOpen(false);
      }
  };

  const handleDelete = (id: string) => {
      if (window.confirm('Are you sure you want to delete this expense?')) {
          setExpenses(prev => prev.filter(ex => ex.id !== id));
      }
  };

  const handleEdit = (expense: Expense) => {
      setEditingExpense(expense);
      setIsDrawerOpen(true);
  };

  const handleAddNew = () => {
      setEditingExpense(null);
      setIsDrawerOpen(true);
  };

  // Filtering
  const filteredExpenses = expenses.filter(ex => {
      const matchesSearch = 
        ex.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ex.payee.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' || ex.category === categoryFilter;
      const matchesMode = modeFilter === 'All' || ex.paymentMode === modeFilter;

      return matchesSearch && matchesCategory && matchesMode;
  });

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
        
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-1 w-full gap-3 flex-col sm:flex-row">
                 {/* Search */}
                 <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search Description or Payee..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                </div>
                
                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                    <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                    >
                        <option value="All">All Categories</option>
                        <option value="Rent">Rent</option>
                        <option value="Salaries">Salaries</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Travel">Travel</option>
                        <option value="Office Supplies">Office Supplies</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Others">Others</option>
                    </select>
                    
                    <select 
                        value={modeFilter}
                        onChange={(e) => setModeFilter(e.target.value)}
                        className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                    >
                        <option value="All">All Modes</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                    </select>

                     <button className="flex items-center space-x-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 whitespace-nowrap">
                         <Calendar size={16} className="text-gray-400" />
                         <span>Date</span>
                     </button>
                </div>
            </div>

            {/* Add Button */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                <button 
                    onClick={handleAddNew}
                    className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors whitespace-nowrap w-full sm:w-auto"
                >
                    <Plus size={18} className="mr-2" />
                    Add New Expense
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3">Vendor / Payee</th>
                            <th className="px-6 py-3">Mode</th>
                            <th className="px-6 py-3 text-right">Amount</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                        {filteredExpenses.map((expense) => (
                            <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">{expense.date}</td>
                                <td className="px-6 py-4">
                                    <CategoryBadge category={expense.category} />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{expense.description}</div>
                                    {expense.referenceNo && <div className="text-xs text-gray-500">Ref: {expense.referenceNo}</div>}
                                </td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{expense.payee}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                                        <ModeIcon mode={expense.paymentMode} />
                                        {expense.paymentMode}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                                    ₹ {expense.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleEdit(expense)}
                                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-blue-600 transition-colors" 
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(expense.id)}
                                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-red-600 transition-colors" 
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredExpenses.length === 0 && (
                             <tr>
                                 <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                     <div className="flex flex-col items-center justify-center">
                                         <FileText size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                                         <p className="text-lg font-medium">No expenses found</p>
                                         <p className="text-sm mt-1">Adjust filters or add a new expense.</p>
                                     </div>
                                 </td>
                             </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination (Static) */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing <span className="font-medium text-gray-900 dark:text-white">1</span> to <span className="font-medium text-gray-900 dark:text-white">{filteredExpenses.length}</span> of <span className="font-medium text-gray-900 dark:text-white">{filteredExpenses.length}</span> results
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

        {/* Drawer */}
        <ExpenseDrawer 
            isOpen={isDrawerOpen} 
            onClose={() => setIsDrawerOpen(false)} 
            onSubmit={handleSave}
            initialData={editingExpense}
        />
    </div>
  );
};

export default QuickExpenses;
