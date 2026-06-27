import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllPolicySlugs,
  getPolicyBySlug,
} from "@/lib/policies";

interface PolicyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPolicySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicyBySlug(slug);

  if (!policy) {
    return { title: "Không tìm thấy trang" };
  }

  return {
    title: `${policy.title} | Áo Dài Believe`,
    description: policy.description,
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { slug } = await params;
  const policy = getPolicyBySlug(slug);

  if (!policy) {
    notFound();
  }

  return (
    <>
      <section className="bg-[#FAF8F5] px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8B1E26]">
            Chính sách
          </p>
          <h1 className="font-serif text-3xl text-[#2C2C2C] md:text-4xl">
            {policy.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-light leading-relaxed text-gray-600">
            {policy.description}
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Cập nhật lần cuối: {policy.updatedAt}
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          {policy.sections.map((section) => (
            <article key={section.title} className="space-y-4">
              <h2 className="font-serif text-xl text-[#2C2C2C] md:text-2xl">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-base font-light leading-relaxed text-gray-700"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-100 bg-white px-4 py-8">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm text-[#8B1E26] transition hover:text-[#6f1720]"
          >
            ← Về trang chủ
          </Link>
          <Link
            href="/contact"
            className="text-sm text-gray-600 transition hover:text-[#2C2C2C]"
          >
            Liên hệ hỗ trợ
          </Link>
        </div>
      </section>
    </>
  );
}
