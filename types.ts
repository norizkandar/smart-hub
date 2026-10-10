export type Vehicle = {
  id: string; seller_id: string; make: string; model: string; variant: string | null;
  year: number; price: number; mileage_km: number | null; transmission: string | null;
  fuel_type: string | null; body_type: string | null; location: string | null;
  description: string | null; condition: string | null; status: string;
  image_urls: string[] | null; created_at: string; seller_type?: string | null;
};
