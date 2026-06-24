import React from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Loader2,
  Upload,
  ImagePlus,
  ArrowLeft,
  Newspaper,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardBody,
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";

import { useAuth } from "@/routes/AuthContext";
import { uploadImage } from "@/services/storage";
import {
  useGetNews,
  useCreateNews,
  useUpdateNews,
  useDeleteNews,
  NewsStatus,
  NewsItem,
} from "@/services/news/useNews";
import { getDisplayImageUrl } from "@/lib/utils";

const STATUS_CONFIG: Record<NewsStatus, { label: string; className: string }> = {
  PENDING: { label: "ລໍຖ້າເຜີຍແຜ່", className: "bg-amber-100 text-amber-700" },
  ACTIVE: { label: "ເຜີຍແຜ່ແລ້ວ", className: "bg-emerald-100 text-emerald-700" },
  INACTIVE: { label: "ຍົກເລີກ", className: "bg-gray-200 text-gray-600" },
};

const STATUS_OPTIONS: { value: NewsStatus; label: string }[] = [
  { value: "ACTIVE", label: "ສະແດງ" },
  { value: "INACTIVE", label: "ບໍ່ສະແດງ " },
];

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

type Tab = "all" | "mine";

export default function NewsSection() {
  const queryClient = useQueryClient();
  const { user: authData } = useAuth();
  const userId = (authData as any)?.user?.id;
  const userType = (authData as any)?.user?.userType as string | undefined;
  // Only the Police Department can create/manage news; others view only.
  const canManage = userType === "POLICE_DEPARTMENT";

  const [tab, setTab] = React.useState<Tab>("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<NewsItem | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<NewsItem | null>(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { mutateAsync: deleteNews, isPending: isDeleting } = useDeleteNews();

  // "all" shows only published (ACTIVE) news; "mine" shows all of my own so I can manage them
  const filters = tab === "mine"
    ? { createdBy: userId }
    : { status: "ACTIVE" as NewsStatus };
  const { data: news = [], isLoading } = useGetNews(filters);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["news"] });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteNews(deleteTarget.id);
      toast.success("ລຶບສຳເລັດ");
      refresh();
    } catch (err) {
      console.error("Delete news failed:", err);
      toast.error("ລຶບບໍ່ສຳເລັດ");
    } finally {
      onOpenChange();
      setDeleteTarget(null);
    }
  };

  if (formOpen) {
    return (
      <NewsForm
        editing={editing}
        onCancel={() => { setFormOpen(false); setEditing(null); }}
        onSaved={() => {
          setFormOpen(false);
          setEditing(null);
          setTab("mine");
          refresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Tabs + create button */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
          <button
            onClick={() => setTab("all")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${tab === "all" ? "bg-[#075e3d] text-white" : "text-gray-500 hover:text-gray-700"
              }`}
          >
            ຂ່າວທັງໝົດ
          </button>
          {canManage && (
            <button
              onClick={() => setTab("mine")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${tab === "mine" ? "bg-[#075e3d] text-white" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              ຂ່າວຂອງຂ້ອຍ
            </button>
          )}
        </div>

        {canManage && (
          <Button
            startContent={<Plus size={18} />}
            onPress={() => { setEditing(null); setFormOpen(true); }}
            className="bg-[#075e3d] hover:bg-[#064e32] text-white font-bold rounded-2xl cursor-pointer"
          >
            ສ້າງຂ່າວ
          </Button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#075e3d] animate-spin" />
        </div>
      ) : news.length === 0 ? (
        <Card className="shadow-sm border border-gray-100 rounded-3xl">
          <CardBody className="p-10 flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Newspaper size={28} className="text-gray-400" />
            </div>
            <p className="text-sm font-bold text-gray-500">
              {tab === "mine" ? "ທ່ານຍັງບໍ່ໄດ້ສ້າງຂ່າວ" : "ຍັງບໍ່ມີຂ່າວ"}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {news.map((item) => {
            const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;

            return (
              <Card key={item.id} className="shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                <CardBody className="p-0">
                  <div className="relative w-full aspect-video bg-slate-100">
                    {item.image ? (
                      <img
                        src={getDisplayImageUrl(item.image)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = "/assets/logo.png"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Newspaper size={32} />
                      </div>
                    )}
                    {/* Edit / delete actions — only on "my news" tab (manage role) */}
                    {canManage && tab === "mine" && (
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        <button
                          onClick={() => { setEditing(item); setFormOpen(true); }}
                          className="w-8 h-8 rounded-lg bg-white/90 hover:bg-white flex items-center justify-center text-gray-600 shadow cursor-pointer"
                          title="ແກ້ໄຂ"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => { setDeleteTarget(item); onOpen(); }}
                          className="w-8 h-8 rounded-lg bg-white/90 hover:bg-white flex items-center justify-center text-red-500 shadow cursor-pointer"
                          title="ລຶບ"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-gray-800 line-clamp-2">{item.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${st.className}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{item.content}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 pt-1">
                      <Calendar size={11} /> {formatDate(item.createdAt)}
                    </p>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete confirm */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" backdrop="blur">
        <ModalContent>
          <ModalBody className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h3 className="font-bold text-lg">ຢືນຢັນການລຶບ</h3>
            <p className="text-sm text-gray-500">ລຶບຂ່າວ “{deleteTarget?.title}” ?</p>
          </ModalBody>
          <ModalFooter className="justify-center">
            <Button variant="bordered" className="font-bold rounded-xl px-6" onPress={onOpenChange}>
              ຍົກເລີກ
            </Button>
            <Button
              isDisabled={isDeleting}
              onPress={handleDelete}
              className="bg-red-500 text-white font-bold rounded-xl px-6"
            >
              {isDeleting ? "ກຳລັງລຶບ..." : "ລຶບ"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

function NewsForm({
  editing,
  onCancel,
  onSaved,
}: {
  editing: NewsItem | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!editing;
  const { mutateAsync: createNews } = useCreateNews();
  const { mutateAsync: updateNews } = useUpdateNews();

  const [title, setTitle] = React.useState(editing?.title || "");
  const [content, setContent] = React.useState(editing?.content || "");
  const [image, setImage] = React.useState(editing?.image || "");
  const [status, setStatus] = React.useState<NewsStatus>(editing?.status || "ACTIVE");
  const [uploading, setUploading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const name = await uploadImage(file);
      setImage(name);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("ອັບໂຫຼດຮູບບໍ່ສຳເລັດ");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return toast.error("ກະລຸນາປ້ອນຫົວຂໍ້");
    if (!content.trim()) return toast.error("ກະລຸນາປ້ອນເນື້ອໃນ");
    if (!image) return toast.error("ກະລຸນາອັບໂຫຼດຮູບ");

    setIsSubmitting(true);
    try {
      if (isEdit && editing) {
        await updateNews({
          id: editing.id,
          payload: { title: title.trim(), content: content.trim(), image, status },
        });
        toast.success("ບັນທຶກສຳເລັດ");
      } else {
        await createNews({ title: title.trim(), content: content.trim(), image, status });
        toast.success("ສ້າງຂ່າວສຳເລັດ");
      }
      onSaved();
    } catch (err) {
      console.error("Save news failed:", err);
      toast.error("ບັນທຶກບໍ່ສຳເລັດ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#075e3d]/40 focus:border-[#075e3d] transition";

  return (
    <div className="space-y-4 w-full">
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
      >
        <ArrowLeft size={16} /> ກັບຄືນ
      </button>

      <Card className="shadow-sm border border-gray-100 rounded-3xl">
        <CardBody className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">{isEdit ? "ແກ້ໄຂຂ່າວ" : "ສ້າງຂ່າວໃໝ່"}</h2>

          {/* Image */}
          <div className="flex flex-col items-center space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">ຮູບຂ່າວ / Image *</span>
            <div className="relative w-64 max-w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-slate-50 flex items-center justify-center overflow-hidden group">
              {uploading ? (
                <Loader2 className="w-7 h-7 text-[#075e3d] animate-spin" />
              ) : (
                <>
                  {image && <img src={getDisplayImageUrl(image)} alt="news" className="w-full h-full object-cover" />}
                  <label className={`absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-xs font-semibold transition-opacity ${image ? "bg-black/40 text-white opacity-0 group-hover:opacity-100" : "text-[#075e3d]"}`}>
                    {image ? <Upload size={22} className="mb-1" /> : <ImagePlus size={26} className="mb-1" />}
                    {image ? "ປ່ຽນຮູບ" : "ອັບໂຫຼດຮູບ"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col space-y-1">
            <label htmlFor="news-title" className="text-xs font-bold text-gray-500 uppercase tracking-wide">ຫົວຂໍ້ / Title *</label>
            <input
              id="news-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ຫົວຂໍ້ຂ່າວ..."
              className={inputClass}
            />
          </div>

          {/* Content */}
          <div className="flex flex-col space-y-1">
            <label htmlFor="news-content" className="text-xs font-bold text-gray-500 uppercase tracking-wide">ເນື້ອໃນ / Content *</label>
            <textarea
              id="news-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="ເນື້ອໃນຂ່າວ..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Status */}
          <div className="flex flex-col space-y-1">
            <label htmlFor="news-status" className="text-xs font-bold text-gray-500 uppercase tracking-wide">ສະຖານະ / Status</label>
            <select
              id="news-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as NewsStatus)}
              className={`${inputClass} cursor-pointer`}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onPress={onCancel}
              variant="bordered"
              className="flex-1 font-bold rounded-2xl py-3 border-gray-300 text-gray-600 cursor-pointer"
            >
              ຍົກເລີກ
            </Button>
            <Button
              onPress={handleSubmit}
              isDisabled={isSubmitting || uploading}
              className="flex-1 bg-[#075e3d] hover:bg-[#064e32] text-white font-bold rounded-2xl py-3 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "ກຳລັງບັນທຶກ..." : isEdit ? "ບັນທຶກ ✓" : "ສ້າງຂ່າວ ✓"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
