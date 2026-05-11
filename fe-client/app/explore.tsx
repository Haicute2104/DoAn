import Image from "next/image";
import Link from "next/link";

function SectionExplore() {
  return (
    <>
      <section className="py-24 px-4 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-space-between gap-4">
            <div className="lg:w-1/2 relative min-h-[600px]">
              <Image
                src="/images/explore.jpg"
                fill
                alt="Thợ thủ công may áo dài"
                className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
            </div>
            <div className="lg:w-1/2 flex items-center justify-center p-12 lg:p-24">
              <div className="max-w-lg space-y-8 fade-in-up">
                <span className="text-[#D7B544] uppercase tracking-[0.3em] text-sm font-semibold block">
                  Nghệ thuật thủ công
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-[#2C2C2C] leading-snug">
                  Tôn vinh vẻ đẹp <br />
                  <span className="italic font-light text-[#8B1E26]">
                    độc bản
                  </span>
                </h2>
                <p className="text-gray-600 font-light leading-relaxed">
                  Tại Tịnh Hương, mỗi chiếc áo dài là một tác phẩm nghệ thuật
                  được dệt nên từ lụa tơ tằm thượng hạng và tình yêu mãnh liệt
                  với văn hóa dân tộc. Chúng tôi tự hào áp dụng kỹ thuật may đo
                  tinh xảo kết hợp cùng nghệ thuật đính kết thủ công truyền
                  thống.
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center text-[#2C2C2C] font-medium uppercase tracking-widest text-sm hover:text-brand-red transition-colors group"
                >
                  Khám phá câu chuyện
                  <div className="w-8 h-[1px] bg-[#2C2C2C] ml-4 group-hover:bg-[#8B1E26] group-hover:w-18 transition-all"></div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
export default SectionExplore;
