
import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Download, 
  ChevronRight, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  FileBarChart, 
  History, 
  ArrowLeft, 
  Search, 
  Filter, 
  Save, 
  Eye, 
  UploadCloud, 
  FileSpreadsheet, 
  RefreshCw, 
  Check, 
  ArrowRight, 
  AlertCircle, 
  PlusCircle, 
  XCircle,
  PanelRight,
  X,
  Briefcase,
  Sparkles
} from 'lucide-react';
import AiExplanationModal from './AiExplanationModal';

// --- Types ---

type FilingStatus = 'Filed' | 'Pending' | 'Overdue';

interface FilingMonth {
  month: string;
  year: number;
  gstr1: FilingStatus;
  gstr3b: FilingStatus;
}

interface Gstr1Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  customer: string;
  gstin?: string; // For B2B
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  amount: number;
  type: 'B2B' | 'B2C';
}

interface Gstr3bRow {
  section: string;
  description: string;
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  cess?: number;
}

interface Gstr2bUpload {
  id: string;
  period: string;
  fileName: string;
  uploadDate: string;
  status: 'Parsed' | 'Error';
}

interface ReconciliationItem {
  id: string;
  invoiceNo: string;
  vendor: string;
  date: string;
  taxable: number;
  tax: number;
  status: 'Matched' | 'Mismatched' | 'Missing';
  diff?: number; // For mismatched
}

interface VendorITCSummary {
  id: string;
  vendor: string;
  gstin: string;
  in2b: number;
  inBooks: number;
  eligibleItc: number;
  ineligibleItc: number;
  netDifference: number;
}

// --- Mock Data ---

const MOCK_KPI_DATA = {
  gstr1Status: 'Filed' as FilingStatus,
  gstr1Date: '11/01/2024',
  gstr3bStatus: 'Pending' as FilingStatus,
  gstr3bDueDate: '20/01/2024',
  taxLiability: 145000,
  itcAvailable: 98500
};

const MOCK_TIMELINE: FilingMonth[] = [
  { month: 'Apr', year: 2023, gstr1: 'Filed', gstr3b: 'Filed' },
  { month: 'May', year: 2023, gstr1: 'Filed', gstr3b: 'Filed' },
  { month: 'Jun', year: 2023, gstr1: 'Filed', gstr3b: 'Filed' },
  { month: 'Jul', year: 2023, gstr1: 'Filed', gstr3b: 'Filed' },
  { month: 'Aug', year: 2023, gstr1: 'Filed', gstr3b: 'Filed' },
  { month: 'Sep', year: 2023, gstr1: 'Filed', gstr3b: 'Filed' },
  { month: 'Oct', year: 2023, gstr1: 'Filed', gstr3b: 'Filed' },
  { month: 'Nov', year: 2023, gstr1: 'Filed', gstr3b: 'Filed' },
  { month: 'Dec', year: 2023, gstr1: 'Filed', gstr3b: 'Filed' },
  { month: 'Jan', year: 2024, gstr1: 'Filed', gstr3b: 'Pending' },
];

const MOCK_GSTR1_DATA: Gstr1Invoice[] = [
  { id: '1', invoiceNo: 'INV-2024-001', date: '2024-01-05', customer: 'Acme Traders', gstin: '27AAACA1234A1Z5', taxableValue: 100000, igst: 18000, cgst: 0, sgst: 0, amount: 118000, type: 'B2B' },
  { id: '2', invoiceNo: 'INV-2024-002', date: '2024-01-08', customer: 'Bharat Tech', gstin: '29BBBCB5678B1Z6', taxableValue: 50000, igst: 0, cgst: 4500, sgst: 4500, amount: 59000, type: 'B2B' },
  { id: '3', invoiceNo: 'INV-2024-003', date: '2024-01-12', customer: 'Local Retailer', taxableValue: 25000, igst: 0, cgst: 2250, sgst: 2250, amount: 29500, type: 'B2C' },
  { id: '4', invoiceNo: 'INV-2024-004', date: '2024-01-15', customer: 'Walk-in Customer', taxableValue: 10000, igst: 0, cgst: 900, sgst: 900, amount: 11800, type: 'B2C' },
  { id: '5', invoiceNo: 'INV-2024-005', date: '2024-01-20', customer: 'Global Exports', gstin: '07CCCCD9012C1Z7', taxableValue: 200000, igst: 36000, cgst: 0, sgst: 0, amount: 236000, type: 'B2B' },
];

