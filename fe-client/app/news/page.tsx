import { getNews } from "@/components/services/news.services";
import { INews } from "@/types/news.type";
import Link from "next/link";

async function NewsPage() {
  const response = await getNews();
  const newsList = response?.news as INews[];

  return (
    <div className="px-10 py-8">
      <div className="relative min-h-screen">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-1/4">
            <div className="sticky top-20">
              <h3 className="text-xl font-bold mb-6 border-b pb-2">
                Tin tức phổ biến
              </h3>
              <div className="space-y-6">
                {newsList?.map((item) => (
                  <Link
                    href={`/news/${item._id}`}
                    key={item._id}
                    className="flex gap-4 items-start group cursor-pointer 
                    no-underline text-inherit hover:text-[#8B1E26] 
                    ransition-colors duration-200"
                  >
                    {" "}
                    <div className="flex-shrink-0">
                      <img
                        src={item?.thumbnail?.url}
                        alt={item?.title}
                        className="w-20 h-20 md:w-24 md:h-24 object-cover group-hover:opacity-85 transition-opacity duration-200"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base md:text-lg font-bold line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-200">
                        {item?.title}
                      </h4>
                        {item?.publishedAt && (
                          <p className="text-sm text-gray-500 mt-2">
                            {new Date(item.publishedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full md:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {newsList?.map((item) => (
                <Link href={`/news/${item._id}`} key={item._id}>
                  <div
                    key={item._id}
                    className="flex flex-col group cursor-pointer"
                  >
                    <div className="relative w-full aspect-[4/5] overflow-hidden mb-4">
                      <img
                        src={item?.thumbnail?.url}
                        alt={item?.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                      />
                    </div>

                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
                      News
                    </p>

                    <h3 className="text-xl md:text-[22px] font-medium text-gray-900 mb-3 line-clamp-3 leading-snug group-hover:text-gray-600 transition-colors">
                      {item?.title}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-3 mb-5 leading-relaxed">
                      {item?.summary}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] font-medium text-gray-500 uppercase tracking-wider mt-auto">
                      <span>
                        {item?.publishedAt && new Date(item?.publishedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                      <span>BÀI ĐĂNG CỦA {item?.author}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsPage;
