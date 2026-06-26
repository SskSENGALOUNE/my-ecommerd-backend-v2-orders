import { DbHealthResult } from '../health-check/db-health-result';

export interface DatabaseHealthPort {
  checkAll(): Promise<DbHealthResult[]>;
}
