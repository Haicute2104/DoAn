import { SortOrder, Model } from "mongoose";

// Interface cho query parameters chung
export interface PaginationQuery {
  limit?: string;
  page?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

// Type cho filter query
type FilterObject = Record<string, unknown>;

// Interface cho kết quả pagination
export interface PaginationResult {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Interface cho options của buildPagination
interface PaginationOptions {
  limit: string;
  page: string;
  sortBy: string;
  sortOrder: string;
  allowedSortFields?: string[];
}

// Interface cho kết quả buildPagination
interface PaginationParams {
  limitNum: number;
  pageNum: number;
  skip: number;
  sort: { [key: string]: SortOrder };
}

/**
 * Xây dựng các tham số pagination từ query
 */
export const buildPagination = (options: PaginationOptions): PaginationParams => {
  const {
    limit,
    page,
    sortBy,
    sortOrder,
    allowedSortFields = ["createdAt"]
  } = options;

  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const skip = (pageNum - 1) * limitNum;

  // Xây dựng điều kiện sắp xếp
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sortDirection: SortOrder = sortOrder === "asc" ? 1 : -1;
  const sort: { [key: string]: SortOrder } = { [sortField]: sortDirection };

  return { limitNum, pageNum, skip, sort };
};

/**
 * Tính toán thông tin pagination
 */
export const calculatePagination = (
  totalItems: number,
  pageNum: number,
  limitNum: number
): PaginationResult => {
  const totalPages = Math.ceil(totalItems / limitNum);

  return {
    currentPage: pageNum,
    totalPages,
    totalItems,
    limit: limitNum,
    hasNextPage: pageNum < totalPages,
    hasPrevPage: pageNum > 1
  };
};

/**
 * Xây dựng điều kiện tìm kiếm text
 */
export const buildSearchFilter = (
  search: string | undefined,
  searchFields: string[]
): { $or?: Array<{ [key: string]: { $regex: string; $options: string } }> } => {
  if (!search || searchFields.length === 0) {
    return {};
  }

  return {
    $or: searchFields.map((field) => ({
      [field]: { $regex: search, $options: "i" }
    }))
  };
};

/**
 * Thực hiện query với pagination
 */
export const paginateQuery = async <T>(
  model: Model<T>,
  filter: FilterObject,
  paginationParams: PaginationParams,
  populateOptions?: Array<{ path: string; select?: string }>
): Promise<{ items: T[]; totalItems: number }> => {
  const { skip, limitNum, sort } = paginationParams;

  let query = model.find(filter).sort(sort).skip(skip).limit(limitNum);

  // Thêm populate nếu có
  if (populateOptions) {
    populateOptions.forEach((option) => {
      query = query.populate(option.path, option.select);
    });
  }

  const [items, totalItems] = await Promise.all([
    query.exec(),
    model.countDocuments(filter)
  ]);

  return { items, totalItems };
};

