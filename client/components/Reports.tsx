
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    FileBarChart,
    TrendingUp,
    ArrowDownRight,
    ArrowUpRight,
    Download,
    ChevronDown,
    ChevronRight,
    Search,
    Printer,
    BarChart3,
    FileText,
    ArrowLeft,
    Sparkles,
    Scale,
    Clock,
    Package,
    BookOpen,
    Archive,
    Table,
    ArrowRight,
    CheckCircle,
    AlertTriangle,
    FileSpreadsheet,
    ToggleLeft,
    ToggleRight,
    TrendingDown,
    Briefcase,
    Calendar as CalendarIcon
} from 'lucide-react';
import AiExplanationModal from './AiExplanationModal';

// --- Types ---

type ReportType = 'pnl' | 'balance-sheet' | 'cash-flow' | 'trial-balance' | 'ageing' | 'inventory-val' | 'gst-summary' | 'ledger-reports' | 'download-center';

interface ReportCard {
    id: ReportType;
    name: string;
    category: 'Financial' | 'Accounting' | 'Inventory' | 'Tax';
    description: string;
    icon: React.ElementType;
    colorClass: string;
}

interface AgeingItem {
    id: string;
    partyName: string;
    invoiceNo: string;
    invoiceDate: string;
    dueDate: string;
    amount: number;
    type: 'Receivable' | 'Payable';
}

interface InventoryValuationItem {
    id: string;
    name: string;
    code: string;
    group: string;
    qty: number;
    unit: string;
    rate: number;
}

interface LedgerAccountOption {
    id: string;
    name: string;
    group: string;
}

interface LedgerTransaction {
    id: string;
    date: string;
    voucherType: 'Invoice' | 'Payment' | 'Receipt' | 'Journal' | 'Contra';
    voucherNo: string;
    particulars: string;
    debit: number;
    credit: number;
}

// --- Mock Data ---

const ALL_REPORTS: ReportCard[] = [
    {
        id: 'pnl',
        name: 'Profit & Loss',
        category: 'Financial',
        description: 'Analyze financial performance, revenue, expenses, and net profit trends.',
        icon: TrendingUp,
        colorClass: 'text-green-600 bg-green-50 dark:bg-green-900/20'
    },
    {
        id: 'balance-sheet',
        name: 'Balance Sheet',
        category: 'Financial',
        description: 'Snapshot of assets, liabilities, and equity at a specific point in time.',
        icon: Scale,
        colorClass: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
    },
    {
        id: 'cash-flow',
        name: 'Cash Flow Statement',
        category: 'Financial',
        description: 'Track inflows and outflows of cash from operating, investing, and financing.',
        icon: ArrowDownRight,
        colorClass: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'
    },
    {
        id: 'trial-balance',
        name: 'Trial Balance',
        category: 'Accounting',
        description: 'Summary of all ledger balances to ensure debits equal credits.',
        icon: Table,
        colorClass: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
    },
    {
        id: 'ledger-reports',
        name: 'Ledger Reports',
        category: 'Accounting',
        description: 'Detailed transaction history for any specific ledger account.',
        icon: BookOpen,
        colorClass: 'text-gray-600 bg-gray-100 dark:bg-gray-700'
    },
    {
        id: 'ageing',
        name: 'Ageing Reports',
        category: 'Accounting',
        description: 'Analysis of accounts receivable and payable by overdue duration.',
        icon: Clock,
        colorClass: 'text-red-600 bg-red-50 dark:bg-red-900/20'
    },
    {
        id: 'inventory-val',
        name: 'Inventory Valuation',
        category: 'Inventory',
        description: 'Value of stock in hand based on FIFO/Weighted Average methods.',
        icon: Package,
        colorClass: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
    },
    {
        id: 'gst-summary',
        name: 'GST Summary',
        category: 'Tax',
        description: 'Consolidated view of output tax, input tax credit, and tax payable.',
        icon: FileText,
        colorClass: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20'
    }
];

const PNL_DATA = {
    income: [
        {
            id: '1', name: 'Sales Accounts', amount: 4500000, children: [
                { name: 'Sales - Hardware', amount: 2500000 },
                { name: 'Sales - Software', amount: 1500000 },
                { name: 'Sales - Services', amount: 500000 },
            ]
        },
        {
            id: '2', name: 'Direct Income', amount: 120000, children: [
                { name: 'Shipping Charges', amount: 120000 },
            ]
        },
        {
            id: '3', name: 'Indirect Income', amount: 50000, children: [
                { name: 'Discount Received', amount: 30000 },
                { name: 'Interest Income', amount: 20000 },
            ]
        },
    ],
    expenses: [
        {
            id: '4', name: 'Purchase Accounts', amount: 2800000, children: [
                { name: 'Purchase - Local', amount: 2000000 },
                { name: 'Purchase - Interstate', amount: 800000 },
            ]
        },
        {
            id: '5', name: 'Direct Expenses', amount: 150000, children: [
                { name: 'Freight Charges', amount: 100000 },
                { name: 'Labour Charges', amount: 50000 },
            ]
        },
        {
            id: '6', name: 'Indirect Expenses', amount: 850000, children: [
                { name: 'Salaries', amount: 500000 },
                { name: 'Rent', amount: 200000 },
                { name: 'Electricity', amount: 50000 },
                { name: 'Office Expenses', amount: 100000 },
            ]
        },
    ]
};

const BALANCE_SHEET_DATA = {
    assets: [
        {
            name: 'Current Assets', amount: 3550000, children: [
                { name: 'Cash in Hand', amount: 50000 },
                { name: 'Bank Accounts', amount: 1250000 },
                { name: 'Accounts Receivable', amount: 450000 },
                { name: 'Inventory', amount: 1800000 },
            ]
        },
        {
            name: 'Non-current Assets', amount: 650000, children: [
                { name: 'Fixed Assets', amount: 750000 },
                { name: 'Less: Depreciation', amount: -100000 },
            ]
        },
    ],
    liabilities: [
        {
            name: 'Current Liabilities', amount: 850000, children: [
                { name: 'Accounts Payable', amount: 350000 },
                { name: 'Short-term Loans', amount: 500000 },
            ]
        },
        {
            name: 'Long-term Liabilities', amount: 1500000, children: [
                { name: 'Secured Business Loan', amount: 1500000 },
            ]
        },
        {
            name: 'Equity', amount: 1850000, children: [
                { name: 'Capital Account', amount: 1000000 },
                { name: 'Retained Earnings', amount: 850000 },
            ]
        },
    ]
};

const CASH_FLOW_DATA = {
    operating: {
        netProfit: 1430000,
        adjustments: [
            { name: 'Add: Depreciation', amount: 100000 },
            { name: 'Add: Finance Costs', amount: 25000 },
        ],
        workingCapital: [
            { name: '(Increase)/Decrease in Receivables', amount: -45000 },
            { name: 'Increase/(Decrease) in Payables', amount: 30000 },
            { name: '(Increase)/Decrease in Inventory', amount: -120000 },
        ]
    },
    investing: [
        { name: 'Purchase of Fixed Assets', amount: -500000 },
        { name: 'Sale of Old Equipment', amount: 15000 },
    ],
    financing: [
        { name: 'Loan Received', amount: 1000000 },
        { name: 'Loan Repayment', amount: -200000 },
        { name: 'Interest Paid', amount: -25000 },
        { name: 'Drawings / Dividend', amount: -150000 },
    ],
    openingBalance: 350000
};

