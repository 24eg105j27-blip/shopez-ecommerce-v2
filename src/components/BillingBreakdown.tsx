import { calculateBilling, formatPrice, type CartItem } from '../utils/billing';

interface BillingBreakdownProps { items: CartItem[]; }

export default function BillingBreakdown({ items }: BillingBreakdownProps) {
  const billing = calculateBilling(items);
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-3">
      <h3 className="text-white font-semibold text-lg mb-4">Order Summary</h3>
      <div className="flex justify-between text-sm"><span className="text-slate-400">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span><span className="text-white">{formatPrice(billing.subtotal)}</span></div>
      {billing.discount > 0 && <div className="flex justify-between text-sm"><span className="text-emerald-400">Discount</span><span className="text-emerald-400">-{formatPrice(billing.discount)}</span></div>}
      <div className="flex justify-between text-sm"><span className="text-slate-400">Tax (18% GST)</span><span className="text-white">{formatPrice(billing.tax)}</span></div>
      <div className="flex justify-between text-sm"><span className="text-slate-400">Shipping</span><span className="text-white">{billing.shipping === 0 ? <span className="text-emerald-400">FREE</span> : formatPrice(billing.shipping)}</span></div>
      {billing.subtotal < 500 && billing.subtotal > 0 && <p className="text-xs text-amber-400">Add {formatPrice(500 - billing.subtotal)} more for free shipping!</p>}
      <div className="border-t border-slate-600 pt-3 flex justify-between"><span className="text-white font-semibold text-lg">Grand Total</span><span className="text-amber-400 font-bold text-lg">{formatPrice(billing.grandTotal)}</span></div>
    </div>
  );
}
