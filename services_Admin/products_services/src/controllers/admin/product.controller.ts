import { TryCatch } from "../../helpers/tryCatch";
import Product from "../../models/product.model";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { Response, NextFunction } from "express";
import {
  PaginationQuery,
  buildPagination,
  buildSearchFilter,
  paginateQuery,
  calculatePagination
} from "../../helpers/queryHelper";
import { validateAndPrepareProduct } from "../../services/product.service";
import { isValidObjectId } from "mongoose";

// Interface mở rộng cho Product query
interface ProductQueryParams extends PaginationQuery {
  category?: string;
  status?: string;
  gender?: string;
}

// Các trường được phép sắp xếp
const ALLOWED_SORT_FIELDS = ["price", "name", "createdAt", "totalSold", "totalStock"];

// Các trường tìm kiếm
const SEARCH_FIELDS = ["name", "description", "tags"];

// Populate options
const PRODUCT_POPULATE = [
  { path: "category", select: "name slug" },
  { path: "collection", select: "name slug" },
];

/**
 * Xây dựng filter cho Product
 */
const buildProductFilter = (query: ProductQueryParams): Record<string, unknown> => {
  const { search, category, status, gender } = query;

  const filter: Record<string, unknown> = { isDeleted: false };

  // Tìm kiếm
  const searchFilter = buildSearchFilter(search, SEARCH_FIELDS);
  if (searchFilter.$or) {
    filter.$or = searchFilter.$or;
  }

  // Lọc theo danh mục`
  if (category && isValidObjectId(category)) {
    filter.category = category;
  }

  // Lọc theo trạng thái
  if (status) {
    filter.status = status;
  }

  // Lọc theo giới tính
  if (gender) {
    filter.gender = gender;
  }

  return filter;
};

//Xem tất cả sản phẩm [Admin]
export const index = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const {
    limit = "10",
    page = "1",
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    category,
    status,
    gender
  } = req.query as ProductQueryParams;

  // 1. Xây dựng pagination params
  const paginationParams = buildPagination({
    limit,
    page,
    sortBy,
    sortOrder,
    allowedSortFields: ALLOWED_SORT_FIELDS
  });

  // 2. Xây dựng filter
  const filter = buildProductFilter({ search, category, status, gender });

  // 3. Thực hiện query
  const { items: products, totalItems } = await paginateQuery(
    Product,
    filter,
    paginationParams,
    PRODUCT_POPULATE
  );

  // 4. Tính pagination info
  const pagination = calculatePagination(
    totalItems,
    paginationParams.pageNum,
    paginationParams.limitNum
  );

  return res.status(200).json({
    message: "Tất cả sản phẩm đã có",
    products,
    pagination
  });
});

export const show = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id: string = req.params.id;
  const product = await Product.findById(id)
    .populate("category", "name slug")
    .populate("collection", "name slug");

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

//Thêm mới một sản phẩm [Admin]
export const create = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const result = await validateAndPrepareProduct(req.body);

  if (!result.isValid) {
    return res.status(400).json({
      message: "Dữ liệu không hợp lệ",
      errors: result.errors
    });
  }

  // Tạo và lưu sản phẩm
  const product = new Product(result.preparedData);
  await product.save();
  
  return res.status(201).json({
    message: "Sản phẩm đã được thêm mới",
    product,
  });
});

//Cập nhật một sản phẩm [Admin]
export const update = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id: string = req.params.id;

  // Kiểm tra sản phẩm tồn tại
  const existingProduct = await Product.findById(id);
  if (!existingProduct) {
    return res.status(404).json({
      message: "Sản phẩm không tồn tại",
    });
  }

  // Validate và prepare data (bao gồm auto-gen SEO nếu cần)
  const existingData = {
    name: existingProduct.name,
    description: existingProduct.description,
    price: existingProduct.price,
    category: existingProduct.category?.toString() || "",
    collection: existingProduct.collection?.toString() || "",
    tags: existingProduct.tags,
    thumbnail: existingProduct.thumbnail,
    slug: existingProduct.slug,
    sizeStock: existingProduct.sizeStock
  };
  
  const result = await validateAndPrepareProduct(req.body, existingData);

  if (!result.isValid) {
    return res.status(400).json({
      message: "Dữ liệu không hợp lệ",
      errors: result.errors
    });
  }

  // Update sản phẩm
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { $set: result.preparedData },
    { new: true, runValidators: true }
  )
    .populate("category", "name slug")
    .populate("collection", "name slug");

  return res.status(200).json({
    message: "Cập nhật sản phẩm thành công",
    product: updatedProduct,
  });
});

export const destroy = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id: string = req.params.id;
  
  // Kiểm tra sản phẩm tồn tại
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({
      message: "Sản phẩm không tồn tại",
    });
  }

  // Soft delete sản phẩm
  await Product.updateOne(
    { _id: id },
    { $set: { isDeleted: true, deletedAt: new Date() } }
  );

  return res.status(200).json({
    message: "Xóa sản phẩm thành công",
  });
})

//[Admin] Thay đổi trạng thái sản phẩm
export const changeStatus = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const id: string = req.params.id;
  const { status } = req.body;
  await Product.updateOne(
    {
      _id: id
    }, {
    $set: { status }
  }
  )
  return res.status(200).json({
    message: "Thay đổi trạng thái sản phẩm thành công",
  })
})

//[Admin] Thay đổi trạng thái, xóa nhiều sản phẩm
export const changeAll = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log(req.body);
  const { ids, key, value } = req.body;
  
  if (key === 'status') {
    await Product.updateMany(
      { _id: { $in: ids } },
      { $set: { status: value } }
    );
    return res.status(200).json({
      message: "Thay đổi trạng thái sản phẩm thành công",
    });
  }
  
  if (key === "delete") {
    // Soft delete các sản phẩm
    await Product.updateMany(
      { _id: { $in: ids } },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    
    return res.status(200).json({
      message: "Xóa nhiều sản phẩm thành công",
    });
  }
  
  return res.status(200).json({
    message: "Không có thay đổi nào",
  });
})

export const getStock = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const stockProduct = await Product.find({ isDeleted: false , status: "active"}).select("name sizeStock totalStock totalSold thumbnail");
  return res.status(200).json({
    message: "Lấy tồn kho sản phẩm thành công",
    stockProduct,
  });
})

export const adjustInventory = TryCatch(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId, sizeId } = req.params;
  const { type, quantity } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      message: "Sản phẩm không tồn tại",
    });
  }
  const size = product.sizeStock.find(
    (s) => s._id.toString() === sizeId
  );
    if (!size) {
    return res.status(404).json({
      message: "Kích cỡ sản phẩm không tồn tại",
    });
  }
  if (type === "import") {
    size.stock += quantity;
  } else {
    size.stock -= quantity;
  }
  await product.save();
  return res.status(200).json({
    message: "Cập nhật tồn kho thành công",
  });
})