const TRIAL_BALANCE_DATA = [
    {
        id: 'capital',
        name: 'Capital Account',
        type: 'Group',
        debit: 0,
        credit: 1000000,
        children: [
            { id: 'share-capital', name: 'Share Capital', debit: 0, credit: 1000000 }
        ]
    },
    {
        id: 'loans',
        name: 'Loans (Liability)',
        type: 'Group',
        debit: 0,
        credit: 500000,
        children: [
            { id: 'secured-loans', name: 'Secured Loans', debit: 0, credit: 500000 }
        ]
    },
    {
        id: 'fixed-assets',
        name: 'Fixed Assets',
        type: 'Group',
        debit: 800000,
        credit: 0,
        children: [
            { id: 'furniture', name: 'Furniture & Fixtures', debit: 300000, credit: 0 },
            { id: 'machinery', name: 'Plant & Machinery', debit: 500000, credit: 0 }
        ]
    },
    {
        id: 'current-assets',
        name: 'Current Assets',
        type: 'Group',
        debit: 750000,
        credit: 0,
        children: [
            { id: 'bank', name: 'Bank Accounts', debit: 400000, credit: 0 },
            { id: 'cash', name: 'Cash-in-Hand', debit: 50000, credit: 0 },
            { id: 'debtors', name: 'Sundry Debtors', debit: 300000, credit: 0 }
        ]
    },
    {
        id: 'sales',
        name: 'Sales Accounts',
        type: 'Group',
        debit: 0,
        credit: 2500000,
        children: [
            { id: 'sales-local', name: 'Sales - Local', debit: 0, credit: 2500000 }
        ]
    },
    {
        id: 'purchase',
        name: 'Purchase Accounts',
        type: 'Group',
        debit: 1800000,
        credit: 0,
        children: [
            { id: 'purchase-local', name: 'Purchase - Local', debit: 1800000, credit: 0 }
        ]
    }
];

const MOCK_AGEING_DATA: AgeingItem[] = [
    { id: '1', partyName: 'Acme Traders India Pvt Ltd', invoiceNo: 'INV-2023-001', invoiceDate: '2023-12-25', dueDate: '2024-01-09', amount: 45000, type: 'Receivable' },
    { id: '2', partyName: 'Global Exports & Co.', invoiceNo: 'INV-2023-005', invoiceDate: '2023-11-15', dueDate: '2023-11-30', amount: 125000, type: 'Receivable' },
    { id: '3', partyName: 'Bharat Tech Solutions', invoiceNo: 'INV-2024-002', invoiceDate: '2024-01-10', dueDate: '2024-01-25', amount: 25000, type: 'Receivable' },
    { id: '4', partyName: 'Tech Solutions Ltd', invoiceNo: 'BILL-2023-992', invoiceDate: '2023-12-01', dueDate: '2023-12-15', amount: 12000, type: 'Payable' },
    { id: '5', partyName: 'Furniture Mart', invoiceNo: 'BILL-2023-775', invoiceDate: '2023-10-10', dueDate: '2023-10-25', amount: 85000, type: 'Payable' },
    { id: '6', partyName: 'Office Supplies Co.', invoiceNo: 'BILL-2024-012', invoiceDate: '2024-01-05', dueDate: '2024-01-20', amount: 5000, type: 'Payable' },
    { id: '7', partyName: 'Sharma Enterprises', invoiceNo: 'INV-2023-008', invoiceDate: '2023-09-01', dueDate: '2023-09-15', amount: 35000, type: 'Receivable' },
];

const MOCK_INVENTORY_VALUATION_DATA: InventoryValuationItem[] = [
    { id: '1', name: 'Dell XPS 15 Laptop', code: 'IT-LPT-001', group: 'Finished Goods', qty: 24, unit: 'Nos', rate: 95000 },
    { id: '2', name: 'Wireless Mouse', code: 'IT-ACC-005', group: 'Trading Items', qty: 0, unit: 'Nos', rate: 450 },
    { id: '3', name: 'Office Chair Ergo', code: 'FUR-CHR-002', group: 'Finished Goods', qty: 4, unit: 'Nos', rate: 6500 },
    { id: '4', name: 'Teak Wood Plank', code: 'RM-WD-101', group: 'Raw Material', qty: 1500, unit: 'SqFt', rate: 450 },
    { id: '5', name: 'Printer Paper (A4)', code: 'STAT-PPR-001', group: 'Consumables', qty: 45, unit: 'Ream', rate: 220 },
    { id: '6', name: 'Steel Rods 10mm', code: 'RM-STL-055', group: 'Raw Material', qty: 5000, unit: 'Kg', rate: 65 },
];

// GST Summary Mock Data
const MOCK_GST_SALES = [
    { id: '1', invoiceNo: 'INV-001', date: '2024-01-05', customer: 'Acme Traders', taxable: 100000, igst: 18000, cgst: 0, sgst: 0, total: 118000 },
    { id: '2', invoiceNo: 'INV-002', date: '2024-01-08', customer: 'Bharat Tech', taxable: 50000, igst: 0, cgst: 4500, sgst: 4500, total: 59000 },
    { id: '3', invoiceNo: 'INV-003', date: '2024-01-12', customer: 'Local Retailer', taxable: 25000, igst: 0, cgst: 2250, sgst: 2250, total: 29500 },
    { id: '4', invoiceNo: 'INV-005', date: '2024-01-20', customer: 'Global Exports', taxable: 200000, igst: 36000, cgst: 0, sgst: 0, total: 236000 },
];

const MOCK_GST_PURCHASES = [
    { id: '1', vendor: 'Office Supplies Co.', billNo: 'BILL-882', date: '2024-01-10', taxable: 12000, igst: 0, cgst: 1080, sgst: 1080, total: 14160 },
    { id: '2', vendor: 'Tech Solutions Ltd', billNo: 'BILL-901', date: '2024-01-12', taxable: 40000, igst: 7200, cgst: 0, sgst: 0, total: 47200 },
    { id: '3', vendor: 'Furniture Mart', billNo: 'BILL-756', date: '2024-01-05', taxable: 80000, igst: 0, cgst: 7200, sgst: 7200, total: 94400 },
];

const MOCK_GST_STATS = {
    liability: { igst: 54000, cgst: 6750, sgst: 6750 },
    itc: { igst: 7200, cgst: 8280, sgst: 8280 },
};

