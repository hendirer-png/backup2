import supabase from '@/lib/supabaseClient';
import { TeamPaymentRecord } from '@/types';

const TABLE = 'team_payment_records';

function fromRow(row: any): TeamPaymentRecord {
  return {
    id: row.id,
    recordNumber: row.record_number,
    teamMemberId: row.team_member_id,
    teamMemberName: row.team_member_name || '',
    teamMemberRole: row.team_member_role || '',
    date: row.date,
    projectPaymentIds: Array.isArray(row.project_payment_ids) ? row.project_payment_ids : [],
    items: Array.isArray(row.items) ? row.items : [],
    totalAmount: Number(row.total_amount || 0),
    vendorSignature: row.vendor_signature || undefined,
    recipientSignature: row.recipient_signature || undefined,
    sourceType: row.source_type || undefined,
    sourceId: row.source_id || undefined,
    sourceName: row.source_name || undefined,
    notes: row.notes || undefined,
  };
}

function toRow(input: Partial<TeamPaymentRecord>): any {
  return {
    ...(input.recordNumber !== undefined ? { record_number: input.recordNumber } : {}),
    ...(input.teamMemberId !== undefined ? { team_member_id: input.teamMemberId } : {}),
    ...(input.teamMemberName !== undefined ? { team_member_name: input.teamMemberName } : {}),
    ...(input.teamMemberRole !== undefined ? { team_member_role: input.teamMemberRole } : {}),
    ...(input.date !== undefined ? { date: input.date } : {}),
    ...(input.projectPaymentIds !== undefined ? { project_payment_ids: input.projectPaymentIds } : {}),
    ...(input.items !== undefined ? { items: input.items } : {}),
    ...(input.totalAmount !== undefined ? { total_amount: input.totalAmount } : {}),
    ...(input.vendorSignature !== undefined ? { vendor_signature: input.vendorSignature } : {}),
    ...(input.recipientSignature !== undefined ? { recipient_signature: input.recipientSignature } : {}),
    ...(input.sourceType !== undefined ? { source_type: input.sourceType } : {}),
    ...(input.sourceId !== undefined ? { source_id: input.sourceId } : {}),
    ...(input.sourceName !== undefined ? { source_name: input.sourceName } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
  };
}

export async function listTeamPaymentRecords(): Promise<TeamPaymentRecord[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function createTeamPaymentRecord(payload: Omit<TeamPaymentRecord, 'id'>): Promise<TeamPaymentRecord> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(toRow(payload))
    .select('*')
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateTeamPaymentRecord(id: string, patch: Partial<TeamPaymentRecord>): Promise<TeamPaymentRecord> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(toRow(patch))
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteTeamPaymentRecord(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
