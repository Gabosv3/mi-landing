import { getDiscountInfo } from "../utils/price";

export default function PriceTag({ price, compareAtPrice, className = "" }) {
  const discount = getDiscountInfo(price, compareAtPrice);
  if (!discount) return <span className={className}>{price}</span>;
  return (
    <span className={className}>
      <span className="price-compare">{compareAtPrice}</span>
      {price}
      <span className="price-discount-badge">-{discount.percent}%</span>
    </span>
  );
}
