import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  RefreshCw,
  Image as ImageIcon,
  X,
  Sparkles
} from 'lucide-react';

// --- Types ---

export interface ScannedItem {
  description: string;
  qty: number;
  rate: number;
  taxPercent: number;
  total: number;
}

export interface ScannedData {
  vendorName: string;
  vendorGstin: string;
  billNo: string;
  billDate: string;
  totalAmount: number;
  items: ScannedItem[];
}

interface ScanBillProps {
  onCreateBill: (data: ScannedData) => void;
}

interface UploadHistoryItem {
  id: string;
  name: string;
  date: string;
  status: 'Pending' | 'Parsed' | 'Error';
}

// --- Mock Data ---

const MOCK_HISTORY: UploadHistoryItem[] = [
  { id: '1', name: 'invoice_jan_24.pdf', date: '2024-01-28', status: 'Parsed' },
  { id: '2', name: 'uber_ride_receipt.jpg', date: '2024-01-27', status: 'Parsed' },
  { id: '3', name: 'unknown_file.png', date: '2024-01-25', status: 'Error' },
];

const DUMMY_EXTRACTED_DATA: ScannedData = {
  vendorName: 'Tech Solutions Ltd',
  vendorGstin: '29TECHSOL9876L1Z2',
  billNo: 'INV-AI-8829',
  billDate: new Date().toISOString().split('T')[0],
  totalAmount: 129800,
  items: [
    { description: 'Dell XPS 15 Laptop', qty: 1, rate: 110000, taxPercent: 18, total: 129800 }
  ]
};

