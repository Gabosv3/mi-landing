/* Extrae un numero de un string de precio libre (ej: "$12.50" -> 12.5). NaN si no es numerico. */
export function parsePrice(value) {
  if (value == null || value === "") return NaN;
  const num = parseFloat(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) ? num : NaN;
}

export function formatPrice(num) {
  return `$${num.toFixed(2)}`;
}

/* Muestra el precio tal cual si ya trae simbolo o texto (ej: "Consultar"),
   o le antepone "$" si es un numero puro (ej: "100" -> "$100"). */
export function displayPrice(value) {
  if (value == null || value === "") return value;
  const str = String(value).trim();
  if (/^[\d.,]+$/.test(str)) return `$${str}`;
  return str;
}

/* Si el producto tiene un precio original valido mayor al precio actual,
   devuelve el % de descuento y ambos valores. Si no aplica, null. */
export function getDiscountInfo(price, compareAtPrice) {
  if (!compareAtPrice) return null;
  const sale = parsePrice(price);
  const original = parsePrice(compareAtPrice);
  if (!Number.isFinite(sale) || !Number.isFinite(original) || original <= sale) return null;
  const percent = Math.round((1 - sale / original) * 100);
  if (percent <= 0) return null;
  return { percent, original, sale };
}
