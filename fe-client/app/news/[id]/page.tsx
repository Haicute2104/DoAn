import { getNewsById } from "@/components/services/news.services";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/UI/breadcrumb";
import { INews } from "@/types/news.type";
import Link from "next/link";

async function NewsDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const response = await getNewsById(id);
  const news = response.news as INews;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Trang chủ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/news">Tin tức</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{news.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Article Header */}
      <header className="max-w-3xl mx-auto px-6 py-10 text-center">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
          News
        </p>
        <h1 className="text-4xl md:text-5xl font-serif font-medium text-gray-900 leading-tight mb-6">
          {news.title}
        </h1>
        <div className="flex items-center gap-3 text-[13px] font-medium text-gray-500 uppercase tracking-wider mt-auto justify-center">
          {news?.publishedAt && (
            <span>
              {new Date(news.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
          <span>BÀI ĐĂNG CỦA {news?.author}</span>
        </div>
      </header>

      {/* Hero Image */}
      <div className="max-w-5xl mx-auto px-6 mb-12">
        <div className="w-full aspect-video overflow-hidden rounded-xl shadow-md">
          <img
            src={news.thumbnail.url}
            alt={news.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Article Body */}
      <article className="max-w-5xl mx-auto px-6 pb-20">
        {/* Summary / Lead */}
        <p className="text-lg md:text-xl text-gray-600 italic leading-relaxed border-l-4 border-[#8B1E26] pl-5 mb-10">
          {news.summary}
        </p>

        <hr className="border-gray-200 mb-10" />

        {/* Main Content */}
        <div
          className="prose prose-base md:prose-lg max-w-none
            prose-headings:font-serif prose-headings:text-gray-900
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-[#8B1E26] prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-none
            prose-blockquote:border-l-[#8B1E26] prose-blockquote:text-gray-500 prose-blockquote:italic text-lg font-sans"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />
      </article>
    </div>
  );
}

export default NewsDetailPage;
