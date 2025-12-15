
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Bot, 
  User, 
  Sparkles, 
  BarChart3, 
  Download,
  Search,
  ShoppingCart,
  ShoppingBag,
  Package,
  BookOpen,
  Scale,
  Users,
  ChevronRight,
  ChevronDown,
  PlayCircle
} from 'lucide-react';

// --- Types ---

type MessageType = 'text' | 'table' | 'chart';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  type?: MessageType;
  data?: any;
}

interface ExplorerCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  queries: string[];
}

// --- Mock Data ---

const EXPLORER_DATA: ExplorerCategory[] = [
  {
    id: 'sales',
    label: 'Sales',
    icon: ShoppingCart,
    queries: [
      "Who are my top 5 customers?",
      "Show sales trend for this year",
      "List invoices overdue > 30 days",
      "What is the total revenue this month?"
    ]
  },
  {
    id: 'purchases',
    label: 'Purchases',
    icon: ShoppingBag,
    queries: [
      "Show top vendors by spend",
      "List unpaid purchase bills",
      "Expense breakdown by category",
      "Show recent big purchases (> ₹50k)"
    ]
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Package,
    queries: [
      "Which items are low on stock?",
      "Show stock valuation report",
      "List non-moving items (90 days)",
      "Top selling items this quarter"
    ]
  },
  {
    id: 'ledger',
    label: 'Ledger & Banking',
    icon: BookOpen,
    queries: [
      "Show cash flow for last 6 months",
      "Current bank balances",
      "Recent high value transactions",
      "Show P&L summary"
    ]
  },
  {
    id: 'gst',
    label: 'GST & Compliance',
    icon: Scale,
    queries: [
      "GSTR-1 filing status",
      "Show Input Tax Credit summary",
      "Estimated tax liability for Jan",
      "List vendors with missing GSTIN"
    ]
  },
  {
    id: 'payroll',
    label: 'Payroll',
    icon: Users,
    queries: [
      "Total salary cost for last month",
      "Employee attendance summary",
      "Pending expense reimbursements",
      "Show payroll tax liability"
    ]
  }
];

// Mock Data Sets
const MOCK_SALES_TABLE = {
  headers: ["Customer", "Invoices", "Revenue", "Status"],
  rows: [
    ["Acme Traders", "12", "₹ 4,50,000", "Active"],
    ["Global Exports", "8", "₹ 2,45,000", "Active"],
    ["Tech Solutions", "5", "₹ 1,20,000", "Pending"],
    ["Sharma Enterprises", "3", "₹ 85,000", "Active"],
    ["Rapid Logistics", "2", "₹ 42,000", "Inactive"]
  ]
};

const MOCK_INVENTORY_TABLE = {
  headers: ["Item Name", "Current Stock", "Reorder Level", "Status"],
  rows: [
    ["Wireless Mouse", "0", "10", "Out of Stock"],
    ["Office Chair", "4", "10", "Low Stock"],
    ["Dell XPS 15", "24", "5", "In Stock"],
    ["Teak Wood Plank", "1500", "200", "In Stock"]
  ]
};

const MOCK_PAYROLL_TABLE = {
  headers: ["Employee", "Designation", "Net Salary", "Status"],
  rows: [
    ["Rajesh Kumar", "Sr. Developer", "₹ 85,000", "Paid"],
    ["Sneha Gupta", "UI Designer", "₹ 75,000", "Paid"],
    ["Amit Singh", "Sales Manager", "₹ 1,20,000", "Processing"],
    ["Priya Sharma", "HR Exec", "₹ 45,000", "Paid"]
  ]
};

const MOCK_TREND_CHART = [
  { label: "Aug", value: 45 },
  { label: "Sep", value: 52 },
  { label: "Oct", value: 38 },
  { label: "Nov", value: 65 },
  { label: "Dec", value: 58 },
  { label: "Jan", value: 72 },
];

const MOCK_CASH_FLOW_CHART = [
  { label: "Week 1", value: 30 },
  { label: "Week 2", value: 45 },
  { label: "Week 3", value: 25 },
  { label: "Week 4", value: 60 },
];

// --- Helper Functions ---

const calculateHealthScore = () => {
  // Mock logic: 50 Base + 12.5 Growth + 15 Profit - 5.5 Overdue
  const baseScore = 50;
  const revenueGrowth = 12.5;
  const profitBonus = 15;
  const overduePenalty = 5.5;
  return Math.min(100, Math.max(0, Math.round(baseScore + revenueGrowth + profitBonus - overduePenalty)));
};

