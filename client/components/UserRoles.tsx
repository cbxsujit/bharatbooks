
import React, { useState } from 'react';
import { 
  Shield, 
  User, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  AlertTriangle
} from 'lucide-react';
import { AuthService } from '../services/AuthService';
import { Role, PermissionType } from '../types';

const PERMISSION_LABELS: Record<PermissionType, string> = {
  'customer.view': 'View Customers',
  'customer.create': 'Create Customers',
  'customer.edit': 'Edit Customers',
  'customer.delete': 'Delete Customers',
  'customer.merge': 'Merge Customers',
  'customer.import': 'Import Data',
  'customer.export': 'Export Data',
  'ledger.create': 'Create Ledgers'
};

const UserRoles: React.FC = () => {
  const [roles] = useState<Role[]>(AuthService.getRoles());
  const [currentRole, setCurrentRole] = useState<Role>(AuthService.getCurrentRole());

  const handleRoleSwitch = (roleId: string) => {
    AuthService.switchRole(roleId);
    setCurrentRole(AuthService.getCurrentRole());
    // In a real app, context would handle update, here we rely on re-mounts of other components
    alert(`Switched active role to ${roles.find(r => r.id === roleId)?.name}. Navigate to "Master Data" or "Sales" to test permissions.`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Users & Roles</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage access control and permissions.</p>
        </div>
        
        {/* Simulation Tool */}
        <div className="flex items-center space-x-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-4 py-2 rounded-lg">
            <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Simulate Role:</span>
            <select 
                value={currentRole.id}
                onChange={(e) => handleRoleSwitch(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {roles.map(role => (
              <div 
                key={role.id} 
                className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden transition-all ${currentRole.id === role.id ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-200 dark:border-gray-700'}`}
              >
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${role.id === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                              {role.id === 'admin' ? <Lock size={20} /> : <User size={20} />}
                          </div>
                          <div>
                              <h3 className="font-bold text-gray-900 dark:text-white">{role.name}</h3>
                              <p className="text-xs text-gray-500">{role.description}</p>
                          </div>
                      </div>
                      {currentRole.id === role.id && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">Active</span>
                      )}
                  </div>
                  
                  <div className="p-4 space-y-3">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Permissions</h4>
                      {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
                          const hasPerm = role.permissions.includes(key as PermissionType);
                          return (
                              <div key={key} className="flex items-center justify-between text-sm">
                                  <span className={`flex items-center ${hasPerm ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}`}>
                                      {hasPerm ? <CheckCircle2 size={14} className="mr-2 text-green-500" /> : <XCircle size={14} className="mr-2" />}
                                      {label}
                                  </span>
                              </div>
                          );
                      })}
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default UserRoles;
