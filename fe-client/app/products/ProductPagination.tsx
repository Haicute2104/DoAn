"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ProductPaginationProps {
  pagination: PaginationInfo;
}

export default function ProductPagination({ pagination }: ProductPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (pagination.totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const getVisiblePages = (): number[] => {
    const { currentPage, totalPages } = pagination;
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => goToPage(pagination.currentPage - 1)}
        disabled={!pagination.hasPrevPage || isPending}
        className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Trước
      </button>

      {visiblePages[0] > 1 && (
        <>
          <button
            onClick={() => goToPage(1)}
            className="w-10 h-10 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            1
          </button>
          {visiblePages[0] > 2 && (
            <span className="px-1 text-gray-400">...</span>
          )}
        </>
      )}

      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => goToPage(page)}
          disabled={isPending}
          className={`w-10 h-10 text-sm border rounded transition-colors ${
            page === pagination.currentPage
              ? "bg-[#8B1E26] text-white border-[#8B1E26]"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}

      {visiblePages[visiblePages.length - 1] < pagination.totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < pagination.totalPages - 1 && (
            <span className="px-1 text-gray-400">...</span>
          )}
          <button
            onClick={() => goToPage(pagination.totalPages)}
            className="w-10 h-10 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            {pagination.totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => goToPage(pagination.currentPage + 1)}
        disabled={!pagination.hasNextPage || isPending}
        className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Sau
      </button>
    </div>
  );
}
