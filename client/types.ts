
import { LucideIcon } from 'lucide-react';

export enum PageId {
  DASHBOARD = 'dashboard',
  SALES = 'sales',
  PURCHASES = 'purchases',
  ACCOUNTING = 'accounting',
  INVENTORY = 'inventory',
  PAYROLL = 'payroll',
  COMPLIANCE = 'compliance',
  REPORTS = 'reports',
  AI_ASSISTANT = 'ai_assistant',
  SETTINGS = 'settings',
  PRODUCTIVITY = 'productivity',
}

export interface NavItem {
  id: PageId;
  label: string;
  icon: LucideIcon;
  description: string;
}

export type Period = 'This Month' | 'Last Month' | 'This Quarter' | 'Financial Year';

export interface Company {
  id: string;
  name: string;
}

// --- Accounting & CRM Models ---

export type LedgerGroup = 
  | 'Sundry Debtors' 
  | 'Sundry Creditors' 
  | 'Bank Accounts' 
  | 'Cash-in-Hand' 
  | 'Sales Accounts' 
  | 'Purchase Accounts' 
  | 'Direct Income' 
  | 'Indirect Income' 
  | 'Direct Expenses' 
  | 'Indirect Expenses' 
  | 'Fixed Assets' 
  | 'Duties & Taxes' 
  | 'Capital Account' 
  | 'Loans (Liability)' 
  | 'Current Liabilities' 
  | 'Current Assets'
  | 'Suspense Account';

export type BalanceType = 'Dr' | 'Cr';

// 2) Ledger Model
export interface Ledger {
  id: string; // UUID
  ledgerName: string;
  ledgerCode: string;
  group: LedgerGroup;
  openingBalance: number;
  balanceType: BalanceType;
  gstApplicable: boolean;
  hsnSac?: string;
  contactMeta?: {
    email?: string;
    phone?: string;
    address?: string;
    gstin?: string; // Added for matching logic
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// 1) Customer Model
export interface Customer {
  id: string; // UUID
  name: string;
  displayName?: string;
  gstin: string;
  pan?: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  shippingAddress?: string;
  defaultPaymentTerms?: string; // e.g., "Net 30"
  defaultPlaceOfSupply?: string; // State Code or Name
  ledgerId?: string; // Foreign Key to Ledger Model (Optional if Create Ledger is off)
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Input DTO for creating a customer
export interface CustomerInput {
  name: string;
  displayName?: string;
  gstin: string;
  pan?: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  shippingAddress?: string;
  defaultPaymentTerms?: string;
  defaultPlaceOfSupply?: string;
  
  // Ledger creation fields
  createLedger: boolean;
  ledgerCode?: string;
  openingBalance?: number;
  balanceType?: BalanceType;
  notes?: string;
  
  // Linking existing
  existingLedgerId?: string;
}

// Audit Log
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: 'Auto-Create' | 'Link' | 'Merge' | 'Sync' | 'Import' | 'Delete';
  entity: 'Customer' | 'Ledger';
  description: string;
  status: 'Success' | 'Failed' | 'Skipped';
  details?: string;
  user?: string;
}

export interface MergeResult {
  primaryId: string;
  mergedIds: string[];
  auditLog: AuditLogEntry;
  consolidatedBalance: number;
}

// --- Permissions ---

export type PermissionType = 
  | 'customer.view'
  | 'customer.create'
  | 'customer.edit'
  | 'customer.delete'
  | 'customer.merge'
  | 'customer.import'
  | 'customer.export'
  | 'ledger.create';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: PermissionType[];
}
