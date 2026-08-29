export type ApiProduct = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  images?: string | string[];
  productImage?: string | string[];
  image?: string;
  originalPrice?: number | string;
  price?: number | string;
  discountedPrice?: number | string;
  stock?: number | string;
  countInStock?: number | string;
  category?: string | { name?: string; _id?: string };
  active?: boolean;
  isActive?: boolean;
  info?: string;
  weight?: number | string;
  brand?: string;
};

export type ProductRecord = {
  id: string;
  title: string;
  description: string;
  image: string;
  images: string[];
  originalPrice: number;
  price: number;
  stock: number;
  category: string;
  active: boolean;
  info: string;
  weight: number;
  brand: string;
};

export function normalizeProduct(product: ApiProduct): ProductRecord {
  // Resolve images from all possible API field names:
  // `images` (array) → `productImage` (string|array) → `image` (string)
  const rawImages = product.images ?? product.productImage ?? product.image;
  const images: string[] = Array.isArray(rawImages)
    ? rawImages.filter(Boolean)
    : rawImages
      ? [rawImages]
      : [];
  const price = Number(product.discountedPrice ?? product.price ?? 0);
  return {
    id: product._id || product.id || crypto.randomUUID(),
    title: product.title || product.name || "Untitled product",
    description: product.description || "",
    image: images[0] || "",
    images,
    originalPrice: Number(product.price ?? product.originalPrice ?? 0),
    price,
    stock: Number(product.countInStock ?? product.stock ?? 0),
    category:
      typeof product.category === "string"
        ? product.category
        : product.category?.name || "Uncategorised",
    active: product.isActive ?? product.active ?? true,
    info: product.info || "",
    weight: Number(product.weight ?? 0),
    brand: product.brand || "",
  };
}
