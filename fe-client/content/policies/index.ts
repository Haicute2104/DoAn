import { Policy } from "@/types/policy.type";
import chinhSachMuaHang from "./chinh-sach-mua-hang/content.json";
import chinhSachDoiTra from "./chinh-sach-doi-tra/content.json";
import chinhSachBaoMat from "./chinh-sach-bao-mat/content.json";
import chinhSachVanChuyen from "./chinh-sach-van-chuyen/content.json";
import dieuKhoanDichVu from "./dieu-khoan-dich-vu/content.json";

export const policies: Policy[] = [
  chinhSachMuaHang,
  chinhSachDoiTra,
  chinhSachBaoMat,
  chinhSachVanChuyen,
  dieuKhoanDichVu,
];

export const policyLinks = policies.map(({ slug, title }) => ({
  slug,
  title,
  href: `/policies/${slug}`,
}));
