export interface Product {
  id: number;
  sku: string | null;
  name: string;
  description: string;
  url: string;
  promotion_title: string | null;
  subtitle: string | null;
  type: string;
  status: string;
  price: number;
  base_currency_price: {
    currency: string;
    amount: number;
  };
  sale_price: number;
  regular_price: number;
  starting_price: number;
  quantity: number;
  max_quantity: number;
  discount_ends: string | null;
  is_taxable: boolean;
  has_read_more: boolean;
  can_add_note: boolean;
  can_show_remained_quantity: boolean;
  can_upload_file: boolean;
  has_custom_form: boolean;
  has_metadata: boolean;
  is_on_sale: boolean;
  is_hidden_quantity: boolean;
  is_available: boolean;
  is_out_of_stock: boolean;
  is_require_shipping: boolean;
  weight: string;
  calories: string | null;
  image?: {
    url: string;
    alt: string | null;
  };
  currency: string;
  has_size_guide: boolean;
  discount?: string;
}
