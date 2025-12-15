
import React from 'react';
import { X, Copy, Sparkles, CheckCircle2, AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react';

interface AiExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const AiExplanationModal: React.FC<AiExplanationModalProps> = ({ isOpen, onClose, title }) => {
  if (!isOpen) return null;

  const handleCopy = () => {
    alert('Explanation copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-primary-50 dark:bg-primary-900/10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Explanation</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Analysis for {title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Highlights */}
          <section>
            <h3 className="flex items-center text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
              <CheckCircle2 size={16} className="mr-2 text-green-500" /> Key Highlights
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 ml-6 list-disc">
              <li>Total value has increased by <strong>12%</strong> compared to the previous period.</li>
              <li>Operational efficiency is rated <strong>High</strong> based on current ratios.</li>
              <li>Top performing category contributes <strong>45%</strong> to the total volume.</li>
            </ul>
          </section>

          {/* Trends */}
          <section>
            <h3 className="flex items-center text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
              <TrendingUp size={16} className="mr-2 text-blue-500" /> Trends
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              We are observing a consistent upward trend in gross margins over the last 3 months. However, administrative costs have seen a slight spike due to recent one-time activities. The overall trajectory remains positive with stable forecasts.
            </p>
          </section>

          {/* Risks */}
          <section>
            <h3 className="flex items-center text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
              <AlertTriangle size={16} className="mr-2 text-red-500" /> Risks & Red Flags
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 ml-6 list-disc">
              <li><strong>2 Items/Accounts</strong> are currently flagged for review.</li>
              <li>Outstanding balances &gt; 60 days have increased by <strong>5%</strong>.</li>
              <li>Unreconciled transactions detected in the current period.</li>
            </ul>
          </section>

          {/* Suggested Actions */}
          <section className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
            <h3 className="flex items-center text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-3">
              <Lightbulb size={16} className="mr-2" /> Suggested Actions
            </h3>
            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400 ml-6 list-disc">
              <li>Initiate follow-ups for overdue items immediately.</li>
              <li>Review low-performing categories to optimize allocation.</li>
              <li>Analyze recent spikes in expenses to identify cost-saving opportunities.</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl flex justify-end gap-3">
          <button onClick={handleCopy} className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
            <Copy size={16} className="mr-2" /> Copy Summary
          </button>
          <button onClick={onClose} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiExplanationModal;
