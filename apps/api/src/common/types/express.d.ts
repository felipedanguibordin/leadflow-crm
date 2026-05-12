import type { DelinquencySnapshot } from '../../finance/delinquency.types';

declare global {
  namespace Express {
    interface Request {
      /** Populated by `DelinquencyContextMiddleware` on scoped routes. */
      delinquency?: DelinquencySnapshot;
    }
  }
}

export {};
