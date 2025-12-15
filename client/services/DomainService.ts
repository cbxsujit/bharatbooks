import { Customer, Ledger, CustomerInput, AuditLogEntry, MergeResult } from '../types';

// Helper to simulate UUID generation
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper to generate a simple ledger code
export const generateLedgerCode = (name: string): string => {
  if (!name) return '';
  const prefix = name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'GEN');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
};

// Levenshtein Distance for Fuzzy Matching
const levenshteinDistance = (a: string, b: string): number => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const calculateSimilarity = (s1: string, s2: string): number => {
  const longer = s1.length > s2.length ? s1 : s2;
  if (longer.length === 0) return 1.0;
  return (longer.length - levenshteinDistance(s1, s2)) / longer.length;
};

export interface MatchResult {
  matchFound: boolean;
  ledger?: Ledger;
  reason?: 'Exact GSTIN' | 'Exact Contact' | 'High Name Similarity';
  similarityScore?: number;
}

export const CustomerService = {
  
  /**
   * Intelligent Matching Logic
   */
  findMatchingLedger: (input: CustomerInput, existingLedgers: Ledger[]): MatchResult => {
    // 1. Exact GSTIN Match
    if (input.gstin) {
      const gstinMatch = existingLedgers.find(l => l.contactMeta?.gstin === input.gstin);
      if (gstinMatch) return { matchFound: true, ledger: gstinMatch, reason: 'Exact GSTIN' };
    }

    // 2. Exact Email/Phone Match
    if (input.email || input.phone) {
      const contactMatch = existingLedgers.find(l => 
        (input.email && l.contactMeta?.email === input.email) || 
        (input.phone && l.contactMeta?.phone === input.phone)
      );
      if (contactMatch) return { matchFound: true, ledger: contactMatch, reason: 'Exact Contact' };
    }

    // 3. Name Similarity (>90%)
    if (input.name) {
      const nameMatch = existingLedgers.find(l => {
         const score = calculateSimilarity(input.name.toLowerCase(), l.ledgerName.toLowerCase());
         return score > 0.9;
      });
      if (nameMatch) {
         return { 
           matchFound: true, 
           ledger: nameMatch, 
           reason: 'High Name Similarity',
           similarityScore: calculateSimilarity(input.name.toLowerCase(), nameMatch.ledgerName.toLowerCase())
         };
      }
    }

    return { matchFound: false };
  },

  /**
   * Create Customer with Link logic
   */
  createCustomerWithLedger: (input: CustomerInput, userId: string = 'system'): { customer: Customer, ledger?: Ledger } => {
    if (!input.name) throw new Error("Customer Name is required");

    const timestamp = new Date();
    let ledger: Ledger | undefined = undefined;
    let ledgerId: string | undefined = input.existingLedgerId; // Use existing if provided

    // If no existing ledger linked, and creation is enabled
    if (!ledgerId && input.createLedger) {
        ledgerId = generateUUID();
        ledger = {
          id: ledgerId,
          ledgerName: input.name,
          ledgerCode: input.ledgerCode || generateLedgerCode(input.name),
          group: 'Sundry Debtors',
          openingBalance: input.openingBalance || 0,
          balanceType: input.balanceType || 'Dr',
          gstApplicable: !!input.gstin,
          contactMeta: {
            email: input.email,
            phone: input.phone,
            address: input.billingAddress,
            gstin: input.gstin
          },
          createdBy: userId,
          createdAt: timestamp,
          updatedAt: timestamp
        };
    }

    const customer: Customer = {
      id: generateUUID(),
      name: input.name,
      displayName: input.displayName || input.name,
      gstin: input.gstin,
      pan: input.pan,
      email: input.email,
      phone: input.phone,
      billingAddress: input.billingAddress,
      shippingAddress: input.shippingAddress || input.billingAddress,
      defaultPaymentTerms: input.defaultPaymentTerms || 'Due on Receipt',
      defaultPlaceOfSupply: input.defaultPlaceOfSupply,
      ledgerId: ledgerId,
      createdBy: userId,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    return { customer, ledger };
  },

  /**
   * Admin Sync: Backfill missing links
   */
  runLedgerSync: (customers: Customer[], ledgers: Ledger[]): { 
    updatedCustomers: Customer[], 
    newLedgers: Ledger[], 
    logs: AuditLogEntry[] 
  } => {
    const logs: AuditLogEntry[] = [];
    const newLedgers: Ledger[] = [];
    const updatedCustomers: Customer[] = [];

    // 1. Check Customers without Ledger ID
    customers.forEach(cust => {
      if (!cust.ledgerId) {
        // Try to find match first
        const match = CustomerService.findMatchingLedger(
          { 
            name: cust.name, 
            gstin: cust.gstin, 
            email: cust.email, 
            phone: cust.phone, 
            billingAddress: cust.billingAddress, 
            shippingAddress: cust.shippingAddress, 
            createLedger: false 
          }, 
          ledgers
        );

        if (match.matchFound && match.ledger) {
          // Link to existing
          updatedCustomers.push({ ...cust, ledgerId: match.ledger.id });
          logs.push({
            id: generateUUID(),
            timestamp: new Date(),
            action: 'Link',
            entity: 'Customer',
            description: `Linked '${cust.name}' to existing ledger '${match.ledger.ledgerName}'`,
            status: 'Success',
            details: `Reason: ${match.reason}`
          });
        } else {
          // Create New Ledger
          const ledgerId = generateUUID();
          const newLedger: Ledger = {
            id: ledgerId,
            ledgerName: cust.name,
            ledgerCode: generateLedgerCode(cust.name),
            group: 'Sundry Debtors',
            openingBalance: 0,
            balanceType: 'Dr',
            gstApplicable: !!cust.gstin,
            contactMeta: { gstin: cust.gstin, email: cust.email, phone: cust.phone },
            createdBy: 'System Sync',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          newLedgers.push(newLedger);
          updatedCustomers.push({ ...cust, ledgerId });
          
          logs.push({
            id: generateUUID(),
            timestamp: new Date(),
            action: 'Auto-Create',
            entity: 'Ledger',
            description: `Created missing ledger for customer '${cust.name}'`,
            status: 'Success'
          });
        }
      }
    });

    return { updatedCustomers, newLedgers, logs };
  },

  /**
   * Merge Customers Logic
   */
  mergeCustomers: (
    primaryId: string, 
    secondaryIds: string[], 
    customers: (Customer & { outstandingBalance: number })[], // passing view model for bal calculation
    mergeBalances: boolean
  ): MergeResult => {
    const primaryRecord = customers.find(c => c.id === primaryId);
    if (!primaryRecord) throw new Error("Primary record not found");

    const secondaryRecords = customers.filter(c => secondaryIds.includes(c.id));
    
    let totalBalance = primaryRecord.outstandingBalance;
    
    if (mergeBalances) {
        const secondaryBalance = secondaryRecords.reduce((sum, c) => sum + c.outstandingBalance, 0);
        totalBalance += secondaryBalance;
    }

    const mergedNames = secondaryRecords.map(c => c.name).join(', ');

    const log: AuditLogEntry = {
        id: generateUUID(),
        timestamp: new Date(),
        action: 'Merge',
        entity: 'Customer',
        description: `Merged [${mergedNames}] into '${primaryRecord.name}'`,
        status: 'Success',
        details: `Secondary records soft-deleted. Balance ${mergeBalances ? 'consolidated' : 'ignored'}. New Balance: ${totalBalance}`
    };

    return {
        primaryId,
        mergedIds: secondaryIds,
        auditLog: log,
        consolidatedBalance: totalBalance
    };
  }
};
