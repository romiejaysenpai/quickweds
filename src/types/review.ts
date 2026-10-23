export interface AppReview {
  id: string;
  user_id?: string | null;
  wedding_id?: string | null;
  couple_names: string;
  wedding_role?: string;
  detail: string;
  rating: number; // 1 to 5
  quote: string;
  story?: string | null;
  verified_couple: boolean;
  status: 'approved' | 'pending' | 'rejected';
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
}

export interface SubmitReviewInput {
  couple_names: string;
  wedding_role?: string;
  detail?: string;
  rating: number;
  quote: string;
  story?: string;
  honeypot?: string;
}
