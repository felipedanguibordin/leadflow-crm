export type DelinquencySnapshot = {
  organizationId: string;
  blocked: boolean;
  pendingPayables: number;
  overduePayables: number;
  reasons: string[];
};
