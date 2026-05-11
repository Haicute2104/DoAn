import { getProductById } from "@/components/services/product.services";
import ProductDetailContent from "./ProductDetailContent";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetail({ params }: Props) {
  const { id } = await params;
  const response = await getProductById(id);
  const product = response.product;
  console.log(product);

  if (!product) {
    return <div className="text-center py-20">Không tìm thấy sản phẩm</div>;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-4 md:p-8">
      <ProductDetailContent product={product} />
    </div>
  );
}