const MOCK_GSTR3B_DATA: Gstr3bRow[] = [
  { section: '3.1 (a)', description: 'Outward taxable supplies (other than zero rated, nil rated and exempted)', taxableValue: 1250000, igst: 150000, cgst: 45000, sgst: 45000 },
  { section: '3.1 (b)', description: 'Outward taxable supplies (zero rated)', taxableValue: 0, igst: 0, cgst: 0, sgst: 0 },
  { section: '3.1 (c)', description: 'Other outward supplies (Nil rated, exempted)', taxableValue: 50000, igst: 0, cgst: 0, sgst: 0 },
  { section: '3.1 (d)', description: 'Inward supplies (liable to reverse charge)', taxableValue: 12000, igst: 0, cgst: 600, sgst: 600 },
  { section: '4 (A)', description: 'ITC Available (Import of goods, services, etc.)', taxableValue: 0, igst: 85000, cgst: 12500, sgst: 12500 },
  { section: '4 (B)', description: 'ITC Reversed', taxableValue: 0, igst: 0, cgst: 0, sgst: 0 },
];

const MOCK_GSTR2B_HISTORY: Gstr2bUpload[] = [
  { id: '1', period: 'Dec 2023', fileName: 'GSTR2B_Dec23.json', uploadDate: '2024-01-10', status: 'Parsed' },
  { id: '2', period: 'Nov 2023', fileName: 'GSTR2B_Nov23.json', uploadDate: '2023-12-12', status: 'Parsed' },
  { id: '3', period: 'Oct 2023', fileName: 'GSTR2B_Oct23_Err.xlsx', uploadDate: '2023-11-14', status: 'Error' },
];

const MOCK_RECON_DATA: ReconciliationItem[] = [
  { id: '1', invoiceNo: 'INV-001', vendor: 'Acme Traders', date: '2024-01-05', taxable: 10000, tax: 1800, status: 'Matched' },
  { id: '2', invoiceNo: 'INV-002', vendor: 'Global Exports', date: '2024-01-10', taxable: 25000, tax: 4500, status: 'Matched' },
  { id: '3', invoiceNo: 'INV-003', vendor: 'Tech Solutions', date: '2024-01-12', taxable: 50000, tax: 9000, status: 'Mismatched', diff: 500 },
  { id: '4', invoiceNo: 'INV-004', vendor: 'Office Supplies Co.', date: '2024-01-15', taxable: 5000, tax: 900, status: 'Missing' },
  { id: '5', invoiceNo: 'INV-005', vendor: 'Furniture Mart', date: '2024-01-18', taxable: 15000, tax: 2700, status: 'Missing' },
  { id: '6', invoiceNo: 'INV-006', vendor: 'Bharat Tech', date: '2024-01-22', taxable: 12000, tax: 2160, status: 'Matched' },
];

const MOCK_VENDOR_SUMMARY: VendorITCSummary[] = [
  { id: '1', vendor: 'Acme Traders', gstin: '27AAACA1234A1Z5', in2b: 12, inBooks: 12, eligibleItc: 45000, ineligibleItc: 0, netDifference: 0 },
  { id: '2', vendor: 'Global Exports', gstin: '07CCCCD9012C1Z7', in2b: 5, inBooks: 4, eligibleItc: 12000, ineligibleItc: 0, netDifference: -2500 },
  { id: '3', vendor: 'Tech Solutions', gstin: '29BBBCB5678B1Z6', in2b: 8, inBooks: 8, eligibleItc: 28000, ineligibleItc: 5000, netDifference: 0 },
  { id: '4', vendor: 'Office Supplies Co.', gstin: '27VENDOR1234X1Z5', in2b: 3, inBooks: 0, eligibleItc: 1500, ineligibleItc: 0, netDifference: -1500 },
];

