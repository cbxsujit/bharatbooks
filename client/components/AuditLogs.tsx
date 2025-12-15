
import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  User
} from 'lucide-react';
import { AuditLogEntry } from '../types';

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
    { id: '1', timestamp: new Date(2024, 0, 15, 10, 30), action: 'Auto-Create', entity: 'Ledger', description: 'Created ledger for Acme Traders', status: 'Success', user: 'Admin' },
    { id: '2', timestamp: new Date(2024, 0, 15, 10, 30), action: 'Link', entity: 'Customer', description: 'Linked Acme Traders to existing ledger', status: 'Success', user: 'Admin' },
    { id: '3', timestamp: new Date(2024, 0, 18, 14, 20), action: 'Merge', entity: 'Customer', description: 'Merged duplicate customer records', status: 'Success', details: 'Merged ID-102 into ID-101', user: 'Manager' },
    { id: '4', timestamp: new Date(2024, 0, 20, 9, 15), action: 'Sync', entity: 'Ledger', description: 'Run manual sync for missing ledgers', status: 'Skipped', details: 'No missing links found', user: 'Admin' },
    { id: '5', timestamp: new Date(2024, 0, 22, 11, 0), action: 'Delete', entity: 'Customer', description: 'Deleted inactive customer', status: 'Success', user: 'Admin' }
];

const AuditLogs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [logs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);

  const filteredLogs = logs.filter(log => 
     log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
     log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
     log.user?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Audit Logs</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track changes and system activities.</p>
            </div>
            
            <div className="flex gap-3">
                 <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search logs..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white w-64"
                    />
                </div>
                <button className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <Filter size={18} />
                </button>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                    <tr>
                        <th className="px-6 py-3">Timestamp</th>
                        <th className="px-6 py-3">Action</th>
                        <th className="px-6 py-3">Entity</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                    {filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                {log.timestamp.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 font-medium">
                                <span className={`px-2 py-0.5 rounded text-xs border ${
                                    log.action === 'Delete' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30' :
                                    log.action === 'Merge' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30' :
                                    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30'
                                }`}>
                                    {log.action}
                                </span>
                            </td>
                            <td className="px-6 py-4">{log.entity}</td>
                            <td className="px-6 py-4">
                                <p>{log.description}</p>
                                {log.details && <p className="text-xs text-gray-500 mt-0.5">{log.details}</p>}
                            </td>
                            <td className="px-6 py-4 flex items-center gap-2">
                                <User size={14} className="text-gray-400" /> {log.user || 'System'}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {log.status === 'Success' ? (
                                    <span className="text-green-600 flex justify-center"><CheckCircle2 size={18} /></span>
                                ) : log.status === 'Skipped' ? (
                                    <span className="text-gray-400 flex justify-center"><Clock size={18} /></span>
                                ) : (
                                    <span className="text-red-600 flex justify-center"><AlertCircle size={18} /></span>
                                )}
                            </td>
                        </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-500">No logs found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default AuditLogs;
