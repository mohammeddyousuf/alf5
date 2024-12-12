export interface Enquiries {
  id: string;
  name: string | null;
  email: string | null;
  mobile: string | null;
  message: string;
  comments: string | null;
  location: string | null;
  ip_address: string | null;
  source: string;
  created_at: string;
}

export type EnquiriesInsert = Omit<Enquiries, 'id' | 'created_at'>;
export type EnquiriesUpdate = Partial<EnquiriesInsert>;