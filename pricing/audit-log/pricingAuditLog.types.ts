export interface PricingAuditEvent {
  id: string;
  actor_role: string;
  actor_id?: string;
  action: string;
  module: string;
  details: string;
  created_at: Date;
}

export interface CreateAuditEventInput {
  actor_role: string;
  actor_id?: string;
  action: string;
  module: string;
  details: string;
}
