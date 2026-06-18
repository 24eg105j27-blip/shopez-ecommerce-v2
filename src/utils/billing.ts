export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    productName: string;
    price: number;
    discountPrice: number | null;
    images: string[];
    stock: number;
    brand: string;
  };
  subtotal: number;
}

export interface BillingBreakdown {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  grandTotal: number;
}

export function calculateBilling(items: CartItem[]): BillingBreakdown {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = items.reduce((sum, item) => {
    const saving = (item.product.price - (item.product.discountPrice || item.product.price)) * item.quantity;
    return sum + saving;
  }, 0);
  const tax = subtotal * 0.18;
  const shipping = subtotal < 500 ? 40 : 0;
  const grandTotal = subtotal - discount + tax + shipping;
  return { subtotal, discount, tax, shipping, grandTotal };
}

export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
