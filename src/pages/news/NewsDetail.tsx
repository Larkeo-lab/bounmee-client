import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Calendar, AlertCircle, ImageOff, Loader2 } from "lucide-react";
import { Card, CardBody, Button } from "@heroui/react";

import { useGetNewsById } from "@/services/news/useNews";
import { getDisplayImageUrl } from "@/lib/utils";

const formatDate = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
};

export default function NewsDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: article, isLoading } = useGetNewsById(id);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm h-20 z-10">
        <div className="flex items-center space-x-3">
          <img
            src="/assets/logo.png"
            alt="Ministry Logo"
            className="h-12 w-auto object-contain"
            onError={(e) => { e.currentTarget.src = "/logo.png"; }}
          />
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-bold text-[#075e3d] leading-tight">
              ກະຊວງປ້ອງກັນຄວາມສະຫງົບ
            </span>
            <span className="text-xs md:text-sm font-semibold text-gray-500 tracking-wide">
              Ministry of Public Security
            </span>
          </div>
        </div>
      </header>

      {/* Green Nav Bar */}
      <nav className="bg-[#075e3d] text-white h-14 flex items-center justify-between px-6 shadow-md relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-95 cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft size={26} />
        </button>
        <span className="text-base font-bold tracking-wide">ຂ່າວສານ / News</span>
        <div className="w-9" />
      </nav>

      {/* Content */}
      <main className="flex-1 bg-[#d9d9d9] flex flex-col p-6 md:p-10">
        <div className="max-w-2xl mx-auto w-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-[#075e3d] animate-spin" />
              <p className="text-sm font-bold text-gray-500">ກຳລັງໂຫຼດ...</p>
            </div>
          ) : !article ? (
            <Card className="shadow-sm border border-gray-100 rounded-3xl">
              <CardBody className="p-10 flex flex-col items-center text-center gap-4">
                <AlertCircle size={40} className="text-red-400" />
                <p className="text-sm font-bold text-gray-500">
                  ບໍ່ພົບຂ່າວ<br />News not found
                </p>
                <Button
                  onClick={() => navigate(-1)}
                  className="bg-[#075e3d] text-white font-bold rounded-2xl px-6 cursor-pointer"
                >
                  ກັບຄືນ
                </Button>
              </CardBody>
            </Card>
          ) : (
            <Card className="shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
              {/* Hero image */}
              {article.image ? (
                <div className="w-full aspect-video bg-slate-100">
                  <img
                    src={getDisplayImageUrl(article.image)}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = "/assets/logo.png"; }}
                  />
                </div>
              ) : (
                <div className="w-full aspect-video bg-slate-100 flex items-center justify-center text-gray-300">
                  <ImageOff size={40} />
                </div>
              )}

              <CardBody className="p-6 space-y-4">
                <h1 className="text-xl font-bold text-gray-800 leading-snug">
                  {article.title}
                </h1>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                  <Calendar size={13} />
                  <span>{formatDate(article.createdAt)}</span>
                </div>

                <div className="border-t border-gray-100" />

                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {article.content}
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </main>

      <footer className="bg-[#075e3d] h-12 w-full shadow-inner" />
    </div>
  );
}
