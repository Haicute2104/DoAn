import { TryCatch } from "../../helpers/tryCatch";
import { Response, NextFunction, Request } from "express";
import Product, { ISizeStock } from "../../models/product.model";
import {
  PaginationQuery,
  buildPagination,
  buildSearchFilter,
  paginateQuery,
  calculatePagination
} from "../../helpers/queryHelper";
import { isValidObjectId } from "mongoose";
import Category from "../../models/category.model";
interface ClientProductQuery extends PaginationQuery {
  category?: string;
}

const ALLOWED_SORT_FIELDS = ["price", "name", "createdAt", "totalSold"];
const SEARCH_FIELDS = ["name", "tags"];

const buildClientProductFilter = async (
  query: ClientProductQuery
): Promise<Record<string, unknown>> => {
  const { search, category } = query;

  const filter: Record<string, unknown> = {
    isDeleted: false,
    status: "active",
  };

  const searchFilter = buildSearchFilter(search, SEARCH_FIELDS);
  if (searchFilter.$or) {
    filter.$or = searchFilter.$or;
  }

  if (category) {
    const categoryDoc = await Category.findOne({ slug: category });

    if (categoryDoc) {
      filter.category = categoryDoc._id;
    } else {
      // Nếu slug không tồn tại → trả về filter không có sản phẩm
      filter.category = null;
    }
  }

  return filter;
};

//Xem tất cả sản phẩm [Client]
export const index = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const {
    limit = "12",
    page = "1",
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    category,
  } = req.query as ClientProductQuery;

  const paginationParams = buildPagination({
    limit,
    page,
    sortBy,
    sortOrder,
    allowedSortFields: ALLOWED_SORT_FIELDS,
  });

  const filter = await buildClientProductFilter({ search, category });

  const { items: products, totalItems } = await paginateQuery(
    Product,
    filter,
    paginationParams,
    [{ path: "category", select: "name slug" }],
  );

  const pagination = calculatePagination(
    totalItems,
    paginationParams.pageNum,
    paginationParams.limitNum
  );

  return res.status(200).json({
    message: "Tất cả sản phẩm đã có",
    products,
    pagination,
  });
});

//Xem chi tiết sản phẩm [Client]
export const show = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const product = await Product.findById(id).populate("category", "name slug");
  if (!product) {
    return res.status(404).json({
      message: "Sản phẩm không tồn tại",
    });
  }
  return res.status(200).json({
    message: "Sản phẩm đã có",
    product,
  });
});

export const isNew = TryCatch(async (req: Request, res: Response) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const products = await Product.find({
    createdAt: { $gte: thirtyDaysAgo },
    isDeleted: false,
    status: "active"
  })
    .sort({ createdAt: -1 })
    .limit(4)
    .populate("category", "name slug");

  return res.status(200).json({
    message: "Sản phẩm mới",
    products
  });
});

export const isFeatured = TryCatch(async (req: Request, res: Response) => {
  const products = await Product.find({ isFeatured: true, isDeleted: false, status: "active" })
  .limit(4)
  .populate("category", "name slug");
  if(!products) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm",
    });
  }
  return res.status(200).json({
    message: "Sản phẩm nổi bật",
    products
  });
})



export const updateBestSellerProducts = async () => {
  const topProducts = await Product.find({
    isDeleted: false,
    status: "active",
    totalSold: { $gt: 0 },
  })
    .sort({ totalSold: -1 })
    .limit(4)
    .select("_id");

  const topIds = topProducts.map(p => p._id);

  await Product.updateMany(
    { isDeleted: false },
    { $set: { isBestSeller: false } }
  );

  if (topIds.length > 0) {
    await Product.updateMany(
      { _id: { $in: topIds } },
      { $set: { isBestSeller: true } }
    );
  }
};

export const isBestSeller = TryCatch(async (req: Request, res: Response) => {

  await updateBestSellerProducts();

  const products = await Product.find({
    isBestSeller: true,
    isDeleted: false,
    status: "active"
  })
  .sort({ totalSold: -1 })
  .populate("category", "name slug");

  return res.status(200).json({
    message: "Sản phẩm bán chạy",
    products
  });

});