import { getDiscountInfo, displayPrice } from "../utils/price";

export default function PriceTag({ price, compareAtPrice, className = "" }) {
  const discount = getDiscountInfo(price, compareAtPrice);
  if (!discount) return <span className={className}>{displayPrice(price)}</span>;
  return (
    <span className={className}>
      <span className="price-compare">{displayPrice(compareAtPrice)}</span>
      {displayPrice(price)}
      <span className="price-discount-badge">-{discount.percent}%</span>
    </span>
  );
}