const getAiResponse = (query: string): Partial<Message> => {
  const lowerQuery = query.toLowerCase();

  // 0. Financial Health Score
  if (lowerQuery.match(/health|score/)) {
    const score = calculateHealthScore();
    return {
      type: 'table',
      text: `Your Financial Health Score is **${score}/100** (Healthy).\n\n• **Revenue Growth**: +12.5% month-over-month.\n• **Profit Margin**: Healthy at ~33%.\n• **Action Item**: 5 overdue invoices are impacting your score.`,
      data: {
        headers: ["Month", "Score", "Status"],
        rows: [
          ["Jan 2024", "72", "Healthy"],
          ["Dec 2023", "68", "Needs Attention"],
          ["Nov 2023", "65", "Needs Attention"]
        ]
      }
    };
  }

  // 1. Sales & Customers
  if (lowerQuery.match(/customer|sales|invoice|revenue/)) {
    if (lowerQuery.includes('trend') || lowerQuery.includes('chart') || lowerQuery.includes('growth')) {
        return { type: 'chart', text: "Here is the sales trend visualization for the last 6 months:", data: MOCK_TREND_CHART };
    }
    if (lowerQuery.includes('overdue')) {
        return { type: 'text', text: "You have 5 overdue invoices totaling ₹ 45,000. Major pending amount is from 'Global Exports'." };
    }
    return { type: 'table', text: "Here are your top customers based on revenue generated:", data: MOCK_SALES_TABLE };
  }

  // 2. Inventory & Stock
  if (lowerQuery.match(/stock|inventory|item|product/)) {
    if (lowerQuery.includes('value') || lowerQuery.includes('valuation')) {
        return { type: 'text', text: "Total Inventory Value is ₹ 18,45,000. The highest value category is 'Finished Goods'." };
    }
    return { type: 'table', text: "Here is the current stock status. Attention needed for items marked 'Low Stock' or 'Out of Stock'.", data: MOCK_INVENTORY_TABLE };
  }

  // 3. Purchases, Expenses & GST
  if (lowerQuery.match(/purchase|vendor|bill|expense|2b|gst|tax/)) {
     if (lowerQuery.includes('2b')) {
         return { type: 'text', text: "GSTR-2B reconciliation for Jan 2024 shows 3 mismatched invoices and 2 missing invoices. Please check the Compliance module." };
     }
     if (lowerQuery.includes('expense')) {
         return { type: 'text', text: "Total expenses for this month are ₹ 2,80,000. Top category is 'Salaries' (45%)." };
     }
     return { type: 'table', text: "Here is a summary of your top vendors by spend:", data: {
         headers: ["Vendor", "Spend (YTD)", "Pending Bills"],
         rows: [["Tech Solutions", "₹ 12.5L", "2"], ["Office Supplies Co.", "₹ 3.2L", "0"], ["Furniture Mart", "₹ 1.5L", "1"]]
     }};
  }

  // 4. Reports & P&L
  if (lowerQuery.match(/profit|loss|p&l|balance sheet|report|financial/)) {
    return { type: 'chart', text: "Your Net Profit has grown by 12% compared to last month. Here is the trend:", data: MOCK_TREND_CHART };
  }

  // 5. Cash & Bank
  if (lowerQuery.match(/cash|bank|money|flow/)) {
    return { type: 'chart', text: "Cash flow analysis (Inflow vs Outflow) for the current month:", data: MOCK_CASH_FLOW_CHART };
  }

  // 6. Payroll
  if (lowerQuery.match(/employee|salary|payroll|staff/)) {
    return { type: 'table', text: "Here is the payroll summary for January 2024:", data: MOCK_PAYROLL_TABLE };
  }

  // Default Fallback
  const fallbackResponses = [
    "I can help you with Sales, Inventory, Compliance, and more. Try asking 'Show me top customers' or 'Check stock levels'.",
    "I'm not sure about that specific query, but I can show you your Dashboard or Reports.",
    "Could you please clarify? I can fetch data for Invoices, Items, Ledgers, and Taxes."
  ];
  
  return {
    type: 'text',
    text: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
  };
};

// --- Components ---

const AiAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      text: "Welcome to the full-screen Data Explorer. Select a category on the left to start digging into your business data, or type your query below.",
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>('sales');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // 1. Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);

    // 2. Process AI Response
    setTimeout(() => {
      const response = getAiResponse(text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: response.text || "I'm processing your request.",
        timestamp: new Date(),
        type: response.type,
        data: response.data
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  // Renderers
  const renderTable = (data: { headers: string[]; rows: string[][] }) => (
    <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm max-w-3xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-700">
            <tr>
              {data.headers.map((h, i) => (
                <th key={i} className="px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700 flex justify-end">
        <button className="text-xs flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium transition-colors bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg shadow-sm">
          <Download size={14} className="mr-1.5" /> Export to CSV
        </button>
      </div>
    </div>
  );

  const renderChart = (data: typeof MOCK_TREND_CHART) => (
    <div className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm max-w-3xl">
      <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase mb-6 flex items-center">
        <BarChart3 size={16} className="mr-2 text-primary-500" />
        Trend Analysis
      </h4>
      <div className="flex items-end justify-between h-48 space-x-4 px-2">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center group">
            <div className="w-full relative flex items-end h-full bg-gray-100 dark:bg-gray-700 rounded-t-lg overflow-hidden">
               <div 
                  className="w-full bg-primary-500/90 hover:bg-primary-500 transition-all duration-700 ease-out rounded-t-lg absolute bottom-0"
                  style={{ height: `${item.value}%` }}
               >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap">
                      Value: {item.value}
                  </div>
               </div>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-3">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-full gap-6 animate-fade-in">
      
      {/* Left Panel: Data Explorer */}
      <div className="w-80 flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden shrink-0">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <Search size={20} className="mr-2 text-primary-600" />
                  Data Explorer
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select a category to view quick insights</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {EXPLORER_DATA.map(category => {
                  const isActive = activeCategory === category.id;
                  return (
                      <div key={category.id} className="rounded-lg overflow-hidden">
                          <button 
                              onClick={() => setActiveCategory(isActive ? null : category.id)}
                              className={`w-full flex items-center justify-between p-3 transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'}`}
                          >
                              <div className="flex items-center font-medium text-sm">
                                  <category.icon size={18} className="mr-3 opacity-80" />
                                  {category.label}
                              </div>
                              {isActive ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                          
                          {/* Sub-queries */}
                          {isActive && (
                              <div className="bg-gray-50/50 dark:bg-gray-900/30 p-2 space-y-1 animate-fade-in">
                                  {category.queries.map((q, i) => (
                                      <button 
                                          key={i}
                                          onClick={() => handleSend(q)}
                                          className="w-full text-left text-xs py-2 px-3 rounded-md text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-sm transition-all flex items-start group"
                                      >
                                          <PlayCircle size={12} className="mr-2 mt-0.5 opacity-0 group-hover:opacity-100 text-primary-500 transition-opacity" />
                                          {q}
                                      </button>
                                  ))}
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>
      </div>

      {/* Right Panel: Chat Interface */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/30 dark:bg-gray-900/30">
              <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400">
                      <Bot size={24} />
                  </div>
                  <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">BharatBooks AI</h2>
                      <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                          Assistant Online
                      </div>
                  </div>
              </div>
              <button 
                onClick={() => setMessages([])}
                className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white underline"
              >
                  Clear Chat
              </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50 dark:bg-gray-950/30">
              {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex flex-col max-w-[90%] lg:max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          
                          <div className={`flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-primary-600 dark:text-primary-400'}`}>
                                  {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                              </div>

                              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                  msg.role === 'user' 
                                  ? 'bg-primary-600 text-white rounded-tr-none' 
                                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-tl-none'
                              }`}>
                                  {/* Support bold and line breaks for text */}
                                  <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>') }} />
                                  
                                  {msg.role === 'ai' && msg.type === 'table' && msg.data && renderTable(msg.data)}
                                  {msg.role === 'ai' && msg.type === 'chart' && msg.data && renderChart(msg.data)}

                                  <span className={`text-[10px] mt-2 block opacity-70 ${msg.role === 'user' ? 'text-primary-100 text-right' : 'text-gray-400'}`}>
                                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                              </div>
                          </div>
                      </div>
                  </div>
              ))}

              {isThinking && (
                  <div className="flex justify-start animate-fade-in">
                      <div className="flex flex-row gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center mt-1">
                              <Sparkles size={16} className="text-primary-500" />
                          </div>
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1.5">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                      </div>
                  </div>
              )}
              <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="relative max-w-4xl mx-auto">
                  <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about your business data (e.g., 'Show me top expenses', 'Create a sales invoice')..."
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl pl-4 pr-24 py-3.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white resize-none shadow-inner"
                      rows={1}
                      style={{ minHeight: '52px' }}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700" title="Attach File">
                          <Paperclip size={18} />
                      </button>
                      <button 
                          onClick={() => handleSend(inputValue)}
                          disabled={!inputValue.trim() || isThinking}
                          className="p-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors shadow-sm"
                      >
                          <Send size={18} />
                      </button>
                  </div>
              </div>
              <p className="text-[10px] text-center text-gray-400 mt-3">
                  AI responses are generated based on available data. Always verify critical financial information.
              </p>
          </div>

      </div>
    </div>
  );
};

export default AiAssistantPage;
