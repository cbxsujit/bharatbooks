
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Paperclip, 
  Bot, 
  User, 
  Sparkles,
  Download,
  BarChart3,
  Table as TableIcon,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Mic
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

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- Mock Data & Logic ---

const SUGGESTED_PROMPTS = [
  "Who is my top customer?",
  "Sales trend last 6 months",
  "Breakdown of expenses",
  "Show overdue invoices list"
];

const QUICK_INSIGHTS = [
  "Show my top 5 customers by revenue.",
  "List invoices overdue by more than 30 days.",
  "Summarize cash flow for last month.",
  "Compare sales vs expenses for this quarter.",
  "Show stock items running low."
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

const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      text: "Hello! I'm your BharatBooks AI assistant. Ask me anything about your finances, inventory, or compliance.",
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  // Focus input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

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
    // Close insights panel if open
    setIsInsightsOpen(false);

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
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  const handleVoiceClick = () => {
    alert("Voice query feature coming soon.");
    setInputValue("What are my total sales for this month?");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // --- Render Content Blocks ---

  const renderTable = (data: typeof MOCK_SALES_TABLE) => (
    <div className="mt-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold">
            <tr>
              {data.headers.map((h, i) => (
                <th key={i} className="px-3 py-2 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.rows.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}>
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end">
        <button className="text-xs flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium transition-colors">
          <Download size={12} className="mr-1" /> Export CSV
        </button>
      </div>
    </div>
  );

  const renderChart = (data: typeof MOCK_TREND_CHART) => (
    <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-4 flex items-center">
        <BarChart3 size={14} className="mr-1.5" />
        AI Suggested Chart
      </h4>
      <div className="flex items-end justify-between h-32 space-x-2">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center group">
            <div className="w-full relative flex items-end h-full">
               <div 
                  className="w-full bg-primary-500/80 hover:bg-primary-500 rounded-t-sm transition-all duration-500 ease-out"
                  style={{ height: `${item.value}%` }}
               ></div>
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-2">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[60] w-full sm:w-[450px] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">AI Assistant</h2>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                Online
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Insights Panel */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <button 
                onClick={() => setIsInsightsOpen(!isInsightsOpen)}
                className="w-full flex items-center justify-between p-3 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
                <div className="flex items-center">
                    <Lightbulb size={14} className="mr-2 text-yellow-500" />
                    Quick Insights
                </div>
                {isInsightsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {isInsightsOpen && (
                <div className="p-3 pt-0 grid grid-cols-1 gap-2 bg-white dark:bg-gray-900 animate-fade-in pb-4">
                    {QUICK_INSIGHTS.map((insight, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSend(insight)}
                            className="text-left px-3 py-2 rounded-full border border-primary-200 dark:border-primary-900 text-primary-700 dark:text-primary-400 text-xs hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors truncate"
                        >
                            {insight}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-gray-950/50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Avatar & Bubble Row */}
                <div className={`flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${msg.role === 'user' ? 'bg-primary-600 text-white ml-2' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mr-2'}`}>
                      {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} className="text-primary-500" />}
                    </div>

                    {/* Bubble */}
                    <div 
                      className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-primary-600 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-tl-none'
                      }`}
                    >
                      {/* Render Text (with simple markdown bold support) */}
                      <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>') }} />
                      
                      {/* Render Rich Content based on Type */}
                      {msg.role === 'ai' && msg.type === 'table' && msg.data && renderTable(msg.data)}
                      {msg.role === 'ai' && msg.type === 'chart' && msg.data && renderChart(msg.data)}

                      <span className={`text-[10px] mt-1 block ${msg.role === 'user' ? 'text-primary-200' : 'text-gray-400'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                </div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start">
               <div className="flex flex-row items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center mr-2 mt-1">
                      <Sparkles size={14} className="text-primary-500" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          {/* Suggested Chips */}
          {messages.length < 3 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 pb-1">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300 hover:bg-primary-50 hover:border-primary-200 dark:hover:bg-primary-900/20 dark:hover:border-primary-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything... (e.g., 'Show sales trend', 'List top customers')"
              rows={1}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl pl-4 pr-28 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white resize-none no-scrollbar"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            
            <div className="absolute right-2 bottom-1.5 flex items-center space-x-1">
              <button 
                onClick={handleVoiceClick}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Voice Input"
              >
                <Mic size={18} />
              </button>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                <Paperclip size={18} />
              </button>
              <button 
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim() || isThinking}
                className="p-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors shadow-sm"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-center text-gray-400 mt-2">
            AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </>
  );
};

export default AiAssistantDrawer;
