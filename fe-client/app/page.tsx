import SectionCategory from "./category";
import SectionExplore from "./explore";
import Banner from "./banner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/UI/carousel";
import Link from "next/link";
import { Package, Scissors, ShieldCheck } from "lucide-react";
function Home() {
  const bannerImages = [
    "/images/1.jpg",
    "/images/2.jpg",
    "/images/3.jpg",
    "/images/4.jpg",
    "/images/5.png",
    "/images/6.png",
  ];

  const data = [
    {
      title: "May đo cá nhân",
      description:
        "Lưu trữ số đo 3D để tạo ra bộ trang phục vừa vặn hoàn hảo nhất.",
      icon: <Scissors className="w-8 h-8 text-[#8B1E26]" />,
    },
    {
      title: "Giao Hàng Miễn Phí",
      description: "Cho mọi đơn hàng nội địa và đóng gói hộp quà tặng cao cấp.",
      icon: <Package className="w-8 h-8 text-[#8B1E26]" />,
    },
    {
      title: "Bảo Hành Trọn Đời",
      description: "Chỉnh sửa size và làm mới trang phục miễn phí trọn đời.",
      icon: <ShieldCheck />,
    },
  ];

  return (
    <>
      <section className="home-banner">
        <Carousel className="w-full">
          <CarouselContent>
            {bannerImages.map((image, index) => (
              <CarouselItem key={index}>
                <Link href="/products">
                  <img src={image} alt={`banner-${index}`} className="w-full" />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      <SectionCategory />
      <SectionExplore />
      <Banner />

      <section className="py-20 px-4 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#D4AF37]">
            {data.map((item, index) => (
              <div
                className="py-4 md:py-0 px-4 flex flex-col items-center"
                key={index}
              >
                <i
                  data-lucide="scissors"
                  className="w-8 h-8 text-[#8B1E26] mb-4"
                >
                  {item.icon}
                </i>
                <h2 className="font-serif text-2xl text-[#2C2C2C] mb-2">
                  {item.title}
                </h2>
                <p className="text-base text-[#2C2C2C] font-light">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
