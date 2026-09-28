import { useState } from "react";
import { collection, query as fsQuery, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useCart } from "../context/CartContext";
import { useContent } from "../hooks/useContent";
import { parsePrice, formatPrice, displayPrice } from "../utils/price";
import { useConfirm } from "../context/ConfirmContext";

export default function Cart() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart } = useCart();
  const { content } = useContent("contact");
  const confirm = useConfirm();
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null); // { code, type, value }
  const [couponError, setCouponError] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const pricedItems = cart.filter((item) => Number.isFinite(parsePrice(item.price)));
  const hasUnpricedItems = pricedItems.length < cart.length;
  const subtotal = pricedItems.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);

  const discountAmount = coupon
    ? coupon.type === "percent"
      ? subtotal * (coupon.value / 100)
      : Math.min(coupon.value, subtotal)
    : 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleRemove = async (id, name) => {
    const ok = await confirm(`Se quitará "${name || "este producto"}" del carrito.`, { title: "¿Quitar producto?" });
    if (!ok) return;
    removeFromCart(id);
  };

  const handleClear = async () => {
    const ok = await confirm("Esta acción no se puede deshacer.", { title: "¿Vaciar todo el carrito?", danger: true, confirmText: "Vaciar" });
    if (!ok) return;
    clearCart();
    setCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    setCouponError("");
    if (!code) return;
    setCheckingCoupon(true);
    try {
      const snap = await getDocs(fsQuery(collection(db, "coupons"), where("code", "==", code)));
      const found = snap.docs.map((d) => d.data()).find((c) => c.active !== false);
      if (!found) {
        setCoupon(null);
        setCouponError("Cupón inválido o inactivo.");
        return;
      }
      setCoupon({ code: found.code, type: found.type, value: found.value });
    } catch {
      setCouponError("No se pudo validar el cupón. Intenta de nuevo.");
    } finally {
      setCheckingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  // Send whatsapp message
  const handleWhatsApp = () => {
    if (cart.length === 0) return;

    const phoneDigits = (content.phone || "").replace(/\D/g, "");
    if (!phoneDigits) {
      alert("No hay un número de WhatsApp configurado. Ve a Admin → Contacto y agrega el teléfono.");
      return;
    }

    const lines = [
      "👋 Hola, quisiera cotizar los siguientes productos de *Distribuidora Briancesco Menjivar*:",
      "",
      ...cart.map((item, i) =>
        `${i + 1}. *${item.name || "Producto"}*\n   Cantidad: ${item.quantity} · Precio: ${item.price ? displayPrice(item.price) : "Consultar"}`
      ),
      "",
    ];

    if (pricedItems.length > 0) {
      lines.push(`Subtotal: ${formatPrice(subtotal)}`);
      if (coupon) {
        lines.push(`Cupón *${coupon.code}*: -${formatPrice(discountAmount)}`);
        lines.push(`*Total: ${formatPrice(total)}*`);
      } else {
        lines.push(`*Total: ${formatPrice(subtotal)}*`);
      }
      if (hasUnpricedItems) lines.push("(Hay productos marcados como \"Consultar\" que no están incluidos en este total)");
      lines.push("");
    }

    lines.push("¿Podrían ayudarme con la cotización? ¡Gracias! 🙌");

    const text = encodeURIComponent(lines.join("\n"));
    const url = `https://wa.me/${phoneDigits}?text=${text}`;
    window.open(url, "_blank");
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsCartOpen(false)}></div>
      <div className="cart-drawer">
        <div className="cart-header">
          <h2>Mi Cotización</h2>
          <button className="cart-close" onClick={() => setIsCartOpen(false)}>&times;</button>
        </div>

        <div className="cart-content">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <p>Tu carrito de cotización está vacío.</p>
              <button
                className="cart-btn cart-btn-outline"
                onClick={() => setIsCartOpen(false)}
              >
                Ver productos
              </button>
            </div>
          ) : (
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-img">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="cart-item-placeholder">img</div>
                    )}
                  </div>
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p>{displayPrice(item.price)}</p>
                    <div className="cart-item-qty">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button className="cart-item-remove" onClick={() => handleRemove(item.id, item.name)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-coupon">
              {coupon ? (
                <div className="cart-coupon__applied">
                  <span>🏷️ Cupón <strong>{coupon.code}</strong> aplicado</span>
                  <button type="button" onClick={handleRemoveCoupon}>Quitar</button>
                </div>
              ) : (
                <div className="cart-coupon__form">
                  <input
                    type="text"
                    placeholder="Código de cupón"
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApplyCoupon(); } }}
                  />
                  <button type="button" onClick={handleApplyCoupon} disabled={checkingCoupon || !couponInput.trim()}>
                    {checkingCoupon ? "..." : "Aplicar"}
                  </button>
                </div>
              )}
              {couponError && <small className="cart-coupon__error">{couponError}</small>}
            </div>

            {pricedItems.length > 0 && (
              <div className="cart-summary">
                <div className="cart-summary__row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {coupon && (
                  <div className="cart-summary__row cart-summary__row--discount">
                    <span>Descuento ({coupon.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="cart-summary__row cart-summary__row--total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                {hasUnpricedItems && (
                  <small className="cart-summary__note">Algunos productos están marcados "Consultar" y no se incluyen en este total.</small>
                )}
              </div>
            )}

            <button className="cart-btn cart-btn-whatsapp" onClick={handleWhatsApp}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2C6.472 2 2 6.472 2 11.99c0 1.79.473 3.472 1.301 4.931L2 22l5.232-1.27A9.943 9.943 0 0 0 11.99 22C17.508 22 22 17.528 22 11.99 22 6.472 17.508 2 11.99 2zm0 18c-1.626 0-3.148-.444-4.452-1.217l-.318-.19-3.106.753.782-3.02-.207-.33A7.96 7.96 0 0 1 4 11.99C4 7.576 7.576 4 11.99 4 16.413 4 20 7.587 20 11.99 20 16.413 16.413 20 11.99 20z"/></svg>
              Enviar a WhatsApp
            </button>
            <button className="cart-btn cart-btn-outline" onClick={handleClear} style={{marginTop: "10px"}}>
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}
