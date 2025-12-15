
import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MoreVertical, 
  Search, 
  Download, 
  Filter,
  Wallet,
  CreditCard,
  DollarSign,
  Activity,
  Sparkles,
  X
} from 'lucide-react';

// --- Mock Data ---

const KPIS = [
  { title: 'Total Revenue', value: '₹ 42,50,000', change: '+12.5%', trend: 'up', icon: DollarSign },
  { title: 'Total Expenses', value: '₹ 28,20,000', change: '-2.4%', trend: 'down', icon: CreditCard }, // Down is good for expenses usually, but structurally we show trend
  { title: 'Net Profit', value: '₹ 14,30,000', change: '+28.4%', trend: 'up', icon: Wallet },
];

const CASH_FLOW_DATA = [
  { month: 'Aug', in: 65, out: 40 },
  { month: 'Sep', in: 50, out: 45 },
  { month: 'Oct', in: 75, out: 35 },
  { month: 'Nov', in: 80, out: 55 },
  { month: 'Dec', in: 60, out: 65 },
  { month: 'Jan', in: 90, out: 50 },
];

const EXPENSE_DATA = [
  { category: 'Salaries', value: 45, color: 'bg-blue-500' },
  { category: 'Rent', value: 20, color: 'bg-primary-500' },
  { category: 'Marketing', value: 15, color: 'bg-orange-400' },
  { category: 'Utilities', value: 10, color: 'bg-green-500' },
  { category: 'Others', value: 10, color: 'bg-gray-400' },
];

const TRANSACTIONS = [
  { id: 'TXN-1001', date: '2024-01-28', type: 'Invoice', party: 'Acme Traders', amount: '₹ 1,25,000', status: 'Paid' },
  { id: 'TXN-1002', date: '2024-01-27', type: 'Bill', party: 'Office Supplies Co.', amount: '₹ 12,400', status: 'Pending' },
  { id: 'TXN-1003', date: '2024-01-26', type: 'Invoice', party: 'Tech Solutions Ltd', amount: '₹ 45,000', status: 'Overdue' },
  { id: 'TXN-1004', date: '2024-01-25', type: 'Expense', party: 'Uber Ride', amount: '₹ 850', status: 'Paid' },
  { id: 'TXN-1005', date: '2024-01-24', type: 'Salary', party: 'Payroll Jan', amount: '₹ 8,50,000', status: 'Processing' },
];

const ALERTS = [
  { 
    id: 1, 
    text: 'Revenue has dropped 12% vs last month.', 
    type: 'critical', 
    time: 'Today',
    explanation: 'Your total revenue for Jan is ₹42.5L, compared to ₹48.3L in Dec. This drop is primarily due to lower sales volume in the "Electronics" category. AI Recommendation: Consider running a promotional campaign to boost volume.'
  },
  { 
    id: 2, 
    text: 'Input tax credit mismatch detected.', 
    type: 'warning', 
    time: '2 hrs ago',
    explanation: 'GSTR-2B data shows ₹12,500 less ITC than your purchase register for "Tech Solutions". Invoice #INV-003 seems to be missing from their filing. Action: Contact vendor.'
  },
  { 
    id: 3, 
    text: 'Stockout risk for 4 items.', 
    type: 'critical', 
    time: '4 hrs ago',
    explanation: 'Based on current sales velocity, "Wireless Mouse" and "Office Chair" are projected to run out of stock within the next 3 days. A purchase order should be raised immediately.'
  },
  { 
    id: 4, 
    text: 'High expenses in Marketing category this month.', 
    type: 'warning', 
    time: 'Yesterday',
    explanation: 'Marketing spend is 25% higher than your 6-month average. The major outlier is a ₹50,000 payment for "Social Media Ads" on Jan 20th.'
  },
  { 
    id: 5, 
    text: 'Customer Global Exports has overdue invoices.', 
    type: 'warning', 
    time: '2 days ago',
    explanation: 'Invoice #INV-2024-003 is overdue by 5 days. Total amount: ₹2,50,000. This customer usually pays within 30 days. AI suggests sending a gentle reminder.'
  },
  { 
    id: 6, 
    text: 'GSTR-1 not filed for this month', 
    type: 'critical', 
    time: 'Overdue',
    explanation: 'The due date for GSTR-1 was 11th Jan. You are currently 17 days past due. Late fees may apply. Please file immediately via the Compliance module.'
  }
];

// --- Helper Components ---

const KpiCard: React.FC<{ kpi: typeof KPIS[number] }> = ({ kpi }) => {
  const isPositive = kpi.trend === 'up';
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
          <kpi.icon size={24} />
        </div>
        <div className={`flex items-center text-sm font-medium ${kpi.title === 'Total Expenses' ? (isPositive ? 'text-red-600' : 'text-green-600') : (isPositive ? 'text-green-600' : 'text-red-600')}`}>
          {kpi.change}
          {isPositive ? <ArrowUpRight size={16} className="ml-1" /> : <ArrowDownRight size={16} className="ml-1" />}
        </div>
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{kpi.title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{kpi.value}</p>
    </div>
  );
};