// Mock Ledger Data
const MOCK_LEDGER_ACCOUNTS: LedgerAccountOption[] = [
    { id: '1', name: 'Acme Traders India Pvt Ltd', group: 'Sundry Debtors' },
    { id: '2', name: 'HDFC Bank Account', group: 'Bank Accounts' },
    { id: '3', name: 'Sales Account', group: 'Direct Income' },
    { id: '4', name: 'Office Rent', group: 'Indirect Expenses' },
    { id: '5', name: 'Tech Solutions Ltd', group: 'Sundry Creditors' },
];

const MOCK_LEDGER_ENTRIES: LedgerTransaction[] = [
    { id: '1', date: '2024-01-05', voucherType: 'Invoice', voucherNo: 'INV-001', particulars: 'To Sales A/c', debit: 118000, credit: 0 },
    { id: '2', date: '2024-01-10', voucherType: 'Receipt', voucherNo: 'RCPT-005', particulars: 'By HDFC Bank', debit: 0, credit: 50000 },
    { id: '3', date: '2024-01-25', voucherType: 'Invoice', voucherNo: 'INV-008', particulars: 'To Sales A/c', debit: 25000, credit: 0 },
    { id: '4', date: '2024-01-28', voucherType: 'Journal', voucherNo: 'JV-002', particulars: 'By Discount Allowed', debit: 0, credit: 1500 },
];

// --- Helper Components ---

