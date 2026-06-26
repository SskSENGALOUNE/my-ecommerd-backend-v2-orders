export interface DbHealthResult {
  engine: string;
  status: 'ok' | 'error';
  permissions?: {
    select?: boolean;
    insert?: boolean;
    update?: boolean;
    delete?: boolean;
  };
  error?: string;
}
