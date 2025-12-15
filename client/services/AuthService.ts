
import { Role, PermissionType } from '../types';

const ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full access to all features',
    permissions: [
      'customer.view', 'customer.create', 'customer.edit', 'customer.delete', 
      'customer.merge', 'customer.import', 'customer.export', 'ledger.create'
    ]
  },
  {
    id: 'accountant',
    name: 'Accountant',
    description: 'Manage financial records',
    permissions: [
      'customer.view', 'customer.create', 'customer.edit', 'customer.import', 'customer.export', 'ledger.create'
    ]
  },
  {
    id: 'sales',
    name: 'Sales Executive',
    description: 'Sales operations only',
    permissions: [
      'customer.view', 'customer.create'
    ]
  }
];

// Mock session state
let currentRoleId = 'admin';

export const AuthService = {
  getRoles: () => ROLES,
  
  getCurrentRole: () => ROLES.find(r => r.id === currentRoleId) || ROLES[0],
  
  switchRole: (roleId: string) => {
    currentRoleId = roleId;
  },
  
  hasPermission: (permission: PermissionType): boolean => {
    const role = ROLES.find(r => r.id === currentRoleId);
    return role ? role.permissions.includes(permission) : false;
  }
};
