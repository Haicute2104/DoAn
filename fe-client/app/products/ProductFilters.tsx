"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition, useRef } from "react";
import { Input } from "@/components/UI/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Search } from "lucide-react";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  currentCategory?: string;
  currentSort?: string;
  currentSearch?: string;
}

type SortValue = "newest" | "oldest" | "price-asc" | "price-desc" | "best-seller";

const SORT_MAP: Record<SortValue, { sortBy: string; sortOrder: string }> = {
  newest: { sortBy: "createdAt", sortOrder: "desc" },
  oldest: { sortBy: "createdAt", sortOrder: "asc" },
  "price-asc": { sortBy: "price", sortOrder: "asc" },
  "price-desc": { sortBy: "price", sortOrder: "desc" },
  "best-seller": { sortBy: "totalSold", sortOrder: "desc" },
};

function getSortValueFromParams(sortBy?: string, sortOrder?: string): SortValue {
  if (sortBy === "price" && sortOrder === "asc") return "price-asc";
  if (sortBy === "price" && sortOrder === "desc") return "price-desc";
  if (sortBy === "totalSold") return "best-seller";
  if (sortBy === "createdAt" && sortOrder === "asc") return "oldest";
  return "newest";
}

export default function ProductFilters({
  categories,
  currentCategory,
  currentSort,
  currentSearch,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(currentSearch || "");

  // Dùng useRef để lưu trữ ID của timeout
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sortBy = searchParams.get("sortBy") || undefined;
  const sortOrder = searchParams.get("sortOrder") || undefined;
  const currentSortValue = getSortValueFromParams(sortBy, sortOrder);
  const categoryFromParams = searchParams.get("category") || undefined;

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset về trang 1 khi filter thay đổi
      params.set("page", "1");

      startTransition(() => {
        router.push(`/products?${params.toString()}`);
      });
    },
    [searchParams, router]
  );

  // Hàm xử lý onChange có tích hợp debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);

    // Xóa timeout cũ nếu người dùng tiếp tục gõ
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Đặt timeout mới 500ms (0.5s)
    timeoutRef.current = setTimeout(() => {
      updateParams({ search: val || undefined });
    }, 500);
  };

  const handleSortChange = (value: string) => {
    const sortConfig = SORT_MAP[value as SortValue];
    if (sortConfig) {
      updateParams({
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
      });
    }
  };

  const handleCategoryChange = (categorySlug?: string) => {
    updateParams({ category: categorySlug });
  };

  return (
    <div className="space-y-6 mb-10">
      {/* Search */}
      {/* Sửa lại onSubmit để ngăn load lại trang khi nhấn Enter */}
      <form onSubmit={() => updateParams({ search: searchValue || undefined })} className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-10 bg-white border-gray-200 focus-visible:ring-[#8B1E26]/30"
          />
        </div>
      </form>

      {/* Category tabs + Sort */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex space-x-6 overflow-x-auto w-full md:w-auto hide-scrollbar pb-2 md:pb-0">
          <button
            onClick={() => handleCategoryChange(undefined)}
            className={`pb-1 font-medium whitespace-nowrap transition-all ${!currentCategory
                ? "text-[#8B1E26] border-b-2 border-[#8B1E26]"
                : "text-gray-500 hover:text-[#8B1E26] hover:border-b-2 hover:border-[#8B1E26]/30"
              }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`pb-1 font-medium whitespace-nowrap transition-all ${categoryFromParams === cat.slug
                  ? "text-[#8B1E26] border-b-2 border-[#8B1E26]"
                  : "text-gray-500 hover:text-[#8B1E26] hover:border-b-2 hover:border-[#8B1E26]/30"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-sm text-gray-500 shrink-0">Sắp xếp:</span>
          <Select value={currentSortValue} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="oldest">Cũ nhất</SelectItem>
              <SelectItem value="price-asc">Giá: Thấp đến Cao</SelectItem>
              <SelectItem value="price-desc">Giá: Cao đến Thấp</SelectItem>
              <SelectItem value="best-seller">Bán chạy nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isPending && (
        <div className="fixed top-0 left-0 w-[100vw] h-[100vh] flex items-center justify-center bg-white/70 z-10">
          <LoadingSpinner className="text-white" label="Đang tìm kiếm sản phẩm..." />
        </div>
      )}
    </div>
  );
}