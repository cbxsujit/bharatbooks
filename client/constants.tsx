import { 
  LayoutDashboard, 
  ShoppingCart, 
  ShoppingBag, 
  BookOpen, 
  Package, 
  Users, 
  Scale, 
  BarChart3, 
  Bot, 
  Settings, 
  CheckSquare 
} from 'lucide-react';
import { NavItem, PageId, Period, Company } from './types';

export const NAV_ITEMS: NavItem[] = [
  {
    id: PageId.DASHBOARD,
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview of your business performance, cash flow, and key metrics.',
  },
  {
    id: PageId.SALES,
    label: 'Sales & Invoicing',
    icon: ShoppingCart,
    description: 'Manage invoices, quotations, customers, and credit notes.',
  },
  {
    id: PageId.PURCHASES,
    label: 'Purchases & Expenses',
    icon: ShoppingBag,
    description: 'Track vendor bills, purchase orders, and operational expenses.',
  },
  {
    id: PageId.ACCOUNTING,
    label: 'Accounting & Ledger',
    icon: BookOpen,
    description: 'General ledger, journal entries, banking, and reconciliation.',
  },
  {
    id: PageId.INVENTORY,
    label: 'Inventory',
    icon: Package,
    description: 'Stock management, warehouses, stock adjustments, and item valuation.',
  },
  {
    id: PageId.PAYROLL,
    label: 'Payroll',
    icon: Users,
    description: 'Employee management, salary processing, and attendance tracking.',
  },
  {
    id: PageId.COMPLIANCE,
    label: 'Compliance & Tax',
    icon: Scale,
    description: 'GST returns, TDS filing, and statutory compliance reports.',
  },
  {
    id: PageId.REPORTS,
    label: 'Reports & Analytics',
    icon: BarChart3,
    description: 'Detailed financial statements, profit & loss, and balance sheets.',
  },
  {
    id: PageId.AI_ASSISTANT,
    label: 'AI Assistant',
    icon: Bot,
    description: 'Ask BharatBooks AI about your data, generate insights, or automate tasks.',
  },
  {
    id: PageId.SETTINGS,
    label: 'Settings & Admin',
    icon: Settings,
    description: 'Company profile, user management, preferences, and integrations.',
  },
  {
    id: PageId.PRODUCTIVITY,
    label: 'Productivity',
    icon: CheckSquare,
    description: 'Tasks, reminders, notes, and document management.',
  },
];

export const PERIOD_OPTIONS: Period[] = [
  'This Month',
  'Last Month',
  'This Quarter',
  'Financial Year',
];

export const DUMMY_COMPANIES: Company[] = [
  { id: '1', name: 'Acme Traders India Pvt Ltd' },
  { id: '2', name: 'Bharat Tech Solutions' },
  { id: '3', name: 'Global Exports & Co.' },
];