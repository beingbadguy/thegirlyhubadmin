"use client";
import { useRouter } from "next/navigation";
import { AdminShell, PageTitle } from "../admin-shared";
import { ProductEditor } from "../product-editor";
import { useProductStore } from "../product-store";
export default function AddProductPage() {
  const router = useRouter();
  const products = useProductStore((state) => state.products);
  const categories = Array.from(
    new Set(products.map((product) => product.category)),
  );
  return (
    <AdminShell active="/products">
      <PageTitle
        title="Add a product"
        description="Create a complete product listing with imagery and stock details."
      />
      <ProductEditor
        categories={categories}
        onDone={() => router.replace("/products")}
      />
    </AdminShell>
  );
}
