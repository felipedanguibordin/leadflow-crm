import type { DelinquencySnapshot } from '../delinquency.types';

/**
 * Pluggable rule engine for financial compliance.
 * Swap implementations (e.g. external billing API) without touching guards/controllers.
 */
export interface DelinquencyPolicy {
  evaluate(organizationId: string): Promise<DelinquencySnapshot>;
}

export const DELINQUENCY_POLICY = Symbol('DELINQUENCY_POLICY');