const ScanBill: React.FC<ScanBillProps> = ({ onCreateBill }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ScannedData | null>(null);
  const [history, setHistory] = useState<UploadHistoryItem[]>(MOCK_HISTORY);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsProcessing(true);
    setExtractedData(null);

    // Simulate AI processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setExtractedData(DUMMY_EXTRACTED_DATA);
      
      // Add to history
      const newItem: UploadHistoryItem = {
        id: Date.now().toString(),
        name: uploadedFile.name,
        date: new Date().toISOString().split('T')[0],
        status: 'Parsed'
      };
      setHistory([newItem, ...history]);
    }, 2500);
  };

  const handleReRun = () => {
    if (!file) return;
    processFile(file);
  };

  const handleDataChange = (field: keyof ScannedData, value: any) => {
    if (extractedData) {
      setExtractedData({ ...extractedData, [field]: value });
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 animate-fade-in">
      
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Sparkles className="mr-2 text-primary-600" size={24} />
          Scan to Bill (AI)
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Upload invoices or receipts. Our AI will extract the details for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        
        {/* Left Panel: Upload & History */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Upload Area */}
          <div 
            className={`
              flex-1 min-h-[300px] rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center p-8
              ${isDragging 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-400 dark:hover:border-primary-600'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileSelect}
            />

            {file ? (
              <div className="flex flex-col items-center animate-fade-in">
                 <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4 text-primary-600">
                    <FileText size={32} />
                 </div>
                 <p className="font-medium text-gray-900 dark:text-white mb-1 truncate max-w-xs">{file.name}</p>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{(file.size / 1024).toFixed(2)} KB</p>
                 <button 
                   onClick={() => { setFile(null); setExtractedData(null); }}
                   className="text-sm text-red-500 hover:text-red-600 font-medium"
                 >
                   Remove File
                 </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-primary-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400">
                   <UploadCloud size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Upload Bill Image or PDF</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
                  Drag & drop your file here, or click to browse. Supports JPG, PNG, PDF.
                </p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
                >
                  Browse Files
                </button>
              </>
            )}
          </div>

          {/* History */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 flex-1 overflow-hidden flex flex-col">
             <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Upload History</h4>
             <div className="overflow-y-auto flex-1 space-y-2 pr-2">
                {history.map(item => (
                   <div key={item.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-colors">
                      <div className="flex items-center space-x-3 overflow-hidden">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">
                             <ImageIcon size={16} />
                          </div>
                          <div className="min-w-0">
                             <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                             <p className="text-xs text-gray-400">{item.date}</p>
                          </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                         item.status === 'Parsed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' : 
                         item.status === 'Error' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30' :
                         'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30'
                      }`}>
                         {item.status}
                      </span>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Panel: Extracted Data */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col relative overflow-hidden">
           
           {/* Empty State / Processing */}
           {!file ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50/50 dark:bg-gray-900/50 z-10">
                 <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <ArrowRight size={24} className="text-gray-400" />
                    </div>
                    <p>Upload a file to see extracted details here</p>
                 </div>
              </div>
           ) : isProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-20">
                  <Loader2 size={48} className="text-primary-600 animate-spin mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analyzing Document...</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Extracting vendor, dates, and line items.</p>
              </div>
           ) : null}

           {/* Data Form */}
           {extractedData && (
              <div className="flex flex-col h-full">
                 
                 {/* Banner */}
                 <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 p-4 border-b border-green-100 dark:border-green-900/30 flex items-start space-x-3">
                    <Sparkles className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" size={18} />
                    <div>
                        <h4 className="text-sm font-bold text-green-800 dark:text-green-300">AI Extraction Complete</h4>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                            We've extracted the following details. Please review and edit if necessary before creating the bill.
                        </p>
                    </div>
                    <button onClick={handleReRun} className="ml-auto text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200" title="Re-run Extraction">
                        <RefreshCw size={16} />
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-6 space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                         <div className="col-span-2">
                             <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Vendor Name</label>
                             <input 
                               type="text" 
                               value={extractedData.vendorName} 
                               onChange={(e) => handleDataChange('vendorName', e.target.value)}
                               className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm font-medium text-gray-900 dark:text-white"
                             />
                         </div>
                         <div>
                             <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Bill Number</label>
                             <input 
                               type="text" 
                               value={extractedData.billNo} 
                               onChange={(e) => handleDataChange('billNo', e.target.value)}
                               className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-white"
                             />
                         </div>
                         <div>
                             <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Date</label>
                             <input 
                               type="date" 
                               value={extractedData.billDate} 
                               onChange={(e) => handleDataChange('billDate', e.target.value)}
                               className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-white"
                             />
                         </div>
                         <div className="col-span-2">
                             <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">GSTIN (Extracted)</label>
                             <input 
                               type="text" 
                               value={extractedData.vendorGstin} 
                               onChange={(e) => handleDataChange('vendorGstin', e.target.value)}
                               className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-900 dark:text-white"
                             />
                         </div>
                     </div>

                     <div>
                         <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Line Items (Preview)</h5>
                         <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                             <table className="w-full text-xs text-left">
                                 <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium">
                                     <tr>
                                         <th className="px-3 py-2">Description</th>
                                         <th className="px-3 py-2 text-right">Qty</th>
                                         <th className="px-3 py-2 text-right">Rate</th>
                                         <th className="px-3 py-2 text-right">Total</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                     {extractedData.items.map((item, idx) => (
                                         <tr key={idx} className="bg-white dark:bg-gray-800">
                                             <td className="px-3 py-2 text-gray-900 dark:text-white">{item.description}</td>
                                             <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{item.qty}</td>
                                             <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{item.rate}</td>
                                             <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">{item.total}</td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         </div>
                         <div className="flex justify-between items-center mt-2 px-2">
                            <span className="text-sm font-medium text-gray-500">Total Detected Amount</span>
                            <span className="text-lg font-bold text-primary-600">₹ {extractedData.totalAmount.toLocaleString()}</span>
                         </div>
                     </div>
                 </div>

                 {/* Footer Actions */}
                 <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end">
                     <button 
                        onClick={() => onCreateBill(extractedData)}
                        className="flex items-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors"
                     >
                         Create Purchase Bill
                         <ArrowRight size={18} className="ml-2" />
                     </button>
                 </div>
              </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default ScanBill;