export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
};

export type Product = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  brand: string;
  image_url: string;
  price: number;
  rating: number;
  review_count: number;
  is_rocket: boolean;
  short_review: string;
  pros: string[];
  cons: string[];
  recommended_for: string[];
  not_recommended_for: string[];
  check_points: string[];
  performance_score: number;
  durability_score: number;
  usability_score: number;
  design_score: number;
  brand_score: number;
  value_score: number;
  total_score: number;
  affiliate_url: string | null;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
  categories?: Category;
};
