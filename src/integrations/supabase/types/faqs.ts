export interface Faqs {
  Row: {
    id: string;
    question: string;
    answer: string;
    created_at: string;
    updated_at: string;
  }
  Insert: {
    id?: string;
    question: string;
    answer: string;
    created_at?: string;
    updated_at?: string;
  }
  Update: {
    id?: string;
    question?: string;
    answer?: string;
    created_at?: string;
    updated_at?: string;
  }
}

export type FaqsInsert = Faqs['Insert']
export type FaqsUpdate = Faqs['Update']
export type FaqsRow = Faqs['Row']