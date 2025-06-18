// Define the types with proper export
export type Item = {
  id: string;
  name: string;
  price: number; // Price in satoshis (sats)
  description?: string;
  image?: string;
}

export type BasketItem = Item & {
  quantity: number;
}

export type InvoiceStatus = {
  bolt11: string;
  isPaid: boolean;
  amount: number; // Amount in satoshis (sats)
}