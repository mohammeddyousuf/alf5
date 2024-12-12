export interface Enquiries {
  id: string;
  message: string;
  location: string | null;
  ip_address: string | null;
  source: string;
  created_at: string;
}

export type EnquiriesInsert = Omit<Enquiries, 'id' | 'created_at'>;
export type EnquiriesUpdate = Partial<EnquiriesInsert>;