const PnlRow: React.FC<{
    item: any;
    level: number;
    totalRevenue: number;
    comparisonMode?: boolean;
    type?: 'income' | 'expense';
}> = ({ item, level, totalRevenue, comparisonMode, type = 'income' }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = item.children && item.children.length > 0;
    const percent = totalRevenue > 0 ? (item.amount / totalRevenue) * 100 : 0;

    // Comparison Logic (Mock)
    const prevAmount = Math.round(item.amount * 0.88); // Mock previous year
    const change = item.amount - prevAmount;
    const percentChange = prevAmount !== 0 ? (change / prevAmount) * 100 : 0;

    // Color Logic:
    // For Income: Increase (+) is Green, Decrease (-) is Red
    // For Expense: Decrease (-) is Green (good), Increase (+) is Red (bad)
    const isPositiveImprovement = type === 'income' ? change >= 0 : change <= 0;
    const colorClass = isPositiveImprovement ? 'text-green-600' : 'text-red-600';

    return (
        <>
            <div
                className={`
          flex justify-between items-center py-2 px-4 border-b border-gray-100 dark:border-gray-800 transition-colors 
          ${level === 0 ? 'bg-gray-50/50 dark:bg-gray-800/30 font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 text-sm'}
        `}
                onClick={() => hasChildren && setExpanded(!expanded)}
            >
                <div className="flex items-center flex-1 cursor-pointer overflow-hidden" style={{ paddingLeft: `${level * 24}px` }}>
                    <div className="w-5 flex-shrink-0 text-gray-400">
                        {hasChildren && (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                    </div>
                    <span className="truncate">{item.name}</span>
                </div>

                <div className={`flex items-center justify-end ${comparisonMode ? 'w-[28rem] gap-4' : 'w-48 gap-8'}`}>
                    {!comparisonMode && (
                        <div className="text-xs text-gray-400 w-12 text-right">
                            {percent.toFixed(1)}%
                        </div>
                    )}

                    {comparisonMode && (
                        <>
                            <div className="font-mono w-24 text-right text-gray-500 text-xs sm:text-sm">
                                {prevAmount.toLocaleString()}
                            </div>
                            <div className={`font-mono w-24 text-right text-xs sm:text-sm font-medium ${colorClass}`}>
                                {change > 0 ? '+' : ''}{percentChange.toFixed(1)}%
                            </div>
                        </>
                    )}

                    <div className="font-mono font-medium w-24 text-right text-sm">
                        {item.amount.toLocaleString()}
                    </div>
                </div>
            </div>

            {expanded && hasChildren && (
                <div className="animate-fade-in">
                    {item.children.map((child: any, idx: number) => (
                        <PnlRow
                            key={idx}
                            item={child}
                            level={level + 1}
                            totalRevenue={totalRevenue}
                            comparisonMode={comparisonMode}
                            type={type}
                        />
                    ))}
                </div>
            )}
        </>
    );
};

const BalanceSheetRow: React.FC<{
    item: any;
    level: number;
    comparisonMode?: boolean;
    type?: 'asset' | 'liability';
}> = ({ item, level, comparisonMode, type = 'asset' }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = item.children && item.children.length > 0;

    // Comparison Logic (Mock)
    const prevAmount = Math.round(item.amount * 0.92); // Mock previous
    const change = item.amount - prevAmount;
    const percentChange = prevAmount !== 0 ? (change / prevAmount) * 100 : 0;

    // Color Logic
    // Asset: Increase = Green
    // Liability: Decrease = Green, Increase = Red (generally for debt)
    // Equity: Increase = Green
    let isPositiveImprovement = change >= 0;
    if (type === 'liability' && !item.name.includes('Equity') && !item.name.includes('Capital')) {
        isPositiveImprovement = change <= 0;
    }

    const colorClass = isPositiveImprovement ? 'text-green-600' : 'text-red-600';

    return (
        <>
            <div
                className={`
          flex justify-between items-center py-2 px-3 border-b border-gray-100 dark:border-gray-800 transition-colors cursor-pointer
          ${level === 0 ? 'bg-gray-50 dark:bg-gray-800/50 font-semibold text-gray-900 dark:text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30 text-gray-700 dark:text-gray-300 text-sm'}
        `}
                onClick={() => hasChildren && setExpanded(!expanded)}
            >
                <div className="flex items-center flex-1 overflow-hidden" style={{ paddingLeft: `${level * 16}px` }}>
                    <div className="w-5 flex-shrink-0 text-gray-400">
                        {hasChildren && (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                    </div>
                    <span className="truncate">{item.name}</span>
                </div>

                <div className={`flex items-center justify-end ${comparisonMode ? 'gap-2' : ''}`}>
                    {comparisonMode && (
                        <>
                            <div className="font-mono text-right text-gray-500 text-[10px] sm:text-xs w-16 hidden sm:block">
                                {prevAmount < 0 ? `(${Math.abs(prevAmount).toLocaleString()})` : prevAmount.toLocaleString()}
                            </div>
                            <div className={`font-mono text-right text-[10px] sm:text-xs font-medium w-12 ${colorClass}`}>
                                {percentChange.toFixed(0)}%
                            </div>
                        </>
                    )}
                    <div className="font-mono font-medium text-right text-sm w-20">
                        {item.amount < 0 ? `(${Math.abs(item.amount).toLocaleString()})` : item.amount.toLocaleString()}
                    </div>
                </div>
            </div>

            {expanded && hasChildren && (
                <div className="animate-fade-in">
                    {item.children.map((child: any, idx: number) => (
                        <BalanceSheetRow
                            key={idx}
                            item={child}
                            level={level + 1}
                            comparisonMode={comparisonMode}
                            type={type}
                        />
                    ))}
                </div>
            )}
        </>
    );
};

const CashFlowRow: React.FC<{ name: string; amount: number; isHeader?: boolean; isTotal?: boolean }> = ({ name, amount, isHeader, isTotal }) => {
    const isNegative = amount < 0;
    return (
        <div className={`flex justify-between items-center py-2 px-4 border-b border-gray-100 dark:border-gray-800 ${isHeader ? 'font-bold bg-gray-50/50 dark:bg-gray-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-900/10'} ${isTotal ? 'font-bold border-t-2 border-t-gray-200 dark:border-t-gray-700 bg-gray-50 dark:bg-gray-800/50' : ''}`}>
            <span className={`text-sm ${isHeader || isTotal ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 pl-4'}`}>{name}</span>
            <span className={`font-mono ${isTotal ? 'text-base' : 'text-sm'} ${isTotal && amount < 0 ? 'text-red-600 dark:text-red-400' : isTotal ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                {isNegative ? `(${Math.abs(amount).toLocaleString()})` : amount.toLocaleString()}
            </span>
        </div>
    );
};

const TrialBalanceRow: React.FC<{ item: any; level: number }> = ({ item, level }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = item.children && item.children.length > 0;

    return (
        <>
            <div
                className={`
          flex justify-between items-center py-2 px-4 border-b border-gray-100 dark:border-gray-800 transition-colors
          ${level === 0 ? 'bg-gray-50/50 dark:bg-gray-800/30 font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 text-sm'}
        `}
                onClick={() => hasChildren && setExpanded(!expanded)}
            >
                <div className="flex items-center flex-1" style={{ paddingLeft: `${level * 24}px` }}>
                    <div className="w-5 flex-shrink-0 text-gray-400">
                        {hasChildren && (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                    </div>
                    <span>{item.name}</span>
                </div>

                <div className="flex items-center gap-8 w-64 justify-end">
                    <div className="font-mono font-medium w-32 text-right">
                        {item.debit > 0 ? item.debit.toLocaleString() : '-'}
                    </div>
                    <div className="font-mono font-medium w-32 text-right">
                        {item.credit > 0 ? item.credit.toLocaleString() : '-'}
                    </div>
                </div>
            </div>

            {expanded && hasChildren && (
                <div className="animate-fade-in">
                    {item.children.map((child: any, idx: number) => (
                        <TrialBalanceRow key={idx} item={child} level={level + 1} />
                    ))}
                </div>
            )}
        </>
    );
};

// --- Main Component ---

const Reports: React.FC = () => {
    const [activeReport, setActiveReport] = useState<ReportType | null>(null);
    const [dateRange, setDateRange] = useState('This Financial Year');
    const [asOnDate, setAsOnDate] = useState(new Date().toISOString().split('T')[0]);
    const [showAiModal, setShowAiModal] = useState(false);
    const [comparisonMode, setComparisonMode] = useState(false);
    const [tbSearch, setTbSearch] = useState('');
    const [tbGroupFilter, setTbGroupFilter] = useState('All');

    // Ageing State
    const [ageingTab, setAgeingTab] = useState<'receivables' | 'payables'>('receivables');
    const [selectedParty, setSelectedParty] = useState('All');
    const [bucketFilter, setBucketFilter] = useState('All');

    // Inventory Val State
    const [ivSearch, setIvSearch] = useState('');
    const [ivGroupFilter, setIvGroupFilter] = useState('All');

    // Ledger Report State
    const [selectedLedgerId, setSelectedLedgerId] = useState<string>('1');
    const [isLedgerDropdownOpen, setIsLedgerDropdownOpen] = useState(false);
    const [ledgerSearchTerm, setLedgerSearchTerm] = useState('');

    // --- Views ---

    const renderPnL = () => {
        const totalRevenue = PNL_DATA.income.reduce((acc, item) => acc + item.amount, 0);
        const totalExpenses = PNL_DATA.expenses.reduce((acc, item) => acc + item.amount, 0);
        const netProfit = totalRevenue - totalExpenses;

        return (
            <div className="flex flex-col h-full animate-fade-in pb-20">
                {/* Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setActiveReport(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Profit & Loss Statement</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Financial Performance Report</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setComparisonMode(false)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${!comparisonMode ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                Standard
                            </button>
                            <button
                                onClick={() => setComparisonMode(true)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${comparisonMode ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                Comparative
                            </button>
                        </div>
                        <button onClick={() => setShowAiModal(true)} className="flex items-center px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors shadow-sm">
                            <Sparkles size={14} className="mr-1.5" /> Explain with AI
                        </button>
                        <button className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <Printer size={18} />
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 flex flex-col">
                    {/* Table Header */}
                    <div className="flex justify-between items-center py-3 px-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
                        <span>Particulars</span>
                        <div className={`flex justify-end ${comparisonMode ? 'w-[28rem] gap-4' : 'w-48 gap-8'}`}>
                            {comparisonMode ? (
                                <>
                                    <span className="w-24 text-right">Prev Period</span>
                                    <span className="w-24 text-right">Change</span>
                                    <span className="w-24 text-right">Current</span>
                                </>
                            ) : (
                                <>
                                    <span className="w-12 text-right">%</span>
                                    <span className="w-24 text-right">Amount</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {/* Income Section */}
                        <div className="bg-green-50/30 dark:bg-green-900/10 px-4 py-2 font-bold text-green-800 dark:text-green-400 text-sm">
                            Income
                        </div>
                        {PNL_DATA.income.map((item, index) => (
                            <PnlRow key={index} item={item} level={0} totalRevenue={totalRevenue} comparisonMode={comparisonMode} type="income" />
                        ))}
                        <div className="flex justify-between items-center py-3 px-4 bg-green-50/50 dark:bg-green-900/20 font-bold border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                            <span className="pl-6">Total Income</span>
                            <span className="w-48 text-right font-mono">{totalRevenue.toLocaleString()}</span>
                        </div>

                        {/* Expenses Section */}
                        <div className="bg-red-50/30 dark:bg-red-900/10 px-4 py-2 font-bold text-red-800 dark:text-red-400 text-sm border-t border-gray-200 dark:border-gray-700">
                            Expenses
                        </div>
                        {PNL_DATA.expenses.map((item, index) => (
                            <PnlRow key={index} item={item} level={0} totalRevenue={totalRevenue} comparisonMode={comparisonMode} type="expense" />
                        ))}
                        <div className="flex justify-between items-center py-3 px-4 bg-red-50/50 dark:bg-red-900/20 font-bold border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                            <span className="pl-6">Total Expenses</span>
                            <span className="w-48 text-right font-mono">{totalExpenses.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Net Profit Footer */}
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border-t border-primary-100 dark:border-primary-800 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-primary-800 dark:text-primary-300">Net Profit</h3>
                        <p className="text-2xl font-bold text-primary-700 dark:text-primary-400 font-mono">₹ {netProfit.toLocaleString()}</p>
                    </div>
                </div>

                <AiExplanationModal
                    isOpen={showAiModal}
                    onClose={() => setShowAiModal(false)}
                    title="Profit & Loss Statement"
                />
            </div>
        );
    };

    const renderBalanceSheet = () => {
        const totalAssets = BALANCE_SHEET_DATA.assets.reduce((acc, item) => acc + item.amount, 0);
        const totalLiabilities = BALANCE_SHEET_DATA.liabilities.reduce((acc, item) => acc + item.amount, 0);

        return (
            <div className="flex flex-col h-full animate-fade-in pb-20">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setActiveReport(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Balance Sheet</h1>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setComparisonMode(false)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${!comparisonMode ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                Standard
                            </button>
                            <button
                                onClick={() => setComparisonMode(true)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${comparisonMode ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                Comparative
                            </button>
                        </div>
                        <button onClick={() => setShowAiModal(true)} className="px-3 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg text-sm font-medium shadow-sm flex items-center">
                            <Sparkles size={16} className="mr-2" /> AI Insights
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
                    {/* Assets Side */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 uppercase text-sm">
                            Assets
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {BALANCE_SHEET_DATA.assets.map((item, i) => (
                                <BalanceSheetRow key={i} item={item} level={0} comparisonMode={comparisonMode} type="asset" />
                            ))}
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center font-bold">
                            <span className="text-gray-900 dark:text-white">Total Assets</span>
                            <span className="text-primary-600 dark:text-primary-400 text-lg">₹ {totalAssets.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Liabilities Side */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 uppercase text-sm">
                            Liabilities & Equity
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {BALANCE_SHEET_DATA.liabilities.map((item, i) => (
                                <BalanceSheetRow key={i} item={item} level={0} comparisonMode={comparisonMode} type="liability" />
                            ))}
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center font-bold">
                            <span className="text-gray-900 dark:text-white">Total Liabilities</span>
                            <span className="text-primary-600 dark:text-primary-400 text-lg">₹ {totalLiabilities.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <AiExplanationModal
                    isOpen={showAiModal}
                    onClose={() => setShowAiModal(false)}
                    title="Balance Sheet"
                />
            </div>
        );
    };

    const renderCashFlow = () => {
        const netOperating = CASH_FLOW_DATA.operating.netProfit
            + CASH_FLOW_DATA.operating.adjustments.reduce((sum, i) => sum + i.amount, 0)
            + CASH_FLOW_DATA.operating.workingCapital.reduce((sum, i) => sum + i.amount, 0);

        const netInvesting = CASH_FLOW_DATA.investing.reduce((sum, i) => sum + i.amount, 0);
        const netFinancing = CASH_FLOW_DATA.financing.reduce((sum, i) => sum + i.amount, 0);
        const netChange = netOperating + netInvesting + netFinancing;
        const closingBalance = CASH_FLOW_DATA.openingBalance + netChange;

        return (
            <div className="flex flex-col h-full animate-fade-in pb-20">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setActiveReport(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Cash Flow Statement</h1>
                    </div>
                    <button onClick={() => setShowAiModal(true)} className="px-3 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg text-sm font-medium shadow-sm flex items-center">
                        <Sparkles size={16} className="mr-2" /> Analysis
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 overflow-y-auto">
                    {/* Operating Activities */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 font-bold text-sm uppercase text-gray-700 dark:text-gray-300">Cash Flow from Operating Activities</div>
                        <CashFlowRow name="Net Profit Before Tax" amount={CASH_FLOW_DATA.operating.netProfit} />
                        {CASH_FLOW_DATA.operating.adjustments.map((item, i) => <CashFlowRow key={i} name={item.name} amount={item.amount} />)}
                        <div className="bg-gray-50/50 dark:bg-gray-800/30 px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Changes in Working Capital</div>
                        {CASH_FLOW_DATA.operating.workingCapital.map((item, i) => <CashFlowRow key={i} name={item.name} amount={item.amount} />)}
                        <CashFlowRow name="Net Cash from Operating Activities" amount={netOperating} isTotal />
                    </div>

                    {/* Investing Activities */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 font-bold text-sm uppercase text-gray-700 dark:text-gray-300">Cash Flow from Investing Activities</div>
                        {CASH_FLOW_DATA.investing.map((item, i) => <CashFlowRow key={i} name={item.name} amount={item.amount} />)}
                        <CashFlowRow name="Net Cash Used in Investing Activities" amount={netInvesting} isTotal />
                    </div>

                    {/* Financing Activities */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 font-bold text-sm uppercase text-gray-700 dark:text-gray-300">Cash Flow from Financing Activities</div>
                        {CASH_FLOW_DATA.financing.map((item, i) => <CashFlowRow key={i} name={item.name} amount={item.amount} />)}
                        <CashFlowRow name="Net Cash from Financing Activities" amount={netFinancing} isTotal />
                    </div>

                    {/* Summary */}
                    <div className="bg-primary-50 dark:bg-primary-900/20 p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Change in Cash</span>
                            <span className={`font-bold ${netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>{netChange.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Opening Cash Balance</span>
                            <span className="font-bold text-gray-900 dark:text-white">{CASH_FLOW_DATA.openingBalance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-primary-200 dark:border-primary-800">
                            <span className="text-base font-bold text-gray-900 dark:text-white">Closing Cash Balance</span>
                            <span className="text-xl font-bold text-primary-700 dark:text-primary-400">₹ {closingBalance.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <AiExplanationModal
                    isOpen={showAiModal}
                    onClose={() => setShowAiModal(false)}
                    title="Cash Flow Analysis"
                />
            </div>
        );
    };

    const renderTrialBalance = () => {
        const totalDebit = TRIAL_BALANCE_DATA.reduce((sum, item) => sum + (item.debit || 0), 0);
        const totalCredit = TRIAL_BALANCE_DATA.reduce((sum, item) => sum + (item.credit || 0), 0);

        const filteredTB = TRIAL_BALANCE_DATA.filter(item =>
            item.name.toLowerCase().includes(tbSearch.toLowerCase()) &&
            (tbGroupFilter === 'All' || item.type === tbGroupFilter)
        );

        return (
            <div className="flex flex-col h-full animate-fade-in pb-20">
                {/* Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setActiveReport(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Trial Balance</h1>
                    </div>
                    <div className="flex gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:w-64">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Ledgers..."
                                value={tbSearch}
                                onChange={(e) => setTbSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                            />
                        </div>
                        <button onClick={() => setShowAiModal(true)} className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <Sparkles size={18} />
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 flex flex-col">
                    <div className="flex justify-between items-center py-3 px-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
                        <span>Account Name</span>
                        <div className="flex items-center gap-8 w-64 justify-end">
                            <span className="w-32 text-right">Debit</span>
                            <span className="w-32 text-right">Credit</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredTB.map((item, i) => (
                            <TrialBalanceRow key={i} item={item} level={0} />
                        ))}
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white sticky bottom-0">
                        <span>Total</span>
                        <div className="flex items-center gap-8 w-64 justify-end">
                            <span className="w-32 text-right">{totalDebit.toLocaleString()}</span>
                            <span className="w-32 text-right">{totalCredit.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <AiExplanationModal
                    isOpen={showAiModal}
                    onClose={() => setShowAiModal(false)}
                    title="Trial Balance Summary"
                />
            </div>
        );
    };

    const renderAgeingReport = () => {
        const filteredAgeing = MOCK_AGEING_DATA.filter(item => {
            const isTypeMatch = ageingTab === 'receivables' ? item.type === 'Receivable' : item.type === 'Payable';
            const isPartyMatch = selectedParty === 'All' || item.partyName === selectedParty;
            // Mock Bucket Logic if needed
            return isTypeMatch && isPartyMatch;
        });

        const totalOutstanding = filteredAgeing.reduce((sum, item) => sum + item.amount, 0);

        return (
            <div className="flex flex-col h-full animate-fade-in pb-20">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setActiveReport(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ageing Analysis</h1>
                    </div>
                    <button onClick={() => setShowAiModal(true)} className="flex items-center px-3 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
                        <Sparkles size={16} className="mr-2" /> Insights
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 flex flex-col">
                    {/* Tabs & Filters */}
                    <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 gap-4">
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <button
                                onClick={() => setAgeingTab('receivables')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${ageingTab === 'receivables' ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                Receivables
                            </button>
                            <button
                                onClick={() => setAgeingTab('payables')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${ageingTab === 'payables' ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                Payables
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <select
                                value={selectedParty}
                                onChange={(e) => setSelectedParty(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white"
                            >
                                <option value="All">All Parties</option>
                                {Array.from(new Set(MOCK_AGEING_DATA.map(i => i.partyName))).map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <select className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white">
                                <option>0-30 Days</option>
                                <option>31-60 Days</option>
                                <option>61-90 Days</option>
                                <option>90+ Days</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3">Party Name</th>
                                    <th className="px-6 py-3">Ref No</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Due Date</th>
                                    <th className="px-6 py-3 text-right">Pending Amount</th>
                                    <th className="px-6 py-3 text-center">Age (Days)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                                {filteredAgeing.length > 0 ? filteredAgeing.map(item => {
                                    // Simple mock calculation for days
                                    const days = Math.floor((new Date().getTime() - new Date(item.dueDate).getTime()) / (1000 * 3600 * 24));
                                    const isOverdue = days > 0;
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.partyName}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.invoiceNo}</td>
                                            <td className="px-6 py-4">{item.invoiceDate}</td>
                                            <td className="px-6 py-4">{item.dueDate}</td>
                                            <td className="px-6 py-4 text-right font-bold">₹ {item.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${isOverdue ? (days > 60 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400') : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                    {isOverdue ? `${days} Days Overdue` : 'Not Due'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">No records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Total Outstanding</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">₹ {totalOutstanding.toLocaleString()}</span>
                    </div>
                </div>

                <AiExplanationModal
                    isOpen={showAiModal}
                    onClose={() => setShowAiModal(false)}
                    title="Ageing Analysis Report"
                />
            </div>
        );
    };

    const renderInventoryValuation = () => {
        const totalValuation = MOCK_INVENTORY_VALUATION_DATA.reduce((sum, item) => sum + (item.qty * item.rate), 0);

        const filteredInv = MOCK_INVENTORY_VALUATION_DATA.filter(item =>
            item.name.toLowerCase().includes(ivSearch.toLowerCase()) ||
            item.code.toLowerCase().includes(ivSearch.toLowerCase())
        );

        return (
            <div className="flex flex-col h-full animate-fade-in pb-20">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setActiveReport(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Inventory Valuation Summary</h1>
                    </div>
                    <div className="relative w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Items..."
                            value={ivSearch}
                            onChange={(e) => setIvSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3">Item Name</th>
                                    <th className="px-6 py-3">Code</th>
                                    <th className="px-6 py-3">Group</th>
                                    <th className="px-6 py-3 text-right">Qty</th>
                                    <th className="px-6 py-3 text-right">Valuation Rate</th>
                                    <th className="px-6 py-3 text-right">Stock Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                                {filteredInv.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.code}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-xs">{item.group}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium">{item.qty} {item.unit}</td>
                                        <td className="px-6 py-4 text-right text-gray-500">₹ {item.rate.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">₹ {(item.qty * item.rate).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Total Inventory Value</span>
                        <span className="text-xl font-bold text-primary-600 dark:text-primary-400">₹ {totalValuation.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderLedgerReport = () => {
        const selectedLedger = MOCK_LEDGER_ACCOUNTS.find(l => l.id === selectedLedgerId) || MOCK_LEDGER_ACCOUNTS[0];
        const openingBalance = 50000; // Mock Opening
        let runningBalance = openingBalance;
        const totalDebit = MOCK_LEDGER_ENTRIES.reduce((sum, txn) => sum + txn.debit, 0);
        const totalCredit = MOCK_LEDGER_ENTRIES.reduce((sum, txn) => sum + txn.credit, 0);
        const closingBalance = openingBalance + totalDebit - totalCredit;

        // Filter for dropdown
        const filteredLedgerOptions = MOCK_LEDGER_ACCOUNTS.filter(l => l.name.toLowerCase().includes(ledgerSearchTerm.toLowerCase()));

        return (
            <div className="flex flex-col h-full animate-fade-in pb-20">
                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setActiveReport(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ledger Report</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Detailed Account Statement</p>
                        </div>
                    </div>

                    <div className="flex gap-3 flex-wrap w-full lg:w-auto">
                        {/* Searchable Dropdown */}
                        <div className="relative min-w-[250px]">
                            <div
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 pl-3 pr-10 rounded-lg text-sm font-medium shadow-sm cursor-pointer flex items-center justify-between"
                                onClick={() => setIsLedgerDropdownOpen(!isLedgerDropdownOpen)}
                            >
                                <span>{selectedLedger?.name}</span>
                                <ChevronDown size={16} className="text-gray-400" />
                            </div>

                            {isLedgerDropdownOpen && (
                                <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-hidden flex flex-col">
                                    <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                                        <input
                                            type="text"
                                            placeholder="Search ledger..."
                                            className="w-full px-2 py-1 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-primary-500"
                                            autoFocus
                                            value={ledgerSearchTerm}
                                            onChange={(e) => setLedgerSearchTerm(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <div className="overflow-y-auto">
                                        {filteredLedgerOptions.map(option => (
                                            <div
                                                key={option.id}
                                                className={`px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between ${option.id === selectedLedgerId ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700' : 'text-gray-700 dark:text-gray-300'}`}
                                                onClick={() => { setSelectedLedgerId(option.id); setIsLedgerDropdownOpen(false); setLedgerSearchTerm(''); }}
                                            >
                                                <span>{option.name}</span>
                                                <span className="text-xs text-gray-400 ml-2">{option.group}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Date Range Button Mock */}
                        <button className="flex items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                            <CalendarIcon size={16} className="mr-2 text-gray-500" /> This Financial Year
                        </button>

                        <button onClick={() => setShowAiModal(true)} className="flex items-center px-3 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors shadow-sm">
                            <Sparkles size={16} className="mr-2" /> Explain
                        </button>
                        <button className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" title="Download CSV">
                            <Download size={18} />
                        </button>
                        <button className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" title="Print View">
                            <Printer size={18} />
                        </button>
                    </div>
                </div>

                {/* Header Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Ledger Name</p>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedLedger.name}</h2>
                        <p className="text-sm text-gray-500">{selectedLedger.group}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Opening Balance</p>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                            {openingBalance > 0 ? `${openingBalance.toLocaleString()} Dr` : `${Math.abs(openingBalance).toLocaleString()} Cr`}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Period Activity</p>
                        <div className="text-sm space-y-1">
                            <div className="flex justify-between"><span className="text-gray-500">Debit:</span> <span className="font-mono">{totalDebit.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Credit:</span> <span className="font-mono">{totalCredit.toLocaleString()}</span></div>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Closing Balance</p>
                        <p className={`text-xl font-bold ${closingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {closingBalance >= 0 ? `${closingBalance.toLocaleString()} Dr` : `${Math.abs(closingBalance).toLocaleString()} Cr`}
                        </p>
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 flex flex-col">
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Voucher Type</th>
                                    <th className="px-6 py-3">Vch No.</th>
                                    <th className="px-6 py-3">Particulars</th>
                                    <th className="px-6 py-3 text-right">Debit (₹)</th>
                                    <th className="px-6 py-3 text-right">Credit (₹)</th>
                                    <th className="px-6 py-3 text-right">Balance (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                                {/* Opening Balance Row */}
                                <tr className="bg-gray-50/50 dark:bg-gray-900/20 font-medium">
                                    <td className="px-6 py-3 text-gray-500">01-Apr-2023</td>
                                    <td className="px-6 py-3">-</td>
                                    <td className="px-6 py-3">-</td>
                                    <td className="px-6 py-3 font-bold">Opening Balance</td>
                                    <td className="px-6 py-3 text-right">-</td>
                                    <td className="px-6 py-3 text-right">-</td>
                                    <td className="px-6 py-3 text-right font-bold">{openingBalance.toLocaleString()} Dr</td>
                                </tr>

                                {MOCK_LEDGER_ENTRIES.map((txn) => {
                                    runningBalance = runningBalance + txn.debit - txn.credit;
                                    const balanceType = runningBalance >= 0 ? 'Dr' : 'Cr';
                                    return (
                                        <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group even:bg-gray-50/30 dark:even:bg-gray-800/20">
                                            <td className="px-6 py-3">{txn.date}</td>
                                            <td className="px-6 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${txn.voucherType === 'Receipt' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400' :
                                                    txn.voucherType === 'Payment' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400' :
                                                        'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {txn.voucherType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 font-mono text-xs text-gray-500">{txn.voucherNo}</td>
                                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{txn.particulars}</td>
                                            <td className="px-6 py-3 text-right">{txn.debit ? txn.debit.toLocaleString() : '-'}</td>
                                            <td className="px-6 py-3 text-right">{txn.credit ? txn.credit.toLocaleString() : '-'}</td>
                                            <td className="px-6 py-3 text-right font-mono font-medium">
                                                {Math.abs(runningBalance).toLocaleString()} <span className="text-xs text-gray-400 ml-1">{balanceType}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Totals */}
                    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 sticky bottom-0 z-20 flex justify-end gap-12 shadow-lg">
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase">Total Debit</p>
                            <p className="font-bold text-gray-900 dark:text-white">₹ {totalDebit.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase">Total Credit</p>
                            <p className="font-bold text-gray-900 dark:text-white">₹ {totalCredit.toLocaleString()}</p>
                        </div>
                        <div className="text-right border-l border-gray-200 dark:border-gray-700 pl-6">
                            <p className="text-xs text-gray-500 uppercase">Closing Balance</p>
                            <p className={`font-bold text-lg ${closingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {Math.abs(closingBalance).toLocaleString()} {closingBalance >= 0 ? 'Dr' : 'Cr'}
                            </p>
                        </div>
                    </div>
                </div>

                <AiExplanationModal
                    isOpen={showAiModal}
                    onClose={() => setShowAiModal(false)}
                    title={`Ledger Report: ${selectedLedger.name}`}
                />
            </div>
        );
    };

    const renderReportsHub = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Reports Hub</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive financial and operational analytics</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-sm"
                        >
                            <option>This Month</option>
                            <option>Last Month</option>
                            <option>This Quarter</option>
                            <option>This Financial Year</option>
                            <option>Custom Range</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4 flex-wrap">
                <button
                    onClick={() => setActiveReport('download-center')}
                    className="flex items-center px-4 py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Archive size={16} className="mr-2" /> Open Download Center
                </button>
                <button
                    onClick={() => setShowAiModal(true)}
                    className="flex items-center px-4 py-2.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors shadow-sm"
                >
                    <Sparkles size={16} className="mr-2" /> Explain All Reports with AI
                </button>
            </div>

            {/* Report Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ALL_REPORTS.filter(r => r.id !== 'download-center').map((report) => (
                    <div
                        key={report.id}
                        onClick={() => setActiveReport(report.id)}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all group flex flex-col h-full cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${report.colorClass}`}>
                                <report.icon size={24} />
                            </div>
                            <span className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                {report.category}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {report.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1">
                            {report.description}
                        </p>
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <span className="text-xs text-gray-400">Last updated: Today</span>
                            <button
                                className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <AiExplanationModal
                isOpen={showAiModal}
                onClose={() => setShowAiModal(false)}
                title="All Financial Reports"
            />
        </div>
    );

    const renderGstSummary = () => {
        const totalLiability = MOCK_GST_STATS.liability.igst + MOCK_GST_STATS.liability.cgst + MOCK_GST_STATS.liability.sgst;
        const totalItc = MOCK_GST_STATS.itc.igst + MOCK_GST_STATS.itc.cgst + MOCK_GST_STATS.itc.sgst;
        const netPayable = Math.max(0, totalLiability - totalItc);

        return (
            <div className="flex flex-col h-full animate-fade-in pb-20">
                {/* Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setActiveReport(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">GST Summary</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Overview of Liability and ITC</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-1.5 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
                            <option>This Month</option>
                            <option>Last Month</option>
                            <option>This Quarter</option>
                            <option>Custom Range</option>
                        </select>
                        <button onClick={() => setShowAiModal(true)} className="flex items-center px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors shadow-sm">
                            <Sparkles size={14} className="mr-1.5" /> Explain with AI
                        </button>
                        <button className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" title="Download CSV">
                            <Download size={18} />
                        </button>
                    </div>
                </div>

                {/* Section 1: Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/50">
                        <p className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wide mb-2">Total Outward Liability</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">₹ {totalLiability.toLocaleString()}</p>
                        <div className="mt-2 text-xs text-red-700 dark:text-red-400 space-y-0.5">
                            <div className="flex justify-between"><span>IGST:</span><span>{MOCK_GST_STATS.liability.igst.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>CGST:</span><span>{MOCK_GST_STATS.liability.cgst.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>SGST:</span><span>{MOCK_GST_STATS.liability.sgst.toLocaleString()}</span></div>
                        </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800/50">
                        <p className="text-xs font-bold text-green-800 dark:text-green-300 uppercase tracking-wide mb-2">Total Input Tax Credit</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">₹ {totalItc.toLocaleString()}</p>
                        <div className="mt-2 text-xs text-green-700 dark:text-green-400 space-y-0.5">
                            <div className="flex justify-between"><span>IGST:</span><span>{MOCK_GST_STATS.itc.igst.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>CGST:</span><span>{MOCK_GST_STATS.itc.cgst.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>SGST:</span><span>{MOCK_GST_STATS.itc.sgst.toLocaleString()}</span></div>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 flex flex-col justify-between">
                        <div>
                            <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide mb-2">Net GST Payable</p>
                            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">₹ {netPayable.toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Liability - ITC</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Filing Status</p>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">GSTR-1</span>
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Filed</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">GSTR-3B</span>
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">Pending</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Section 2: Outward Supply */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 font-bold text-gray-800 dark:text-gray-200 text-sm uppercase">Outward Supplies (Sales)</div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 dark:bg-gray-900/20 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-3 py-2">Inv No</th>
                                        <th className="px-3 py-2">Date</th>
                                        <th className="px-3 py-2">Customer</th>
                                        <th className="px-3 py-2 text-right">Taxable</th>
                                        <th className="px-3 py-2 text-right">Total Tax</th>
                                        <th className="px-3 py-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {MOCK_GST_SALES.map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/10">
                                            <td className="px-3 py-2 font-mono text-gray-600 dark:text-gray-400">{row.invoiceNo}</td>
                                            <td className="px-3 py-2 text-gray-500">{row.date}</td>
                                            <td className="px-3 py-2 font-medium text-gray-900 dark:text-white truncate max-w-[100px]" title={row.customer}>{row.customer}</td>
                                            <td className="px-3 py-2 text-right">{row.taxable.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right">{(row.igst + row.cgst + row.sgst).toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right font-medium">{row.total.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section 3: Inward Supply */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 font-bold text-gray-800 dark:text-gray-200 text-sm uppercase">Inward Supplies (Purchases)</div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 dark:bg-gray-900/20 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-3 py-2">Vendor</th>
                                        <th className="px-3 py-2">Bill No</th>
                                        <th className="px-3 py-2">Date</th>
                                        <th className="px-3 py-2 text-right">Taxable</th>
                                        <th className="px-3 py-2 text-right">Total Tax</th>
                                        <th className="px-3 py-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {MOCK_GST_PURCHASES.map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/10">
                                            <td className="px-3 py-2 font-medium text-gray-900 dark:text-white truncate max-w-[100px]" title={row.vendor}>{row.vendor}</td>
                                            <td className="px-3 py-2 font-mono text-gray-600 dark:text-gray-400">{row.billNo}</td>
                                            <td className="px-3 py-2 text-gray-500">{row.date}</td>
                                            <td className="px-3 py-2 text-right">{row.taxable.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right">{(row.igst + row.cgst + row.sgst).toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right font-medium">{row.total.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Section 4: Comparison */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase mb-4">Period Comparison</h3>
                    <div className="grid grid-cols-3 gap-8 border-t border-gray-100 dark:border-gray-800 pt-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Total Liability</p>
                            <div className="flex items-end gap-2">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">₹ 67,500</span>
                                <span className="text-xs font-medium text-red-600 flex items-center mb-1"><TrendingUp size={12} className="mr-0.5" /> +12%</span>
                            </div>
                            <p className="text-[10px] text-gray-400">vs ₹ 60,200 last month</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Total ITC</p>
                            <div className="flex items-end gap-2">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">₹ 23,760</span>
                                <span className="text-xs font-medium text-green-600 flex items-center mb-1"><TrendingUp size={12} className="mr-0.5" /> +5%</span>
                            </div>
                            <p className="text-[10px] text-gray-400">vs ₹ 22,500 last month</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Net Payable</p>
                            <div className="flex items-end gap-2">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">₹ 43,740</span>
                                <span className="text-xs font-medium text-red-600 flex items-center mb-1"><TrendingUp size={12} className="mr-0.5" /> +15%</span>
                            </div>
                            <p className="text-[10px] text-gray-400">vs ₹ 37,700 last month</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3 sticky bottom-0 z-20">
                    <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Print View
                    </button>
                    <button className="px-4 py-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg text-sm font-medium transition-colors flex items-center">
                        <FileText size={16} className="mr-2" /> Download JSON
                    </button>
                </div>

                <AiExplanationModal
                    isOpen={showAiModal}
                    onClose={() => setShowAiModal(false)}
                    title="GST Summary Report"
                />
            </div>
        );
    };

    const renderDownloadCenter = () => (
        <div className="flex flex-col h-full animate-fade-in pb-20">
            <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                <button
                    onClick={() => setActiveReport(null)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Download Center</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quickly export any report</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {['Financial', 'Accounting', 'Inventory', 'Tax'].map((category) => {
                    const reports = ALL_REPORTS.filter(r => r.category === category && r.id !== 'download-center');
                    if (reports.length === 0) return null;

                    return (
                        <div key={category} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                            <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-3 font-bold text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">
                                {category} Reports
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {reports.map(report => (
                                    <div key={report.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-lg mr-4 ${report.colorClass}`}>
                                                <report.icon size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">{report.name}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{report.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => alert(`Downloading ${report.name} PDF...`)}
                                                className="flex items-center px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20 rounded text-sm font-medium transition-colors"
                                            >
                                                <FileText size={14} className="mr-1.5" /> PDF
                                            </button>
                                            <button
                                                onClick={() => alert(`Downloading ${report.name} CSV...`)}
                                                className="flex items-center px-3 py-1.5 border border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-900/20 rounded text-sm font-medium transition-colors"
                                            >
                                                <FileSpreadsheet size={14} className="mr-1.5" /> CSV
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderPlaceholder = (title: string) => (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => setActiveReport(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
                </div>
                <button
                    onClick={() => setShowAiModal(true)}
                    className="flex items-center px-3 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors shadow-sm"
                >
                    <Sparkles size={16} className="mr-2" /> Explain with AI
                </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/30">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <BarChart3 size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Report Coming Soon</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This report is currently under development.</p>
            </div>

            <AiExplanationModal
                isOpen={showAiModal}
                onClose={() => setShowAiModal(false)}
                title={title}
            />
        </div>
    );

    // Main Render Logic
    if (activeReport === 'pnl') return renderPnL();
    if (activeReport === 'balance-sheet') return renderBalanceSheet();
    if (activeReport === 'cash-flow') return renderCashFlow();
    if (activeReport === 'trial-balance') return renderTrialBalance();
    if (activeReport === 'ageing') return renderAgeingReport();
    if (activeReport === 'inventory-val') return renderInventoryValuation();
    if (activeReport === 'gst-summary') return renderGstSummary();
    if (activeReport === 'ledger-reports') return renderLedgerReport();
    if (activeReport === 'download-center') return renderDownloadCenter();

    return renderReportsHub();
};

export default Reports;
