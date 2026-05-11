"use client";

import { useState } from "react";
import Link from "next/link";
import { IProduct } from "@/types/product.type";
import { Badge } from "@/components/UI/badge";
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/UI/breadcrumb";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAlert } from "@/components/providers/AlertProvider";
import { addToCart } from "@/components/services/cart.services";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import { X } from "lucide-react";

interface Props {
  product: IProduct;
}

export default function ProductDetailContent({ product }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizeStock[0]?.size);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const currentStock =
    product.sizeStock.find((item) => item.size === selectedSize)?.stock ?? 0;

  const { requireAuth } = useAuth();
  const { showAlert } = useAlert();

  const handleAddToCart = async () => {
    if (!requireAuth()) return;

    if (!selectedSize) {
      showAlert("error", "Vui lòng chọn size");
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(product._id, selectedSize, 1);
      showAlert("success", "Đã thêm vào giỏ hàng");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể thêm vào giỏ hàng";
      showAlert("error", message);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCloseSizeGuide = () => {
    setShowSizeGuide(false);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-4 md:p-8 relative">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Trang chủ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/products">Sản phẩm</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {product.category?.name && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/products?category=${product.category.slug}`}>
                      {product.category.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate max-w-[200px]">
                {product.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* CỘT TRÁI: THƯ VIỆN ẢNH */}
        <div className="flex flex-col gap-4">
          {/* Ảnh chính */}
          <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src={product.images[selectedImage]?.url}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
          </div>

          {/* Thumbnail scroll ngang */}
          {/* THƯ VIỆN ẢNH GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-[3/4] overflow-hidden border transition-all ${
                  selectedImage === index
                    ? "border-black"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <img
                  src={img.url}
                  alt={`Image ${index}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: THÔNG TIN SẢN PHẨM */}
        <div className="flex flex-col space-y-8 py-2">
          <div className="space-y-4">
            <h1 className="text-xl md:text-2xl font-medium tracking-wide uppercase text-[#2C2C2C] font-serif">
              {product.name}
            </h1>
            <p className="text-2xl font-semibold text-[#8B1E26]">
              {product.price.toLocaleString("vi-VN")} VNĐ
            </p>
            <p className="text-gray-400 line-through text-sm mt-1 font-light">
              {product.originalPrice?.toLocaleString("vi-VN")} VNĐ
            </p>
          </div>

          {/* Phân loại */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-600">Phân Loại:</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-gray-100 text-gray-600">
                {product?.category?.name}
              </Badge>
            </div>
          </div>

          {/* Kích thước */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-600">
              Size: <span className="text-gray-900">{selectedSize}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizeStock.map((item) => (
                <button
                  key={item.size}
                  onClick={() => setSelectedSize(item.size)}
                  className={`min-w-12 w-fit px-2 h-10 flex items-center justify-center text-sm border transition-all ${
                    selectedSize === item.size
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {item.size}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Số lượng:</span>

            <span
              className={`text-sm font-medium px-3 py-1 rounded-md ${
                currentStock === 0
                  ? "bg-red-100 text-red-700"
                  : currentStock < 5
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
              }`}
            >
              {currentStock === 0 ? "Hết hàng" : currentStock}
            </span>
          </div>

          {/* Hướng dẫn kích thước */}
          <button
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-black transition-colors"
            onClick={() => setShowSizeGuide(true)}
          >
            <span className="underline underline-offset-4 font-medium">
              Hướng Dẫn Kích Thước
            </span>
          </button>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-600">Thành phần:</p>

            <div className="border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-200">
                  {product?.specs?.material && (
                    <tr>
                      <td className="bg-gray-50 px-4 py-3 font-medium w-1/3">
                        Vật liệu
                      </td>
                      <td className="px-4 py-3">{product.specs.material}</td>
                    </tr>
                  )}

                  {product?.specs?.origin && (
                    <tr>
                      <td className="bg-gray-50 px-4 py-3 font-medium">
                        Xuất xứ
                      </td>
                      <td className="px-4 py-3">{product.specs.origin}</td>
                    </tr>
                  )}

                  {product?.specs?.style && (
                    <tr>
                      <td className="bg-gray-50 px-4 py-3 font-medium">
                        Kiểu dáng
                      </td>
                      <td className="px-4 py-3">{product.specs.style}</td>
                    </tr>
                  )}

                  {product?.specs?.season && (
                    <tr>
                      <td className="bg-gray-50 px-4 py-3 font-medium">Mùa</td>
                      <td className="px-4 py-3">{product.specs.season}</td>
                    </tr>
                  )}

                  {product?.specs?.careInstructions && (
                    <tr>
                      <td className="bg-gray-50 px-4 py-3 font-medium">
                        Cách chăm sóc
                      </td>
                      <td className="px-4 py-3">
                        {product.specs.careInstructions}
                      </td>
                    </tr>
                  )}

                  {product?.specs?.elasticity && (
                    <tr>
                      <td className="bg-gray-50 px-4 py-3 font-medium">
                        Độ đàn hồi
                      </td>
                      <td className="px-4 py-3">{product.specs.elasticity}</td>
                    </tr>
                  )}

                  {product?.specs?.thickness && (
                    <tr>
                      <td className="bg-gray-50 px-4 py-3 font-medium">
                        Độ dày
                      </td>
                      <td className="px-4 py-3">{product.specs.thickness}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className="border border-gray-300 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
              </div>
              <span className="text-sm font-medium">Full payment</span>
            </div>
            <span className="text-sm font-medium">
              {product.price.toLocaleString("vi-VN")} VNĐ
            </span>
          </div>

          {/* Nút đặt hàng */}
          <div className="space-y-4 pt-4 font-serif">
            <button
              onClick={handleAddToCart}
              disabled={currentStock === 0 || isAddingToCart}
              className={`w-full py-4 font-bold uppercase tracking-widest transition-colors shadow-sm ${
                currentStock === 0 || isAddingToCart
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#fca311] hover:bg-[#e8940d] text-white"
              }`}
            >
              {currentStock === 0
                ? "HẾT HÀNG"
                : isAddingToCart
                  ? "ĐANG THÊM..."
                  : "THÊM VÀO GIỎ HÀNG"}
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto py-4">
        <h2 className="text-4xl font-bold text-[#8B1E26] font-serif mb-4">
          Mô tả sản phẩm
        </h2>
        <p className="text-gray-600 whitespace-pre-line">
          {product.description}
        </p>
      </div>

      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleCloseSizeGuide}>
          <Card className="max-w-2xl w-full mx-4 relative border-none" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#8B1E26] font-serif mb-4 text-center">
                Hướng dẫn kích thước
              </CardTitle>

              {/* Nút đóng */}
              <X
                className="w-5 h-5 cursor-pointer absolute top-4 right-4"
                onClick={handleCloseSizeGuide}
              />

              <CardDescription>
                <Image
                  src="/images/sizechart.jpg"
                  alt="Size Guide"
                  width={1000}
                  height={1000}
                  className="w-full h-full object-cover"
                />
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );
}
