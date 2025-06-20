// Define the types with proper export
export type Category = {
  id: string;
  name: string;
  color?: string; // Optional color for UI styling
}

export type Item = {
  id: string;
  name: string;
  price: number; // Price in satoshis (sats)
  description?: string;
  image?: string;
  categoryId?: string; // Reference to category
}

export type BasketItem = Item & {
  quantity: number;
}

export type InvoiceStatus = {
  bolt11: string;
  isPaid: boolean;
  amount: number; // Amount in satoshis (sats)
}