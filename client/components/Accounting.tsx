
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Filter,
  BookOpen,
  ChevronRight as ChevronRightIcon,
  Briefcase,
  FileText,
  LayoutList,
  Landmark
} from 'lucide-react';
import JournalVouchers from './JournalVouchers';
import BankReconciliation from './BankReconciliation';

// --- Types ---

interface AccountGroup {
  id: string;
  name: string;
  children?: AccountGroup[];
}

interface Ledger {
  id: string;
  name: string;
  code: string;
  groupId: string; // ID of the parent group
  openingBalance: number;
  balanceType: 'Dr' | 'Cr';
  gstApplicable: boolean;
  hsn?: string;
  taxRate?: number;
}

interface AccountingProps {
  globalAction?: string | null;
  resetGlobalAction?: () => void;
}

// --- Mock Data ---

const ACCOUNT_GROUPS: AccountGroup[] = [
  {
    id: 'assets',
    name: 'Assets',
    children: [
      { id: 'current-assets', name: 'Current Assets' },
      { id: 'fixed-assets', name: 'Fixed Assets' },
      { id: 'bank-accounts', name: 'Bank Accounts' },
      { id: 'cash-in-hand', name: 'Cash-in-Hand' },
    ]
  },
  {
    id: 'liabilities',
    name: 'Liabilities',
    children: [
      { id: 'current-liabilities', name: 'Current Liabilities' },
      { id: 'loans', name: 'Loans (Liability)' },
    ]
  },
  {
    id: 'income',
    name: 'Income',
    children: [
      { id: 'direct-income', name: 'Direct Income' },
      { id: 'indirect-income', name: 'Indirect Income' },
    ]
  },
  {
    id: 'expenses',
    name: 'Expenses',
    children: [
      { id: 'direct-expenses', name: 'Direct Expenses' },
      { id: 'indirect-expenses', name: 'Indirect Expenses' },
    ]
  }
];

const MOCK_LEDGERS: Ledger[] = [
  { id: '1', name: 'HDFC Bank', code: 'BK-001', groupId: 'bank-accounts', openingBalance: 150000, balanceType: 'Dr', gstApplicable: false },
  { id: '2', name: 'Petty Cash', code: 'CS-001', groupId: 'cash-in-hand', openingBalance: 5000, balanceType: 'Dr', gstApplicable: false },
  { id: '3', name: 'Furniture & Fixtures', code: 'FA-001', groupId: 'fixed-assets', openingBalance: 45000, balanceType: 'Dr', gstApplicable: true, hsn: '9403', taxRate: 18 },
  { id: '4', name: 'Sales Account', code: 'INC-001', groupId: 'direct-income', openingBalance: 0, balanceType: 'Cr', gstApplicable: true },
  { id: '5', name: 'Office Rent', code: 'EXP-001', groupId: 'indirect-expenses', openingBalance: 0, balanceType: 'Dr', gstApplicable: true, hsn: '997212', taxRate: 18 },
  { id: '6', name: 'Acme Traders (Debtor)', code: 'DB-001', groupId: 'current-assets', openingBalance: 25000, balanceType: 'Dr', gstApplicable: false },
  { id: '7', name: 'Tech Solutions (Creditor)', code: 'CR-001', groupId: 'current-liabilities', openingBalance: 10000, balanceType: 'Cr', gstApplicable: false },
];

// --- Helper Functions ---

// Flatten tree for dropdown
const getFlattenedGroups = (groups: AccountGroup[], prefix = ''): { id: string, name: string }[] => {
  let result: { id: string, name: string }[] = [];
  groups.forEach(group => {
    result.push({ id: group.id, name: prefix + group.name });
    if (group.children) {
      result = result.concat(getFlattenedGroups(group.children, prefix + '— '));
    }
  });
  return result;
};

