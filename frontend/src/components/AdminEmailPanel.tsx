import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Mail, RefreshCw, Search, Send } from 'lucide-react';
import { ApiError } from '../services/http';
import {
  getAdminCustomers,
  getAdminEmailLogs,
  getAdminEmailStatus,
  sendAdminEmail,
  type AdminCustomer,
  type AdminEmailLog,
  type AdminEmailStatus,
} from '../services/adminEmails';

const PAGE_SIZE = 25;

export function AdminEmailPanel() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [total, setTotal] = useState(0);
  const [logs, setLogs] = useState<AdminEmailLog[]>([]);
  const [provider, setProvider] = useState<AdminEmailStatus | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);
  const requestRef = useRef<{ signature: string; key: string } | null>(null);
  const selected = customers.find(customer => customer.id === selectedId);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.allSettled([
      getAdminCustomers(appliedSearch, PAGE_SIZE, offset),
      getAdminEmailStatus(),
      getAdminEmailLogs(),
    ]).then(([customerResult, providerResult, logResult]) => {
      if (!active) return;
      const nextErrors: string[] = [];
      if (customerResult.status === 'fulfilled') {
        setCustomers(customerResult.value.customers);
        setTotal(customerResult.value.total);
      } else nextErrors.push(`Customers: ${customerResult.reason.message}`);
      if (providerResult.status === 'fulfilled') setProvider(providerResult.value);
      else nextErrors.push(`Email service: ${providerResult.reason.message}`);
      if (logResult.status === 'fulfilled') setLogs(logResult.value.emails);
      else nextErrors.push(`Email history: ${logResult.reason.message}`);
      setErrors(nextErrors);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [appliedSearch, offset, refresh]);

  function applySearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelectedId('');
    setOffset(0);
    setAppliedSearch(search.trim());
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setSending(true);
    setFeedback(null);
    const payload = { customer_id: selected.id, subject: subject.trim(), text: text.trim() };
    const signature = JSON.stringify(payload);
    if (requestRef.current?.signature !== signature) {
      requestRef.current = { signature, key: crypto.randomUUID() };
    }
    try {
      const result = await sendAdminEmail(payload, requestRef.current.key);
      if (result.status === 'SENT') {
        requestRef.current = null;
        setFeedback({ text: `Email accepted by Brevo for ${result.recipient_email}.`, error: false });
        setSubject('');
        setText('');
      } else {
        setFeedback({ text: `Email status is ${result.status}. Check the history before starting another attempt.`, error: true });
      }
      setRefresh(value => value + 1);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'EMAIL_DELIVERY_FAILED') requestRef.current = null;
      setFeedback({ text: error instanceof Error ? error.message : 'Email could not be sent.', error: true });
      setRefresh(value => value + 1);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      {errors.map(error => <p key={error} role="alert" className="flex items-center gap-2 border border-red-900/60 bg-red-950/30 p-3 text-sm text-red-300"><AlertCircle size={16} />{error}</p>)}
      {!provider?.configured && (
        <p role="status" className="border border-amber-900/60 bg-amber-950/20 p-4 text-sm text-amber-200">
          Email sending is not configured. Ask your backend operator to add the Brevo API key and verified sender address to the backend’s private environment.
        </p>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <div className="border border-[var(--tone-222222)] bg-[var(--tone-101010)] p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div><h2 className="text-lg font-semibold">Registered customers</h2><p className="mt-1 text-xs text-[var(--tone-a3a3a3)]">{total} accounts</p></div>
            <button type="button" onClick={() => setRefresh(value => value + 1)} disabled={loading} aria-label="Refresh email data" className="p-2 text-[var(--tone-a3a3a3)] hover:text-white disabled:opacity-50"><RefreshCw size={17} /></button>
          </div>
          <form onSubmit={applySearch} className="mb-4 flex gap-2">
            <label className="flex min-w-0 flex-1 items-center gap-2 border border-[var(--tone-333333)] px-3">
              <Search size={15} className="shrink-0 text-[var(--tone-737373)]" />
              <input value={search} onChange={event => setSearch(event.target.value)} maxLength={100} placeholder="Search name or email" className="w-full bg-transparent py-2.5 text-sm outline-none" />
            </label>
            <button className="border border-[var(--tone-333333)] px-4 text-xs uppercase tracking-wider hover:bg-[var(--tone-1c1c1c)]">Search</button>
          </form>

          <div className="divide-y divide-[var(--tone-222222)]">
            {customers.map(customer => (
              <button key={customer.id} type="button" onClick={() => setSelectedId(customer.id)} aria-pressed={selectedId === customer.id}
                className={`w-full px-3 py-3 text-left transition-colors ${selectedId === customer.id ? 'bg-[var(--tone-1c1c1c)]' : 'hover:bg-[var(--tone-151515)]'}`}>
                <span className="block text-sm font-medium">{customer.name}</span>
                <span className="mt-1 block break-all text-xs text-[var(--tone-a3a3a3)]">{customer.email}</span>
                <span className="mt-1 block text-[10px] text-[var(--tone-737373)]">Joined {new Date(customer.created_at).toLocaleDateString()}</span>
              </button>
            ))}
            {!loading && customers.length === 0 && <p className="py-8 text-center text-sm text-[var(--tone-a3a3a3)]">No registered customers found.</p>}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[var(--tone-222222)] pt-3 text-xs text-[var(--tone-a3a3a3)]">
            <span>{total ? offset + 1 : 0}–{Math.min(offset + PAGE_SIZE, total)} of {total}</span>
            <div className="flex gap-2">
              <button type="button" aria-label="Previous customers" disabled={offset === 0 || loading} onClick={() => { setSelectedId(''); setOffset(Math.max(0, offset - PAGE_SIZE)); }} className="p-1 disabled:opacity-30"><ChevronLeft size={17} /></button>
              <button type="button" aria-label="Next customers" disabled={offset + PAGE_SIZE >= total || loading} onClick={() => { setSelectedId(''); setOffset(offset + PAGE_SIZE); }} className="p-1 disabled:opacity-30"><ChevronRight size={17} /></button>
            </div>
          </div>
        </div>

        <div className="border border-[var(--tone-222222)] bg-[var(--tone-101010)] p-4 sm:p-6">
          <div className="mb-5 flex items-center gap-2"><Mail size={18} /><h2 className="text-lg font-semibold">Write an email</h2></div>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-xs text-[var(--tone-a3a3a3)]">To
              <input readOnly value={selected ? `${selected.name} · ${selected.email}` : 'Select a customer'} className="mt-2 w-full border border-[var(--tone-333333)] bg-transparent px-3 py-2.5 text-sm text-white" />
            </label>
            <label className="block text-xs text-[var(--tone-a3a3a3)]">Subject
              <input required maxLength={200} value={subject} onChange={event => setSubject(event.target.value)} className="mt-2 w-full border border-[var(--tone-333333)] bg-transparent px-3 py-2.5 text-sm text-white" />
            </label>
            <label className="block text-xs text-[var(--tone-a3a3a3)]">Message
              <textarea required maxLength={12000} rows={9} value={text} onChange={event => setText(event.target.value)} className="mt-2 w-full resize-y border border-[var(--tone-333333)] bg-transparent px-3 py-2.5 text-sm text-white" />
            </label>
            <p className="text-[11px] leading-relaxed text-[var(--tone-737373)]">This sends one plain-text email to the selected registered customer. The message body is not stored in email history.</p>
            {feedback && <p role={feedback.error ? 'alert' : 'status'} className={`text-sm ${feedback.error ? 'text-red-300' : 'text-emerald-300'}`}>{feedback.text}</p>}
            <button disabled={!selected || !provider?.configured || sending || !subject.trim() || !text.trim()} className="flex w-full items-center justify-center gap-2 bg-white px-4 py-3 text-xs font-bold uppercase tracking-widest text-black disabled:cursor-not-allowed disabled:opacity-40">
              <Send size={14} />{sending ? 'Sending…' : 'Send email'}
            </button>
          </form>
        </div>
      </section>

      <section className="border border-[var(--tone-222222)] bg-[var(--tone-101010)] p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2"><CheckCircle2 size={17} /><h2 className="text-lg font-semibold">Recent email activity</h2></div>
        {logs.length === 0 ? <p className="text-sm text-[var(--tone-a3a3a3)]">No email attempts yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="text-[var(--tone-a3a3a3)]"><tr><th className="pb-3 pr-4 font-medium">Date</th><th className="pb-3 pr-4 font-medium">Customer</th><th className="pb-3 pr-4 font-medium">Subject</th><th className="pb-3 font-medium">Status</th></tr></thead>
              <tbody className="divide-y divide-[var(--tone-222222)]">
                {logs.map(log => <tr key={log.id}>
                  <td className="py-3 pr-4 text-[var(--tone-a3a3a3)]">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="py-3 pr-4"><span className="block">{log.customer_name || 'Customer account unavailable'}</span><span className="text-[var(--tone-737373)]">{log.recipient_email}</span></td>
                  <td className="max-w-[260px] truncate py-3 pr-4">{log.subject}</td>
                  <td className={`py-3 font-semibold ${log.status === 'SENT' ? 'text-emerald-300' : log.status === 'FAILED' ? 'text-red-300' : 'text-amber-200'}`}>{log.status}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
