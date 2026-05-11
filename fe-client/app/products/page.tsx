import { IProduct } from "@/types/product.type";
import { getProducts } from "@/components/services/product.services";
import { getCategories } from "@/components/services/category.services";
import Link from "next/link";
import ProductFilters from "./ProductFilters";
import ProductPagination from "./ProductPagination";

interface SearchParams {
  page?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  category?: string;
}

export default async function Products({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const [productResponse, categoryResponse] = await Promise.all([
    getProducts({
      page: params.page,
      search: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      category: params.category,
      limit: "12",
    }),
    getCategories(),
  ]);

  const products = productResponse.products as IProduct[];
  const pagination = productResponse.pagination;
  const categories = categoryResponse.categories ?? [];

  return (
    <div className="bg-[#FAF8F5] py-10 px-6">
      <div className="header flex flex-col items-center justify-center gap-4 py-10">
        <h2 className="font-serif text-4xl md:text-5xl text-[#2C2C2C]">
          Sản phẩm
        </h2>
        <p className="text-gray-600 font-light leading-relaxed max-w-2xl text-center">
          Khám phá những thiết kế áo dài tinh tế, giao thoa giữa nét đẹp truyền
          thống và hơi thở thời đại mới.
        </p>
      </div>

      <ProductFilters
        categories={categories}
        currentCategory={params.category}
        currentSort={params.sortBy}
        currentSearch={params.search}
      />

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào.</p>
          {params.search && (
            <p className="text-gray-400 mt-2">Thử tìm kiếm với từ khóa khác.</p>
          )}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-500">
              Hiển thị {products.length} / {pagination.totalItems} sản phẩm
            </p>
          </div>

          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
              {products.map((product) => {
                const badge =
                  product.isBestSeller === true
                    ? { label: "Best Seller", color: "bg-[#86C76D]" }
                    : product.isFeatured === true
                    ? { label: "Nổi bật", color: "bg-[#D7B544]" }
                    : product.isNewArrival === true
                    ? { label: "Mới", color: "bg-[#8B1E26]" }
                    : null;

                return (
                  <Link href={`/products/${product._id}`} key={product._id}>
                    <div className="group cursor-pointer fade-in">
                      <div className="aspect-[3/4] overflow-hidden relative mb-4 bg-gray-100">
                        <img
                          src={product.thumbnail.url}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="bg-white text-[#2C2C2C] px-6 py-3 uppercase text-sm font-medium tracking-wider hover:bg-[#8B1E26] hover:text-white transition-colors duration-200">
                            Xem Chi Tiết
                          </span>
                        </div>
                        {badge && (
                          <span className={`absolute top-3 left-3 ${badge.color} text-white text-xs uppercase px-2 py-1 tracking-wider`}>
                            {badge.label}
                          </span>
                        )}
                      </div>
                      <div className="text-center">
                        <h3 className="font-serif text-lg text-[#2C2C2C] group-hover:text-[#8B1E26] transition-colors">
                          {product.name}
                        </h3>
                        {product.originalPrice && (
                          <p className="text-gray-400 line-through text-sm mt-1 font-light">
                            {product.originalPrice.toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </p>
                        )}
                        <p className="text-[#8B1E26] font-medium mt-1">
                          {product.price.toLocaleString("vi-VN")} VNĐ
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <ProductPagination pagination={pagination} />
        </>
      )}
    </div>
  );
}