// Get all child group IDs recursively
const getAllChildGroupIds = (groups: AccountGroup[], targetId: string, found = false): string[] => {
  let ids: string[] = [];
  
  for (const group of groups) {
    if (group.id === targetId) {
      ids.push(group.id);
      if (group.children) {
        ids = ids.concat(getAllGroupIds(group.children));
      }
      return ids;
    }
    if (group.children) {
      const childIds = getAllChildGroupIds(group.children, targetId);
      if (childIds.length > 0) return childIds;
    }
  }
  return ids;
};

const getAllGroupIds = (groups: AccountGroup[]): string[] => {
  let ids: string[] = [];
  groups.forEach(g => {
    ids.push(g.id);
    if (g.children) ids = ids.concat(getAllGroupIds(g.children));
  });
  return ids;
};

// --- Components ---

const GroupTreeItem: React.FC<{ 
  group: AccountGroup; 
  depth: number; 
  expanded: Set<string>; 
  selected: string;
  onToggle: (id: string) => void; 
  onSelect: (id: string) => void; 
}> = ({ group, depth, expanded, selected, onToggle, onSelect }) => {
  const isExpanded = expanded.has(group.id);
  const isSelected = selected === group.id;
  const hasChildren = group.children && group.children.length > 0;

  return (
    <div>
      <div 
        className={`
          flex items-center py-2 px-2 cursor-pointer transition-colors rounded-md
          ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}
        `}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onSelect(group.id)}
      >
        <div 
          className="mr-1 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle(group.id);
          }}
        >
          {hasChildren ? (
             isExpanded ? <ChevronDown size={14} /> : <ChevronRightIcon size={14} />
          ) : <div className="w-3.5" />}
        </div>
        
        {isExpanded ? (
            <FolderOpen size={16} className={`mr-2 ${isSelected ? 'text-primary-500' : 'text-yellow-500'}`} />
        ) : (
            <Folder size={16} className={`mr-2 ${isSelected ? 'text-primary-500' : 'text-yellow-500'}`} />
        )}
        
        <span className={`text-sm font-medium ${isSelected ? 'font-semibold' : ''}`}>{group.name}</span>
      </div>
      
      {isExpanded && group.children && (
        <div className="animate-fade-in">
          {group.children.map(child => (
            <GroupTreeItem 
              key={child.id} 
              group={child} 
              depth={depth + 1} 
              expanded={expanded} 
              selected={selected}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CreateLedgerDrawer: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (ledger: Omit<Ledger, 'id'>) => void;
  selectedGroup: string;
}> = ({ isOpen, onClose, onSubmit, selectedGroup }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    groupId: selectedGroup || '',
    openingBalance: 0,
    balanceType: 'Dr' as 'Dr' | 'Cr',
    gstApplicable: false,
    hsn: '',
    taxRate: 0
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Update groupId if selectedGroup prop changes
  React.useEffect(() => {
    if (selectedGroup) {
      setFormData(prev => ({ ...prev, groupId: selectedGroup }));
    }
  }, [selectedGroup]);

  const flattenedGroups = useMemo(() => getFlattenedGroups(ACCOUNT_GROUPS), []);

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = "Ledger Name is required";
    if (!formData.groupId) newErrors.groupId = "Parent Group is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        name: '',
        code: '',
        groupId: selectedGroup || '',
        openingBalance: 0,
        balanceType: 'Dr',
        gstApplicable: false,
        hsn: '',
        taxRate: 0
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Ledger</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ledger Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className={`w-full bg-gray-50 dark:bg-gray-800 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              placeholder="e.g., Office Expenses"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ledger Code</label>
              <input 
                type="text" 
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                placeholder="e.g., EXP-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Group <span className="text-red-500">*</span></label>
              <select 
                value={formData.groupId}
                onChange={e => setFormData({...formData, groupId: e.target.value})}
                className={`w-full bg-gray-50 dark:bg-gray-800 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white ${errors.groupId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              >
                <option value="">Select Group</option>
                {flattenedGroups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              {errors.groupId && <p className="text-xs text-red-500 mt-1">{errors.groupId}</p>}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Opening Balance</label>
            <div className="flex space-x-2">
              <input 
                type="number" 
                value={formData.openingBalance}
                onChange={e => setFormData({...formData, openingBalance: parseFloat(e.target.value) || 0})}
                className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white text-right"
              />
              <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, balanceType: 'Dr'})}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${formData.balanceType === 'Dr' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  Dr
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, balanceType: 'Cr'})}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${formData.balanceType === 'Cr' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  Cr
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-900 dark:text-white">GST Applicable</span>
              <button 
                onClick={() => setFormData({...formData, gstApplicable: !formData.gstApplicable})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.gstApplicable ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.gstApplicable ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {formData.gstApplicable && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HSN/SAC Code</label>
                  <input 
                    type="text" 
                    value={formData.hsn}
                    onChange={e => setFormData({...formData, hsn: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tax Rate (%)</label>
                  <select 
                    value={formData.taxRate}
                    onChange={e => setFormData({...formData, taxRate: parseFloat(e.target.value)})}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end space-x-3">
          <button onClick={onClose} className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors">
            Save Ledger
          </button>
        </div>
      </div>
    </>
  );
};

// --- Main Component ---

const Accounting: React.FC<AccountingProps> = ({ globalAction, resetGlobalAction }) => {
  const [activeTab, setActiveTab] = useState<'chart-of-accounts' | 'journal-vouchers' | 'bank-reconciliation'>('chart-of-accounts');
  const [ledgers, setLedgers] = useState<Ledger[]>(MOCK_LEDGERS);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['assets']));
  const [selectedGroup, setSelectedGroup] = useState<string>('assets');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // For triggering new journal voucher
  const [journalInitialMode, setJournalInitialMode] = useState<'list' | 'create'>('list');

  useEffect(() => {
    if (globalAction === 'new-journal') {
        setActiveTab('journal-vouchers');
        setJournalInitialMode('create');
        if (resetGlobalAction) resetGlobalAction();
    }
  }, [globalAction, resetGlobalAction]);

  // Handlers
  const toggleGroup = (id: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedGroups(newExpanded);
  };

  const handleCreateLedger = (ledgerData: Omit<Ledger, 'id'>) => {
    const newLedger: Ledger = {
      ...ledgerData,
      id: Date.now().toString()
    };
    setLedgers([...ledgers, newLedger]);
  };

  const handleDeleteLedger = (id: string) => {
    if (confirm('Are you sure you want to delete this ledger?')) {
      setLedgers(ledgers.filter(l => l.id !== id));
    }
  };

  // Filter logic
  const filteredLedgers = useMemo(() => {
    // Get all group IDs relevant to selection (recursive)
    const relevantGroupIds = getAllChildGroupIds(ACCOUNT_GROUPS, selectedGroup);
    
    return ledgers.filter(ledger => {
      // Check group membership
      const isInGroup = relevantGroupIds.includes(ledger.groupId);
      // Check search query
      const matchesSearch = 
        ledger.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        ledger.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      return isInGroup && matchesSearch;
    });
  }, [ledgers, selectedGroup, searchQuery]);

  // Find current group name for display
  const selectedGroupName = useMemo(() => {
    const findName = (groups: AccountGroup[]): string => {
      for (const g of groups) {
        if (g.id === selectedGroup) return g.name;
        if (g.children) {
          const found = findName(g.children);
          if (found) return found;
        }
      }
      return 'Unknown Group';
    };
    return findName(ACCOUNT_GROUPS);
  }, [selectedGroup]);

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      
      {/* Top Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-1">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight px-1">Accounting & Ledger</h1>
            <div className="flex space-x-6 mt-4 overflow-x-auto no-scrollbar">
                <button 
                    onClick={() => setActiveTab('chart-of-accounts')}
                    className={`pb-3 text-sm font-medium transition-colors relative flex items-center whitespace-nowrap ${activeTab === 'chart-of-accounts' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <LayoutList size={16} className="mr-1.5" />
                    Chart of Accounts
                    {activeTab === 'chart-of-accounts' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>}
                </button>
                <button 
                    onClick={() => setActiveTab('journal-vouchers')}
                    className={`pb-3 text-sm font-medium transition-colors relative flex items-center whitespace-nowrap ${activeTab === 'journal-vouchers' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <FileText size={16} className="mr-1.5" />
                    Journal Vouchers
                    {activeTab === 'journal-vouchers' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>}
                </button>
                <button 
                    onClick={() => setActiveTab('bank-reconciliation')}
                    className={`pb-3 text-sm font-medium transition-colors relative flex items-center whitespace-nowrap ${activeTab === 'bank-reconciliation' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <Landmark size={16} className="mr-1.5" />
                    Bank Reconciliation
                    {activeTab === 'bank-reconciliation' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>}
                </button>
            </div>
        </div>

        {activeTab === 'chart-of-accounts' && (
            <button 
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-all mb-2 whitespace-nowrap"
            >
                <Plus size={18} className="mr-2" />
                Create New Ledger
            </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'journal-vouchers' ? (
        <JournalVouchers initialMode={journalInitialMode} />
      ) : activeTab === 'bank-reconciliation' ? (
        <BankReconciliation />
      ) : (
        /* Chart of Accounts Content */
        <>
          <div className="flex flex-col lg:flex-row h-full gap-6 overflow-hidden">
            
            {/* Left Panel: Tree View */}
            <div className="w-full lg:w-1/4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col min-h-[400px]">
               <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <Briefcase size={16} className="mr-2 text-gray-500" />
                    Groups
                  </h3>
               </div>
               <div className="flex-1 overflow-y-auto p-2">
                  {ACCOUNT_GROUPS.map(group => (
                    <GroupTreeItem 
                      key={group.id}
                      group={group}
                      depth={0}
                      expanded={expandedGroups}
                      selected={selectedGroup}
                      onToggle={toggleGroup}
                      onSelect={setSelectedGroup}
                    />
                  ))}
               </div>
            </div>

            {/* Right Panel: Ledger List */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden min-h-[400px]">
               
               {/* Toolbar */}
               <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900/30">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center">
                     <FolderOpen size={20} className="mr-2 text-primary-500" />
                     {selectedGroupName}
                     <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                       {filteredLedgers.length}
                     </span>
                  </h3>
                  <div className="relative w-full sm:w-64">
                     <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input 
                        type="text"
                        placeholder="Search ledgers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                     />
                  </div>
               </div>

               {/* Table */}
               <div className="flex-1 overflow-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3">Ledger Name</th>
                        <th className="px-6 py-3">Code</th>
                        <th className="px-6 py-3 text-right">Opening Balance</th>
                        <th className="px-6 py-3 text-center">Type</th>
                        <th className="px-6 py-3 text-center">Status</th>
                        <th className="px-6 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                      {filteredLedgers.length > 0 ? (
                        filteredLedgers.map(ledger => (
                          <tr key={ledger.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{ledger.name}</td>
                            <td className="px-6 py-4 text-gray-500">{ledger.code || '-'}</td>
                            <td className="px-6 py-4 text-right font-medium">
                               {ledger.openingBalance.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-block w-8 py-0.5 rounded text-xs font-bold ${ledger.balanceType === 'Dr' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                {ledger.balanceType}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                               {ledger.gstApplicable && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                                     GST: {ledger.taxRate}%
                                  </span>
                               )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-primary-600 transition-colors" title="Edit">
                                  <Edit size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteLedger(ledger.id)}
                                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-red-600 transition-colors" 
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                             <div className="flex flex-col items-center justify-center">
                                 <BookOpen size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
                                 <p>No ledgers found in this group.</p>
                                 <button 
                                    onClick={() => setIsDrawerOpen(true)}
                                    className="mt-2 text-primary-600 hover:underline text-sm font-medium"
                                 >
                                   Create new ledger
                                 </button>
                             </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                 </table>
               </div>
            </div>

            <CreateLedgerDrawer 
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onSubmit={handleCreateLedger}
                selectedGroup={selectedGroup}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Accounting;
