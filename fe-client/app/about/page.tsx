import ImageCarousel, { CarouselItem } from "@/components/UI/imageCarousel";
import { Smile } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function AboutPage() {
  const persons: CarouselItem[] = [
    {
      name: "Đồng dao",
      title: "BST",
      img: "/images/dong-dao.jpg",
    },
    {
      name: "Giữa 2 mùa gió",
      title: "BST",
      img: "/images/giua-2-mua-gio.jpg",
    },
    {
      name: "Lưu Phương",
      title: "BST",
      img: "/images/luu-phuong.jpg",
    },
    {
      name: "Mã Mây",
      title: "BST",
      img: "/images/ma-may.jpg",
    },
    {
      name: "Ngạo Vân",
      title: "BST",
      img: "/images/ngao-van.jpg",
    },
    {
      name: "Xuân cẩm tú",
      title: "BST",
      img: "/images/xuan-cam-tu.jpg",
    },
    {
      name: "Lưu Phương",
      title: "BST",
      img: "/images/luu-phuong.jpg",
    },
  ];

  const data = [
    {
      title: "Chất lượng thượng hạng",
      des: "Sử dụng 100% lụa tơ tằm dệt thủ công từ các làng nghề truyền thống như Vạn Phúc, Bảo Lộc. Mang lại cảm giác mềm mại, rủ dáng và nâng niu làn da.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-feather-icon lucide-feather"><path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z" /><path d="M16 8 2 22" /><path d="M17.5 15H9" /></svg>
    },
    {
      title: "Kỹ Thuật May Đo",
      des: "Đội ngũ nghệ nhân với hơn 20 năm kinh nghiệm. Kỹ thuật cắt cúp 3D hiện đại kết hợp đường may giấu chỉ thủ công, tạo nên form dáng ôm khít hoàn hảo.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-scissors-icon lucide-scissors"><circle cx="6" cy="6" r="3" /><path d="M8.12 8.12 12 12" /><path d="M20 4 8.12 15.88" /><circle cx="6" cy="18" r="3" /><path d="M14.8 14.8 20 20" /></svg>
    },
    {
      title: "Chi Tiết Độc Bản",
      des: "Nghệ thuật thêu tay ruy băng, đính kết pha lê và khảm trai được thực hiện tỉ mỉ hàng trăm giờ, biến mỗi chiếc áo dài thành một tác phẩm nghệ thuật duy nhất.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles-icon lucide-sparkles"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" /><path d="M20 2v4" /><path d="M22 4h-4" /><circle cx="4" cy="20" r="2" /></svg>
    }
  ]
  return (
    <>
      {/* HERO */}
      <section className="bg-[#FAF8F5] relative flex flex-col justify-between">
        <div className="w-full min-h-screen flex items-center justify-center px-6">
          <div className="w-full max-w-3xl text-center">
            <p className="text-[#D7B544] uppercase tracking-[0.3em] text-xs md:text-sm font-semibold mb-4">
              Câu chuyện về chúng tôi
            </p>

            <h2 className="font-serif text-[#8B1E26] text-3xl sm:text-4xl md:text-6xl font-medium leading-tight mb-6">
              Tôn vinh vẻ đẹp <br className="hidden sm:block" />
              vượt thời gian
            </h2>

            <p className="text-base md:text-xl text-gray-700 font-light leading-relaxed">
              Tịnh Hương không chỉ tạo ra những tà áo dài, chúng tôi dệt nên những giấc mơ,
              lưu giữ nét duyên dáng của người phụ nữ Việt Nam qua từng đường kim mũi chỉ.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-col absolute bottom-[10%] left-1/2 -translate-x-1/2">
          <p className="text-[#8B1E26] text-xs md:text-sm font-semibold uppercase tracking-[0.3em]">
            Khám phá ngay
          </p>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-bounce text-[#8B1E26]"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </section>

      {/* STORY */}
      <section className="bg-[#FAF8F5] px-6" id="story">
        <div className="max-w-7xl mx-auto py-16 md:py-24 flex flex-col lg:flex-row items-center gap-12">

          {/* IMAGE */}
          <div className="w-full lg:w-1/2 relative flex justify-center">
            <div className="w-full max-w-sm md:max-w-md aspect-[3/4] overflow-hidden rounded-t-full relative z-10 shadow-2xl">
              <Image
                src="/images/story.jpg"
                alt="Thiếu nữ Việt Nam trong tà áo dài"
                width={500}
                height={700}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 md:w-64 md:h-64 bg-[#D7B544]/10 rounded-full blur-2xl"></div>
          </div>

          {/* TEXT */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 text-center lg:text-left">

            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="h-px w-12 bg-[#D7B544]"></div>
              <p className="font-serif text-lg md:text-xl italic text-[#D7B544]">
                Khởi nguồn
              </p>
            </div>

            <div>
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#2C2C2C] leading-snug">
                Tình yêu nồng nàn
              </h3>
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#8B1E26] leading-snug">
                Với di sản văn hóa Việt Nam
              </h3>
            </div>

            <p className="text-base md:text-lg text-[#2C2C2C] font-light leading-relaxed text-justify">
              Ra đời từ một xưởng may nhỏ giữa lòng thôn quê Hà Tây cũ, Hải cutee bắt đầu
              hành trình của mình với một niềm đam mê mãnh liệt dành cho quốc phục Việt Nam.
              Chúng tôi tin rằng, tà áo dài không chỉ đơn thuần là một trang phục, mà là biểu tượng kiêu hãnh,
              là hiện thân của vẻ đẹp nhu mì nhưng đầy sức sống của người phụ nữ.
              Mỗi thiết kế tại Tịnh Hương là sự giao thoa hoàn hảo giữa nét đài các truyền thống
              và nhịp thở hiện đại.
            </p>

            <p className="text-[#8B1E26] text-xs md:text-sm font-semibold uppercase tracking-[0.3em]">
              Trần Văn Hải - Người sáng lập
            </p>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="bg-[#FAF8F5] px-6 py-10 md:py-0">
        <div className="max-w-7xl mx-auto md:py-10 text-center">

          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#2C2C2C] mb-6">
            Trải nghiệm nét duyên dáng cùng shop
          </h2>

          <p className="text-base md:text-lg text-[#2C2C2C] font-light leading-relaxed max-w-3xl mx-auto mb-10">
            Khám phá bộ sưu tập mới nhất với những thiết kế lấy cảm hứng từ mùa xuân Hà Nội.
          </p>
          <ImageCarousel data={persons} />
          <div className="flex justify-center mt-3 ">
            <Link
              href="products"
              className="text-white text-base md:text-lg font-semibold px-6 py-3 bg-[#8B1E26] rounded-md hover:bg-[#6f1720] transition"
            >
              Khám phá bộ sưu tập
            </Link>
          </div>

        </div>
      </section>
      <section className="py-20">
        <div className="flex flex-col items-center justify-center gap-1">
          <h2 className="text-4xl text-[#2C2C2C] font-serif">Tinh hoa tạo tác</h2>
          <div className="line w-24 h-1 bg-[#8B1E26]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto py-10">
          {data.map((item, index) => (
            <div className="text-center space-y-6 group p-6 rounded-2xl hover:bg-[#FAF8F5] transition-colors duration-300" key={index}>
              <div className="w-20 h-20 mx-auto bg-[#FAF8F5] group-hover:bg-white rounded-full flex items-center justify-center text-[#8B1E26] shadow-sm transition-colors duration-300">
                {item.icon}
              </div>
              <h3 className="font-serif text-2xl text-[#2C2C2C]">{item.title}</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                {item.des}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#2C2C2C] py-20">
        <div className="flex flex-col items-center justify-center gap-5 max-w-7xl mx-auto">
        <Smile className="w-20 h-20 text-[#fff]" />
          <h2 className="text-5xl text-[#fff] font-serif text-center max-w-5xl">"Một người phụ nữ mặc áo dài đẹp không chỉ bởi vóc dáng, mà còn bởi cốt cách và thần thái toát ra từ bên trong."</h2>
        </div>
      </section>
    </>
  );
}

export default AboutPage;