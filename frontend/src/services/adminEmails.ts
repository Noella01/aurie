import { apiRequest } from './http';

export type AdminCustomer = { id: string; name: string; email: string; created_at: string };
export type AdminEmailStatus = { configured: boolean; sender_email: string };
export type AdminEmailLog = {
  id: string;
  customer_id: string;
  customer_name: string | null;
  recipient_email: string;
  subject: string;
  status: 'SENDING' | 'SENT' | 'FAILED' | 'UNKNOWN';
  failure_code: string | null;
  created_at: string;
  sent_at: string | null;
};

export async function getAdminCustomers(search = '', limit = 50, offset = 0) {
  const query = new URLSearchParams({ search, limit: String(limit), offset: String(offset) });
  return apiRequest<{ customers: AdminCustomer[]; total: number; limit: number; offset: number }>(`/api/admin/customers?${query}`);
}

export function getAdminEmailStatus() {
  return apiRequest<AdminEmailStatus>('/api/admin/emails/status');
}

export async function getAdminEmailLogs(limit = 50) {
  const query = new URLSearchParams({ limit: String(limit) });
  return apiRequest<{ emails: AdminEmailLog[] }>(`/api/admin/emails?${query}`);
}

export function sendAdminEmail(
  input: { customer_id: string; subject: string; text: string },
  idempotencyKey: string,
) {
  return apiRequest<AdminEmailLog>('/api/admin/emails/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(input),
  });
}
