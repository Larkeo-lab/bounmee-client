import React from "react";
import { Newspaper, Loader2, ChevronLeft, Calendar } from "lucide-react";

import { useGetNews, NewsItem } from "@/services/news/useNews";
import { getDisplayImageUrl } from "@/lib/utils";

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso?.slice(0, 10) || "";
  }
};

export default function News() {
  const [selectedNews, setSelectedNews] = React.useState<NewsItem | null>(null);
  
  // Citizens only see published (ACTIVE) news
  const { data: news = [], isLoading } = useGetNews({ status: "ACTIVE" });

  return (
    // Break out of <main>'s padding so the backdrop fills the whole area
    <div className="relative flex-1 -mx-6 -my-6 md:-mx-10 md:-my-10 overflow-hidden">
      {/* Background: building photo (optional) layered over a soft gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-400" />
      <img
        src="/assets/images/news-bg.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
      <div className="absolute inset-0 bg-white/10" />

      {/* Frosted glass panel */}
      <div className="relative z-10 flex justify-center p-6 md:p-10">
        <div className="w-full max-w-5xl bg-white/25 backdrop-blur-md rounded-[2.5rem] border border-white/40 shadow-2xl px-6 py-8 md:px-10 md:py-10">
          {selectedNews ? (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedNews(null)}
                className="flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-gray-800 bg-white/80 hover:bg-white px-4 py-2 rounded-xl transition cursor-pointer shadow-sm border border-white/40"
              >
                <ChevronLeft size={16} /> ກັບຄືນ / Back
              </button>

              <div className="bg-white/95 rounded-[2rem] border border-white/40 overflow-hidden shadow-xl">
                {selectedNews.image ? (
                  <div className="w-full aspect-video md:aspect-[21/9] bg-slate-100">
                    <img
                      src={getDisplayImageUrl(selectedNews.image)}
                      alt={selectedNews.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = "/assets/logo.png"; }}
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-video md:aspect-[21/9] bg-slate-100 flex items-center justify-center text-gray-300">
                    <Newspaper size={40} />
                  </div>
                )}

                <div className="p-6 md:p-8 space-y-4">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-snug">
                    {selectedNews.title}
                  </h1>

                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                    <Calendar size={13} />
                    <span>{formatDate(selectedNews.createdAt)}</span>
                  </div>

                  <div className="border-t border-gray-200/60" />

                  <p className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedNews.content}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Green pill header */}
              <div className="flex justify-center mb-8">
                <span className="bg-[#075e3d] text-white font-bold text-lg md:text-xl px-12 py-2.5 rounded-full shadow-lg tracking-wide">
                  ຂ່າວສານ
                </span>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-8 h-8 text-[#075e3d] animate-spin" />
                  <p className="text-sm font-bold text-gray-600">ກຳລັງໂຫຼດ...</p>
                </div>
              ) : news.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <Newspaper size={40} className="text-gray-400" />
                  <p className="text-sm font-bold text-gray-600">ຍັງບໍ່ມີຂ່າວສານ</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                  {news.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedNews(item)}
                      className="group bg-white/60 hover:bg-white/80 transition-all rounded-3xl overflow-hidden shadow-sm border border-white/60 flex flex-col cursor-pointer hover:-translate-y-1 duration-300 text-left w-full"
                    >
                      <div className="w-full aspect-[16/10] overflow-hidden bg-slate-100 relative">
                        {item.image ? (
                          <img
                            src={getDisplayImageUrl(item.image)}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => { e.currentTarget.src = "/assets/logo.png"; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Newspaper size={36} />
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <h3 className="font-bold text-sm text-gray-800 line-clamp-2 leading-snug group-hover:text-[#075e3d] transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {item.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold pt-2 border-t border-black/5">
                          <Calendar size={12} className="text-gray-400" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
