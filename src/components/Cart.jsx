import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart } = useCart();

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Send whatsapp message
  const handleWhatsApp = () => {
    if (cart.length === 0) return;
    
    // Configurable number
    const WHATSAPP_NUMBER = "5215555555555"; // Reemplaza con número real

    let text = "Hola, me interesa solicitar una cotización de los siguientes productos:%0A%0A";
    
    cart.forEach((item, index) => {
      text += `${index + 1}. ${item.name || "Producto"} (Cantidad: ${item.quantity})%0A`;
    });

    text += "%0A¡Gracias!";

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
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
                    <p>{item.price}</p>
                    <div className="cart-item-qty">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <button className="cart-btn cart-btn-whatsapp" onClick={handleWhatsApp}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2C6.472 2 2 6.472 2 11.99c0 1.79.473 3.472 1.301 4.931L2 22l5.232-1.27A9.943 9.943 0 0 0 11.99 22C17.508 22 22 17.528 22 11.99 22 6.472 17.508 2 11.99 2zm0 18c-1.626 0-3.148-.444-4.452-1.217l-.318-.19-3.106.753.782-3.02-.207-.33A7.96 7.96 0 0 1 4 11.99C4 7.576 7.576 4 11.99 4 16.413 4 20 7.587 20 11.99 20 16.413 16.413 20 11.99 20z"/></svg>
              Enviar a WhatsApp
            </button>
            <button className="cart-btn cart-btn-outline" onClick={clearCart} style={{marginTop: "10px"}}>
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}