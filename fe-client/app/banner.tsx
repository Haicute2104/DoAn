"use client";
import {
  getProductBestSeller,
  getProductFeatured,
  getProductNew,
} from "@/components/services/product.services";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import { IProduct } from "@/types/product.type";
import Link from "next/link";
import { useState, useEffect } from "react";

function Banner() {
  const [productNew, setProductNew] = useState<IProduct[]>([]);
  const [productFeatured, setProductFeatured] = useState<IProduct[]>([]);
  const [productBestSeller, setProductBestSeller] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const [newProducts, featuredProducts, bestSellerProducts] =
          await Promise.all([
            getProductNew(),
            getProductFeatured(),
            getProductBestSeller(),
          ]);

        setProductNew(newProducts.products);
        setProductFeatured(featuredProducts.products);
        setProductBestSeller(bestSellerProducts.products);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      {loading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner label="Đang tải..." />
        </div>
      ) : (
        <section className="py-24 px-4 bg-white space-y-10">
          {/* Mới nhất */}
          <div className="header flex justify-between items-end">
            <div className="left">
              <h2 className="font-serif text-3xl md:text-4xl text-brand-dark mb-4">
                Mới nhất
              </h2>
              <p className="text-gray-500 font-light leading-relaxed max-w-2xl text-center">
                Những sản phẩm mới nhất của chúng tôi
              </p>
            </div>
            <Link
              href="/products"
              className="hidden md:inline-block text-[#8B1E26] uppercase tracking-widest text-sm font-medium hover:text-red-900 border-b border-[#8B1E26] pb-1"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {productNew.map((product) => (
              <Link href={`/products/${product._id}`} key={product._id}>
                <div className="group cursor-pointer fade-in-up">
                  <div className="aspect-[3/4] overflow-hidden relative mb-4 bg-gray-100">
                    <img
                      src={product.thumbnail.url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 bg-[#8B1E26] text-white text-xs uppercase px-2 py-1 tracking-wider">
                      Mới
                    </span>
                  </div>
                  <div className="text-center">
                    <h3 className="font-serif text-lg text-[#2C2C2C] group-hover:text-[#8B1E26] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[#8B1E26] font-medium mt-1">
                      {product.price.toLocaleString("vi-VN")} VNĐ
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bán chạy nhất */}
          <div className="header flex justify-between items-end">
            <div className="left">
              <h2 className="font-serif text-3xl md:text-4xl text-brand-dark mb-4">
                Bán chạy nhất
              </h2>
              <p className="text-gray-500 font-light leading-relaxed max-w-2xl text-center">
                Những sản phẩm bán chạy nhất của chúng tôi
              </p>
            </div>
            <Link
              href="/products"
              className="hidden md:inline-block text-[#8B1E26] uppercase tracking-widest text-sm font-medium hover:text-red-900 border-b border-[#8B1E26] pb-1"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {productBestSeller.map((product) => (
              <Link href={`/products/${product._id}`} key={product._id}>
                <div className="group cursor-pointer fade-in-up">
                  <div className="aspect-[3/4] overflow-hidden relative mb-4 bg-gray-100">
                    <img
                      src={product.thumbnail.url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 bg-[#86C76D] text-white text-xs uppercase px-2 py-1 tracking-wider">
                      Bán chạy
                    </span>
                  </div>
                  <div className="text-center">
                    <h3 className="font-serif text-lg text-[#2C2C2C] group-hover:text-[#8B1E26] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[#8B1E26] font-medium mt-1">
                      {product.price.toLocaleString("vi-VN")} VNĐ
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Nổi bật */}
          <div className="header flex justify-between items-end">
            <div className="left">
              <h2 className="font-serif text-3xl md:text-4xl text-brand-dark mb-4">
                Nổi bật
              </h2>
              <p className="text-gray-500 font-light leading-relaxed max-w-2xl text-center">
                Những sản phẩm nổi bật của chúng tôi
              </p>
            </div>
            <Link
              href="/products"
              className="hidden md:inline-block text-[#8B1E26] uppercase tracking-widest text-sm font-medium hover:text-red-900 border-b border-[#8B1E26] pb-1"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {productFeatured.map((product) => (
              <Link href={`/products/${product._id}`} key={product._id}>
                <div className="group cursor-pointer fade-in-up">
                  <div className="aspect-[3/4] overflow-hidden relative mb-4 bg-gray-100">
                    <img
                      src={product.thumbnail.url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 bg-[#D7B544] text-white text-xs uppercase px-2 py-1 tracking-wider">
                      Nổi bật
                    </span>
                  </div>
                  <div className="text-center">
                    <h3 className="font-serif text-lg text-[#2C2C2C] group-hover:text-[#8B1E26] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[#8B1E26] font-medium mt-1">
                      {product.price.toLocaleString("vi-VN")} VNĐ
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default Banner;
