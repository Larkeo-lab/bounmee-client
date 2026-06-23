import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, ImagePlus, Loader2, User } from "lucide-react";
import { Button } from "@heroui/react";
import toast from "react-hot-toast";

import PoliceLayout from "@/layouts/PoliceLayout";
import { PoliceSection } from "@/config/sitebar";
import { useAuth } from "@/routes/AuthContext";
import { getDisplayImageUrl } from "@/lib/utils";
import { uploadImage } from "@/services/storage";
import {
  useGetPoliceDistrict,
  useUpdateMyPoliceDistrict,
} from "@/services/police-district/usePoliceDistrict";
import {
  useGetVillageChief,
  useUpdateMyVillageChief,
} from "@/services/village-chief/useVillageChief";

const inputClass =
  "border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#075e3d]/40 focus:border-[#075e3d] transition";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user: authData } = useAuth();
  const account = (authData as any)?.user;
  const userType = account?.userType as string | undefined;

  const isDistrict = userType === "DISTRICT_POLICE";
  const isVillage = userType === "VILLAGE_CHIEF";

  const { data: pd, isLoading: loadingPd } = useGetPoliceDistrict(
    isDistrict ? account?.policeDistrictId : undefined,
  );
  const { data: vc, isLoading: loadingVc } = useGetVillageChief(
    isVillage ? account?.villageChiefId : undefined,
  );
  const detail: any = isDistrict ? pd : isVillage ? vc : null;
  const isLoading = isDistrict ? loadingPd : isVillage ? loadingVc : false;

  const { mutateAsync: updatePd, isPending: savingPd } =
    useUpdateMyPoliceDistrict();
  const { mutateAsync: updateVc, isPending: savingVc } =
    useUpdateMyVillageChief();
  const isSaving = savingPd || savingVc;

  const [chiefName, setChiefName] = React.useState("");
  const [deputyChiefName, setDeputyChiefName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [image, setImage] = React.useState<string | null>(null);
  const [bgImage, setBgImage] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState<"image" | "bg" | null>(null);

  // Prefill once the detail loads
  React.useEffect(() => {
    if (!detail) return;
    setChiefName(detail.chiefName || "");
    setDeputyChiefName(detail.deputyChiefName || "");
    setImage(detail.image ?? null);
    setBgImage(detail.bgImage ?? null);
    const acc = detail.users?.[0];
    setPhone(acc?.phone || account?.phone || "");
    setEmail(acc?.email || account?.email || "");
  }, [detail]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickImage = (which: "image" | "bg") => async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(which);
    try {
      const name = await uploadImage(file);
      if (which === "image") setImage(name);
      else setBgImage(name);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("ອັບໂຫຼດຮູບບໍ່ສຳເລັດ");
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!chiefName.trim()) return toast.error("ກະລຸນາປ້ອນຊື່ຫົວໜ້າ");
    if (!deputyChiefName.trim()) return toast.error("ກະລຸນາປ້ອນຊື່ຮອງຫົວໜ້າ");

    const payload = {
      chiefName: chiefName.trim(),
      deputyChiefName: deputyChiefName.trim(),
      image,
      bgImage,
      email: email.trim() || null,
      phone: phone.trim() || null,
    };

    try {
      if (isDistrict) await updatePd(payload);
      else if (isVillage) await updateVc(payload);
      toast.success("ບັນທຶກໂປຣໄຟລ໌ສຳເລັດ");
    } catch (err: any) {
      console.error("Save profile failed:", err);
      toast.error(err?.response?.data?.message || "ບັນທຶກບໍ່ສຳເລັດ");
    }
  };

  if (!isDistrict && !isVillage) {
    return (
      <PoliceLayout activeSection={"profile" as PoliceSection} title="ໂປຣໄຟລ໌">
        <div className="flex items-center justify-center py-24">
          <p className="text-sm font-bold text-gray-500">
            ບັນຊີນີ້ບໍ່ມີໂປຣໄຟລ໌ໃຫ້ແກ້ໄຂ
          </p>
        </div>
      </PoliceLayout>
    );
  }

  return (
    <PoliceLayout activeSection={"profile" as PoliceSection} title="ແກ້ໄຂໂປຣໄຟລ໌">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <ArrowLeft size={16} /> ກັບຄືນ
        </button>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Cover (bgImage) */}
          <div className="relative h-40 md:h-52 bg-slate-200">
            {bgImage && (
              <img
                src={getDisplayImageUrl(bgImage)}
                alt="cover"
                className="w-full h-full object-cover"
              />
            )}
            <label className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 hover:bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={pickImage("bg")} disabled={uploading !== null} />
              {uploading === "bg" ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
              ປ່ຽນພາບປົກ
            </label>

            {/* Avatar (image) */}
            <div className="absolute -bottom-12 left-6">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-md">
                {image ? (
                  <img src={getDisplayImageUrl(image)} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#075e3d]/10 flex items-center justify-center text-[#075e3d]">
                    <User size={36} />
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white">
                  <input type="file" accept="image/*" className="hidden" onChange={pickImage("image")} disabled={uploading !== null} />
                  {uploading === "image" ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                </label>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 pt-16 space-y-4">
            {isLoading ? (
              <p className="text-sm font-bold text-gray-400">ກຳລັງໂຫຼດ...</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500">ຫົວໜ້າ *</label>
                    <input className={inputClass} value={chiefName} onChange={(e) => setChiefName(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500">ຮອງຫົວໜ້າ *</label>
                    <input className={inputClass} value={deputyChiefName} onChange={(e) => setDeputyChiefName(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500">ເບີໂທ</label>
                    <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500">ອີເມວ</label>
                    <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onPress={handleSave}
                    isDisabled={isSaving || uploading !== null}
                    className="bg-[#075e3d] hover:bg-[#064e32] text-white font-bold rounded-2xl px-8"
                  >
                    {isSaving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PoliceLayout>
  );
}
