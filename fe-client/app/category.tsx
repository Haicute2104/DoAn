"use client";

import { getCategories } from "@/components/services/category.services";
import { Category } from "@/types/category.type";
import { useEffect, useState } from "react";
import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/UI/carousel";

import Link from "next/link";

const FALLBACK_IMAGE =
  "https://uploads.nguoidothi.net.vn/content/f29d9806-6f25-41c0-bcf8-4095317e3497.jpg";

function SectionCategory() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchApi = async () => {
      const response = await getCategories();
      const activeCategories = (response.categories as Category[]).filter(
        (cat) => cat.isActive !== false && !cat.isDeleted
      );
      setCategories(activeCategories);
    };
    fetchApi();
  }, []);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="font-serif text-3xl md:text-4xl text-brand-dark mb-4">
            Danh Mục Nổi Bật
          </h2>
          <div className="w-24 h-[2px] bg-[#D4AF37] mx-auto"></div>
        </div>

        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {categories.map((category) => {
              const imageSrc = category.image || FALLBACK_IMAGE;
              const isCloudinary = imageSrc.includes("res.cloudinary.com");

              return (
                <CarouselItem
                  key={category._id}
                  className="basis-[80%] sm:basis-1/2 lg:basis-1/3"
                >
                  <Link
                    href={`/products?category=${category.slug}&page=1`}
                    className="group block relative overflow-hidden h-[600px]"
                  >
                    {isCloudinary ? (
                      <Image
                        src={imageSrc}
                        alt={category.name}
                        fill
                        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <img
                        src={imageSrc}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}

                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-500"></div>

                    <div className="absolute inset-0 flex flex-col justify-end p-8 text-center">
                      <div className="bg-white/90 backdrop-blur-sm py-4 px-6 translate-y-4 group-hover:translate-y-0 transition duration-500">
                        <h3 className="font-serif text-xl text-[#2C2C2C]">
                          {category.name}
                        </h3>

                        <span className="text-xs text-[#8B1E26] uppercase tracking-widest mt-2 block opacity-0 group-hover:opacity-100 transition duration-500 delay-100">
                          Xem thêm
                        </span>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}

export default SectionCategory;