const AiHealthCard = () => {
  // Score Logic Visualization (72/100)
  const score = 72;
  const status = "Healthy";
  const colorClass = "text-green-400 border-green-500/30 bg-green-500/20";

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden">
      {/* Abstract Background Shape */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary-600 rounded-full blur-3xl opacity-40"></div>
      
      <div className="flex justify-between items-start z-10">
        <div>
            <h3 className="text-gray-300 text-sm font-medium">AI Financial Health</h3>
            <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-white">{score}</span>
                <span className="text-sm text-gray-400">/ 100</span>
            </div>
            <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-semibold ${colorClass} border`}>
                {status}
            </span>
        </div>
        <div className="p-2 bg-gray-700 rounded-lg">
            <Activity size={24} className="text-primary-400" />
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700 z-10">
        <p className="text-xs text-gray-300 italic leading-relaxed">
          "Strong revenue growth (+12.5%) is boosting your score, but 5 overdue invoices require attention."
        </p>
      </div>
    </div>
  );
};

const AlertPopup: React.FC<{ alert: typeof ALERTS[0] | null; onClose: () => void }> = ({ alert, onClose }) => {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-700" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-primary-50 dark:bg-primary-900/20 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-white dark:bg-gray-800 rounded-full text-primary-600 shadow-sm">
               <Sparkles size={18} />
             </div>
             <h3 className="font-bold text-gray-900 dark:text-white">AI Insight</h3>
           </div>
           <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
             <X size={20} />
           </button>
        </div>
        
        {/* Body */}
        <div className="p-6">
           <div className="flex items-start gap-3 mb-4">
              <div className={`mt-1 ${alert.type === 'critical' ? 'text-red-500' : 'text-orange-500'}`}>
                  <AlertTriangle size={20} />
              </div>
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white leading-tight">{alert.text}</h4>
           </div>
           
           <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-600 relative">
              {/* Decorative quote */}
              <span className="absolute top-2 left-2 text-4xl text-gray-200 dark:text-gray-600 font-serif leading-none">“</span>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed relative z-10 pl-2">
                {alert.explanation}
              </p>
           </div>
           
           <div className="mt-6 flex justify-end">
              <button 
                onClick={onClose} 
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Got it
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [cfPeriod, setCfPeriod] = useState<'6m' | '12m'>('6m');
  const [selectedAlert, setSelectedAlert] = useState<typeof ALERTS[0] | null>(null);

  return (
    <div className="space-y-6 pb-8 animate-fade-in relative">
      
      {/* 1. Top KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPIS.map((kpi, idx) => (
          <KpiCard key={idx} kpi={kpi} />
        ))}
        <AiHealthCard />
      </div>

      {/* 2. Middle Section: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cash Flow Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Cash Flow</h3>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 text-xs font-medium">
                    <button 
                        onClick={() => setCfPeriod('6m')}
                        className={`px-3 py-1 rounded-md transition-all ${cfPeriod === '6m' ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Last 6 Months
                    </button>
                    <button 
                        onClick={() => setCfPeriod('12m')}
                        className={`px-3 py-1 rounded-md transition-all ${cfPeriod === '12m' ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Last 12 Months
                    </button>
                </div>
            </div>
            
            {/* Custom CSS Bar Chart */}
            <div className="h-64 flex items-end justify-between space-x-2 sm:space-x-4 px-2">
                {CASH_FLOW_DATA.map((data, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center space-y-2 group">
                         {/* Bars Container */}
                         <div className="w-full flex space-x-1 justify-center items-end h-full relative">
                             {/* Cash In Bar */}
                             <div 
                                style={{ height: `${data.in}%` }} 
                                className="w-3 sm:w-5 bg-primary-500 rounded-t-sm opacity-90 group-hover:opacity-100 transition-all relative"
                             >
                                 {/* Tooltip */}
                                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
                                     In: {data.in}L
                                 </div>
                             </div>
                             {/* Cash Out Bar */}
                             <div 
                                style={{ height: `${data.out}%` }} 
                                className="w-3 sm:w-5 bg-gray-300 dark:bg-gray-600 rounded-t-sm opacity-90 group-hover:opacity-100 transition-all relative"
                             >
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
                                     Out: {data.out}L
                                 </div>
                             </div>
                         </div>
                         {/* Label */}
                         <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{data.month}</span>
                    </div>
                ))}
            </div>
            
            <div className="flex justify-center mt-6 space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                    <span className="w-3 h-3 bg-primary-500 rounded-full mr-2"></span>
                    Cash In
                </div>
                <div className="flex items-center">
                    <span className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full mr-2"></span>
                    Cash Out
                </div>
            </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-6">Expense Breakdown</h3>
            <div className="flex-1 flex flex-col items-center justify-center">
                 {/* CSS Conic Gradient Donut */}
                 <div 
                    className="w-48 h-48 rounded-full relative"
                    style={{
                        background: `conic-gradient(
                            #3b82f6 0% 45%,
                            #ef4444 45% 65%,
                            #fb923c 65% 80%,
                            #22c55e 80% 90%,
                            #9ca3af 90% 100%
                        )`
                    }}
                 >
                     {/* Center Cutout */}
                     <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center flex-col">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">₹ 28.2L</span>
                     </div>
                 </div>

                 {/* Legend */}
                 <div className="w-full mt-8 space-y-2">
                     {EXPENSE_DATA.map((item, idx) => (
                         <div key={idx} className="flex items-center justify-between text-sm">
                             <div className="flex items-center text-gray-600 dark:text-gray-300">
                                 <span className={`w-2.5 h-2.5 rounded-full mr-2 ${item.color}`}></span>
                                 {item.category}
                             </div>
                             <span className="font-medium text-gray-900 dark:text-white">{item.value}%</span>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
      </div>

      {/* 3. Bottom Row: Receivables/Payables & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Receivables & Payables */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Overview</h3>
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-700">
                  <div className="p-6">
                      <div className="flex items-center space-x-2 mb-4 text-green-600 dark:text-green-500">
                          <ArrowDownRight size={20} />
                          <span className="font-medium">Receivables</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">₹ 2,45,000</div>
                      <div className="text-sm text-gray-500 mb-4">Total Outstanding</div>
                      
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mb-2">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                      <div className="text-xs text-red-500 font-medium">
                          ₹ 45,000 Overdue
                      </div>
                  </div>
                  
                  <div className="p-6">
                      <div className="flex items-center space-x-2 mb-4 text-red-600 dark:text-red-500">
                          <ArrowUpRight size={20} />
                          <span className="font-medium">Payables</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">₹ 1,20,000</div>
                      <div className="text-sm text-gray-500 mb-4">Total Pending</div>

                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mb-2">
                          <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <div className="text-xs text-red-500 font-medium">
                          ₹ 10,000 Overdue
                      </div>
                  </div>
              </div>
          </div>

          {/* Action Center */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                   <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center">
                       <AlertTriangle size={20} className="text-primary-500 mr-2" />
                       Action Center
                   </h3>
                   <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold px-2 py-1 rounded-full">{ALERTS.length} New</span>
              </div>
              <div className="space-y-3">
                  {ALERTS.map((alert) => (
                      <div 
                        key={alert.id} 
                        onClick={() => setSelectedAlert(alert)}
                        className="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600 group"
                      >
                          <div className={`mt-0.5 mr-3 flex-shrink-0 ${
                              alert.type === 'critical' ? 'text-red-500' : 
                              alert.type === 'warning' ? 'text-orange-500' : 'text-blue-500'
                          }`}>
                              {alert.type === 'critical' ? <AlertTriangle size={16} fill="currentColor" fillOpacity={0.2} /> : 
                               alert.type === 'warning' ? <Clock size={16} /> : <CheckCircle2 size={16} />}
                          </div>
                          <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                  {alert.text}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">{alert.time}</p>
                          </div>
                          <div className="text-gray-300 group-hover:text-primary-500 transition-colors">
                              <Sparkles size={14} />
                          </div>
                      </div>
                  ))}
              </div>
              <button className="w-full mt-4 py-2 text-sm font-medium text-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors border-t border-gray-100 dark:border-gray-700">
                  View All Actions
              </button>
          </div>
      </div>

      {/* 4. Recent Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Recent Transactions</h3>
              <div className="flex items-center space-x-2">
                  <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        className="pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:outline-none w-32 sm:w-48 dark:text-white"
                      />
                  </div>
                  <button className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Filter size={16} />
                  </button>
                  <button className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Download size={16} />
                  </button>
              </div>
          </div>
          
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                      <tr>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Transaction ID</th>
                          <th className="px-6 py-3">Party Name</th>
                          <th className="px-6 py-3">Type</th>
                          <th className="px-6 py-3 text-right">Amount</th>
                          <th className="px-6 py-3 text-center">Status</th>
                          <th className="px-6 py-3"></th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                      {TRANSACTIONS.map((txn) => (
                          <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4">{txn.date}</td>
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{txn.id}</td>
                              <td className="px-6 py-4">{txn.party}</td>
                              <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                      txn.type === 'Invoice' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                      txn.type === 'Bill' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                      txn.type === 'Expense' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                  }`}>
                                      {txn.type}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-right font-semibold">{txn.amount}</td>
                              <td className="px-6 py-4 text-center">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                      txn.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' :
                                      txn.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30' :
                                      txn.status === 'Overdue' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30' :
                                      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30'
                                  }`}>
                                      {txn.status}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                      <MoreVertical size={16} />
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex justify-center">
              <button className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">View All Transactions</button>
          </div>
      </div>

      {/* Alert Popup Modal */}
      <AlertPopup alert={selectedAlert} onClose={() => setSelectedAlert(null)} />

    </div>
  );
};

export default Dashboard;