// --- Helper Components ---

const StatusIcon: React.FC<{ status: FilingStatus }> = ({ status }) => {
  if (status === 'Filed') return <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />;
  if (status === 'Pending') return <Clock size={16} className="text-orange-500" />;
  return <AlertTriangle size={16} className="text-red-600" />;
};

const StatusBadge: React.FC<{ status: FilingStatus }> = ({ status }) => {
  const styles = {
    Filed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/30',
    Pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-900/30',
    Overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status === 'Filed' ? <CheckCircle2 size={12} className="mr-1" /> : <Clock size={12} className="mr-1" />}
      {status}
    </span>
  );
};

const KpiCard: React.FC<{ 
  title: string; 
  value?: string; 
  status?: FilingStatus; 
  subtext: string; 
  icon: React.ReactNode;
  trend?: 'up' | 'down';
}> = ({ title, value, status, subtext, icon, trend }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
          {icon}
        </div>
        {status && <StatusBadge status={status} />}
        {trend && (
            <div className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </div>
        )}
      </div>
      <div>
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
        {value && <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>}
        <p className="text-xs text-gray-400 mt-2">{subtext}</p>
      </div>
    </div>
  );
};

const DifferenceReportDrawer: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  data: ReconciliationItem[];
}> = ({ isOpen, onClose, data }) => {
  
  // Calculations
  const stats = useMemo(() => {
    const mismatched = data.filter(i => i.status === 'Mismatched');
    const missing = data.filter(i => i.status === 'Missing');
    
    const mismatchedCount = mismatched.length;
    const missingCount = missing.length;
    
    const taxDifference = mismatched.reduce((acc, i) => acc + (i.diff || 0), 0) + 
                          missing.reduce((acc, i) => acc + i.tax, 0);

    // Group by Vendor
    const vendorMap: Record<string, { count: number, diff: number, actions: string[] }> = {};
    
    [...mismatched, ...missing].forEach(item => {
        if (!vendorMap[item.vendor]) {
            vendorMap[item.vendor] = { count: 0, diff: 0, actions: [] };
        }
        vendorMap[item.vendor].count += 1;
        
        const diffAmt = item.status === 'Mismatched' ? (item.diff || 0) : item.tax;
        vendorMap[item.vendor].diff += diffAmt;
        
        const action = item.status === 'Mismatched' ? 'Correct Amount' : 'Create Bill';
        if (!vendorMap[item.vendor].actions.includes(action)) {
            vendorMap[item.vendor].actions.push(action);
        }
    });

    return { mismatchedCount, missingCount, taxDifference, vendorMap };
  }, [data]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div>
             <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                 <AlertCircle size={20} className="mr-2 text-red-600" />
                 Difference Report
             </h2>
             <p className="text-sm text-gray-500 dark:text-gray-400">Audit assistant for reconciliation</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Summary Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl">
                    <p className="text-xs text-red-600 dark:text-red-400 uppercase font-bold tracking-wider">Total Tax Difference</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">₹ {stats.taxDifference.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Mismatched Invoices</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{stats.mismatchedCount}</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Missing Invoices</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{stats.missingCount}</p>
                </div>
            </div>

            {/* Vendor Table */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Vendor-wise Differences</h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-4 py-2">Vendor</th>
                                <th className="px-4 py-2 text-center">Count</th>
                                <th className="px-4 py-2 text-right">Diff (₹)</th>
                                <th className="px-4 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {Object.entries(stats.vendorMap).length > 0 ? (
                                Object.entries(stats.vendorMap).map(([vendor, stat]: [string, any]) => (
                                    <tr key={vendor} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/20">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{vendor}</td>
                                        <td className="px-4 py-3 text-center">{stat.count}</td>
                                        <td className="px-4 py-3 text-right font-bold text-red-600 dark:text-red-400">{stat.diff.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                                                {stat.actions[0]}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-gray-500 text-sm">No discrepancies found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <button className="w-full py-2.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center">
                <Download size={18} className="mr-2" />
                Export Difference Report (CSV)
            </button>
        </div>
      </div>
    </>
  );
};

// --- Main Component ---

const Compliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gst' | 'tds' | 'reports'>('gst');
  const [view, setView] = useState<'dashboard' | 'gstr1' | 'gstr3b' | 'gstr2b'>('dashboard');
  const [showAiModal, setShowAiModal] = useState(false);
  
  // 2B Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  
  // 2B Recon Tab State
  const [reconTab, setReconTab] = useState<'matched' | 'mismatched' | 'missing' | 'vendor-summary'>('matched');
  
  // Side Panel State
  const [showDiffReport, setShowDiffReport] = useState(false);

  const vendorSummaryTotals = useMemo(() => {
      return MOCK_VENDOR_SUMMARY.reduce((acc, curr) => ({
          eligible: acc.eligible + curr.eligibleItc,
          ineligible: acc.ineligible + curr.ineligibleItc,
          netDiff: acc.netDiff + curr.netDifference
      }), { eligible: 0, ineligible: 0, netDiff: 0 });
  }, []);

  const reconCounts = useMemo(() => ({
      matched: MOCK_RECON_DATA.filter(i => i.status === 'Matched').length,
      mismatched: MOCK_RECON_DATA.filter(i => i.status === 'Mismatched').length,
      missing: MOCK_RECON_DATA.filter(i => i.status === 'Missing').length,
  }), []);

  const reconData = useMemo(() => {
      if (reconTab === 'matched') return MOCK_RECON_DATA.filter(i => i.status === 'Matched');
      if (reconTab === 'mismatched') return MOCK_RECON_DATA.filter(i => i.status === 'Mismatched');
      return MOCK_RECON_DATA.filter(i => i.status === 'Missing');
  }, [reconTab]);

  const handle2bUpload = () => {
      setIsUploading(true);
      setTimeout(() => {
          setIsUploading(false);
          setUploadComplete(true);
      }, 2000);
  };

  // --- Views ---

  if (view === 'gstr2b') {
      return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in pb-20 lg:pb-0">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setView('dashboard')}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">GSTR-2B Reconciliation</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Import and reconcile your Input Tax Credit</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                
                {/* Left: Upload & Preview */}
                <div className="lg:col-span-7 flex flex-col gap-6 h-full overflow-hidden">
                    {!uploadComplete ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-10 flex flex-col items-center justify-center text-center h-[400px]">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                                <FileSpreadsheet size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Import GSTR-2B File</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                                Upload the JSON or Excel file downloaded from the GST Portal. This file contains details of invoices uploaded by your suppliers.
                            </p>
                            <button 
                                onClick={handle2bUpload}
                                disabled={isUploading}
                                className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-md transition-colors flex items-center"
                            >
                                {isUploading ? (
                                    <><RefreshCw size={18} className="mr-2 animate-spin" /> Parsing File...</>
                                ) : (
                                    <><UploadCloud size={18} className="mr-2" /> Upload File</>
                                )}
                            </button>
                            <p className="text-xs text-gray-400 mt-4">
                                or select a processed file from the history to view details
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full overflow-hidden">
                            {/* File Info Header */}
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                        <CheckCircle2 size={20} className="text-green-500 mr-2" />
                                        File Parsed Successfully
                                    </h3>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setShowDiffReport(true)}
                                            className="flex items-center px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                        >
                                            <PanelRight size={16} className="mr-2" />
                                            View Difference Report
                                        </button>
                                        <button 
                                            onClick={() => setUploadComplete(false)} 
                                            className="text-sm text-primary-600 hover:underline"
                                        >
                                            Upload Different File
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Period</p>
                                        <p className="text-base font-bold text-gray-900 dark:text-white">Jan 2024</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Invoices</p>
                                        <p className="text-base font-bold text-gray-900 dark:text-white">42</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Total ITC</p>
                                        <p className="text-base font-bold text-green-600">₹ 1,45,230</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reconciliation Tabs */}
                            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar">
                                <button 
                                    onClick={() => setReconTab('matched')}
                                    className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors whitespace-nowrap px-4 ${reconTab === 'matched' ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                >
                                    Matched ({reconCounts.matched})
                                </button>
                                <button 
                                    onClick={() => setReconTab('mismatched')}
                                    className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors whitespace-nowrap px-4 ${reconTab === 'mismatched' ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                >
                                    Mismatched ({reconCounts.mismatched})
                                </button>
                                <button 
                                    onClick={() => setReconTab('missing')}
                                    className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors whitespace-nowrap px-4 ${reconTab === 'missing' ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                >
                                    Missing in Books ({reconCounts.missing})
                                </button>
                                <button 
                                    onClick={() => setReconTab('vendor-summary')}
                                    className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors whitespace-nowrap px-4 ${reconTab === 'vendor-summary' ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                >
                                    Vendor ITC Summary
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto bg-gray-50/30 dark:bg-gray-900/10">
                                {reconTab === 'vendor-summary' ? (
                                    <div className="p-4 space-y-6">
                                        {/* Summary Cards */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Total Eligible ITC</p>
                                                <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">₹ {vendorSummaryTotals.eligible.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Total Ineligible ITC</p>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">₹ {vendorSummaryTotals.ineligible.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Net Variance</p>
                                                <p className={`text-xl font-bold mt-1 ${vendorSummaryTotals.netDiff === 0 ? 'text-gray-900 dark:text-white' : 'text-red-600'}`}>
                                                    {vendorSummaryTotals.netDiff > 0 ? '+' : ''}₹ {vendorSummaryTotals.netDiff.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Detailed Table */}
                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium">
                                                        <tr>
                                                            <th className="px-4 py-3">Vendor Name</th>
                                                            <th className="px-4 py-3">GSTIN</th>
                                                            <th className="px-4 py-3 text-center">Inv in 2B</th>
                                                            <th className="px-4 py-3 text-center">Inv in Books</th>
                                                            <th className="px-4 py-3 text-right">Eligible ITC</th>
                                                            <th className="px-4 py-3 text-right">Ineligible ITC</th>
                                                            <th className="px-4 py-3 text-right">Net Diff</th>
                                                            <th className="px-4 py-3 text-center">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                                                        {MOCK_VENDOR_SUMMARY.map((item) => (
                                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.vendor}</td>
                                                                <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.gstin}</td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-bold">{item.in2b}</span>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-bold">{item.inBooks}</span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-green-600 font-medium">{item.eligibleItc.toLocaleString()}</td>
                                                                <td className="px-4 py-3 text-right text-gray-500">{item.ineligibleItc.toLocaleString()}</td>
                                                                <td className={`px-4 py-3 text-right font-bold ${item.netDifference !== 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                                                    {item.netDifference.toLocaleString()}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <button className="text-primary-600 hover:text-primary-700 text-xs font-medium hover:underline flex items-center justify-center w-full">
                                                                        Open Invoices <ChevronRight size={12} className="ml-1"/>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-gray-800 h-full">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-4 py-3">Invoice Details</th>
                                                    <th className="px-4 py-3 text-right">Taxable</th>
                                                    <th className="px-4 py-3 text-right">Tax</th>
                                                    <th className="px-4 py-3 text-center">Status</th>
                                                    <th className="px-4 py-3 text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                                                {reconData.map(item => (
                                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-gray-900 dark:text-white">{item.vendor}</div>
                                                            <div className="text-xs text-gray-500 flex items-center">
                                                                <span className="font-mono mr-2">{item.invoiceNo}</span>
                                                                <span>• {item.date}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">{item.taxable.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right">{item.tax.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                                                                item.status === 'Matched' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' :
                                                                item.status === 'Mismatched' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30' :
                                                                'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
                                                            }`}>
                                                                {item.status === 'Matched' ? <CheckCircle2 size={10} className="mr-1"/> : <AlertCircle size={10} className="mr-1"/>}
                                                                {item.status}
                                                            </span>
                                                            {item.diff && <div className="text-xs text-red-500 mt-1 font-medium">Diff: {item.diff}</div>}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {item.status === 'Mismatched' ? (
                                                                <button className="px-3 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                                    Adjust Entry
                                                                </button>
                                                            ) : item.status === 'Missing' ? (
                                                                <button className="px-3 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded flex items-center justify-center mx-auto">
                                                                    <PlusCircle size={12} className="mr-1" /> Create Bill
                                                                </button>
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {reconData.length === 0 && (
                                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                                No {reconTab} items found.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: History */}
                <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center">
                            <History size={16} className="mr-2 text-gray-500" />
                            Upload History
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-0">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Period</th>
                                    <th className="px-4 py-3">File</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-2 py-3 w-8"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {MOCK_GSTR2B_HISTORY.map(item => (
                                    <tr 
                                        key={item.id} 
                                        onClick={() => item.status === 'Parsed' && setUploadComplete(true)}
                                        className={`transition-colors ${item.status === 'Parsed' ? 'hover:bg-gray-50 dark:hover:bg-gray-900/20 cursor-pointer group' : ''}`}
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.period}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-xs text-gray-500">{item.uploadDate}</div>
                                            <div className="truncate max-w-[120px]" title={item.fileName}>{item.fileName}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                                                item.status === 'Parsed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' :
                                                'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
                                            }`}>
                                                {item.status === 'Parsed' ? <Check size={10} className="mr-1"/> : <AlertTriangle size={10} className="mr-1"/>}
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3 w-8 text-center">
                                            {item.status === 'Parsed' && (
                                                <ChevronRight size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <DifferenceReportDrawer 
                isOpen={showDiffReport}
                onClose={() => setShowDiffReport(false)}
                data={MOCK_RECON_DATA}
            />
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-1">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight px-1">Compliance & Tax</h1>
            <div className="flex space-x-6 mt-4 overflow-x-auto no-scrollbar">
                <button 
                    onClick={() => setActiveTab('gst')}
                    className={`pb-3 text-sm font-medium transition-colors relative flex items-center whitespace-nowrap ${activeTab === 'gst' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <FileText size={16} className="mr-1.5" />
                    GST Dashboard
                    {activeTab === 'gst' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>}
                </button>
                <button 
                    onClick={() => setActiveTab('tds')}
                    className={`pb-3 text-sm font-medium transition-colors relative flex items-center whitespace-nowrap ${activeTab === 'tds' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <FileText size={16} className="mr-1.5" />
                    TDS / TCS
                    {activeTab === 'tds' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>}
                </button>
                <button 
                    onClick={() => setActiveTab('reports')}
                    className={`pb-3 text-sm font-medium transition-colors relative flex items-center whitespace-nowrap ${activeTab === 'reports' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <FileBarChart size={16} className="mr-1.5" />
                    Tax Reports
                    {activeTab === 'reports' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>}
                </button>
            </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'gst' ? (
        <div className="space-y-8 relative">
            
            {/* AI Explain Button */}
            <div className="flex justify-end">
                <button 
                    onClick={() => setShowAiModal(true)}
                    className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 rounded-lg text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors shadow-sm"
                >
                    <Sparkles size={16} className="mr-2" />
                    Explain with AI
                </button>
            </div>

            {/* 1. Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard 
                    title="GSTR-1 Status"
                    status={MOCK_KPI_DATA.gstr1Status}
                    subtext={`Last Filed: ${MOCK_KPI_DATA.gstr1Date}`}
                    icon={<FileText size={24} />}
                />
                <KpiCard 
                    title="GSTR-3B Status"
                    status={MOCK_KPI_DATA.gstr3bStatus}
                    subtext={`Due Date: ${MOCK_KPI_DATA.gstr3bDueDate}`}
                    icon={<FileText size={24} />}
                />
                <KpiCard 
                    title="Tax Liability (Outward)"
                    value={`₹ ${MOCK_KPI_DATA.taxLiability.toLocaleString()}`}
                    subtext="For current period"
                    icon={<TrendingUp size={24} />}
                    trend="up"
                />
                <KpiCard 
                    title="Input Tax Credit (ITC)"
                    value={`₹ ${MOCK_KPI_DATA.itcAvailable.toLocaleString()}`}
                    subtext="Available for offset"
                    icon={<TrendingDown size={24} />}
                    trend="down" // Green/Good for ITC usually, but functionally 'down' arrow logic
                />
            </div>

            {/* 2. Filing Timeline Strip */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                        <History size={18} className="mr-2 text-gray-500" />
                        Filing Timeline
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">FY 2023-24</span>
                </div>
                <div className="p-6 overflow-x-auto">
                    <div className="flex space-x-6 min-w-max pb-2">
                        {MOCK_TIMELINE.map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center space-y-3 min-w-[80px]">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{item.month}</span>
                                <div className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-3 flex flex-col gap-2 items-center hover:shadow-md transition-shadow">
                                    <div className="flex items-center space-x-2 text-xs" title="GSTR-1">
                                        <span className="font-medium text-gray-500 dark:text-gray-400">R1</span>
                                        <StatusIcon status={item.gstr1} />
                                    </div>
                                    <div className="w-full h-px bg-gray-200 dark:bg-gray-600"></div>
                                    <div className="flex items-center space-x-2 text-xs" title="GSTR-3B">
                                        <span className="font-medium text-gray-500 dark:text-gray-400">3B</span>
                                        <StatusIcon status={item.gstr3b} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* Future Month Placeholder */}
                        <div className="flex flex-col items-center space-y-3 min-w-[80px] opacity-50">
                            <span className="text-sm font-bold text-gray-400">Feb</span>
                            <div className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-3 flex items-center justify-center">
                                <span className="text-xs text-gray-400">Upcoming</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Quick Actions Row */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button 
                        onClick={() => setView('gstr1')}
                        className="flex items-center justify-center px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-colors group"
                    >
                        <FileText size={18} className="mr-2 group-hover:scale-110 transition-transform" />
                        Prepare GSTR-1 Summary
                    </button>
                    <button 
                        onClick={() => setView('gstr3b')}
                        className="flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                        <FileText size={18} className="mr-2 text-gray-500 dark:text-gray-300" />
                        Prepare GSTR-3B Summary
                    </button>
                    <button 
                        onClick={() => setView('gstr2b')}
                        className="flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                        <FileSpreadsheet size={18} className="mr-2 text-gray-500 dark:text-gray-300" />
                        Reconcile GSTR-2B
                    </button>
                </div>
            </div>

            <AiExplanationModal 
                isOpen={showAiModal}
                onClose={() => setShowAiModal(false)}
                title="GST Compliance Dashboard"
            />

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <FileBarChart size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Under Development</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">The {activeTab === 'tds' ? 'TDS' : 'Reports'} module is coming soon.</p>
        </div>
      )}
    </div>
  );
};

export default Compliance;
