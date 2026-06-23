import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  Camera,
  Loader2,
  User,
  Mail,
  Phone,
  CreditCard,
  Upload,
} from "lucide-react";
import { Card, CardBody, Button } from "@heroui/react";

import { uploadImage } from "@/services/storage";
import { useUpdateCitizen } from "@/services/citizen/useCitizen";
import { useAuth } from "@/routes/AuthContext";
import { getDisplayImageUrl } from "@/lib/utils";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user: authData, updateAuthState } = useAuth();
  const { mutateAsync: updateCitizen } = useUpdateCitizen();

  const account = (authData as any)?.user;
  const citizen = account?.citizen;

  // Editable citizen fields
  const [firstName, setFirstName] = React.useState(citizen?.firstName || "");
  const [lastName, setLastName] = React.useState(citizen?.lastName || "");
  const [dateOfBirth, setDateOfBirth] = React.useState(
    citizen?.dateOfBirth ? String(citizen.dateOfBirth).slice(0, 10) : "",
  );
  const [gender, setGender] = React.useState(citizen?.gender || "MALE");
  const [cartNumber, setCartNumber] = React.useState(citizen?.cartNumber || "");
  const [profileImage, setProfileImage] = React.useState(account?.profileImage || "");
  const [cartImage, setCartImage] = React.useState(citizen?.cartImage || "");
  const [cartImageBack, setCartImageBack] = React.useState(citizen?.cartImageBack || "");

  // Upload / submit states
  const [uploadingProfile, setUploadingProfile] = React.useState(false);
  const [uploadingFront, setUploadingFront] = React.useState(false);
  const [uploadingBack, setUploadingBack] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  if (!citizen?.id) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-[#d9d9d9] p-6 text-center">
        <p className="text-gray-600 font-bold mb-4">
          ບໍ່ພົບຂໍ້ມູນໂປຣໄຟລ໌ / Profile not found
        </p>
        <Button
          className="bg-[#075e3d] text-white font-bold rounded-xl px-6"
          onPress={() => navigate("/home")}
        >
          ກັບໜ້າຫຼັກ
        </Button>
      </div>
    );
  }

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "front" | "back",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setUploading =
      type === "profile" ? setUploadingProfile : type === "front" ? setUploadingFront : setUploadingBack;

    setUploading(true);
    try {
      const name = await uploadImage(file);
      if (type === "profile") setProfileImage(name);
      else if (type === "front") setCartImage(name);
      else setCartImageBack(name);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("ອັບໂຫຼດຮູບບໍ່ສຳເລັດ");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim()) return toast.error("ກະລຸນາປ້ອນຊື່ແທ້");
    if (!lastName.trim()) return toast.error("ກະລຸນາປ້ອນນາມສະກຸນ");
    if (!cartNumber.trim()) return toast.error("ກະລຸນາປ້ອນເລກບັດປະຈຳຕົວ");

    // Only send fields that actually changed — sending an unchanged cartNumber
    // would re-trigger the server's duplicate-card check and fail.
    const origDob = citizen.dateOfBirth ? String(citizen.dateOfBirth).slice(0, 10) : "";
    const payload: Record<string, any> = {};

    if (firstName.trim() !== (citizen.firstName || "")) payload.firstName = firstName.trim();
    if (lastName.trim() !== (citizen.lastName || "")) payload.lastName = lastName.trim();
    if (dateOfBirth !== origDob) {
      payload.dateOfBirth = dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined;
    }
    if (gender !== (citizen.gender || "MALE")) payload.gender = gender;
    if (cartNumber.trim() !== (citizen.cartNumber || "")) payload.cartNumber = cartNumber.trim();
    if (profileImage !== (account.profileImage || "")) payload.profileImage = profileImage || null;
    if (cartImage !== (citizen.cartImage || "")) payload.cartImage = cartImage || undefined;
    if ((cartImageBack || "") !== (citizen.cartImageBack || "")) payload.cartImageBack = cartImageBack || null;

    if (Object.keys(payload).length === 0) {
      toast("ບໍ່ມີການປ່ຽນແປງ / No changes");
      navigate(-1);

      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateCitizen({ id: citizen.id, payload });

      // Reflect the change in the local auth state so the avatar/name update everywhere
      if (authData) {
        updateAuthState({
          ...(authData as any),
          user: {
            ...account,
            profileImage: updated.profileImage ?? account.profileImage,
            citizen: { ...citizen, ...updated },
          },
        });
      }

      toast.success("ບັນທຶກໂປຣໄຟລ໌ສຳເລັດ");
      navigate(-1);
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error("ບັນທຶກບໍ່ສຳເລັດ");
    } finally {
      setIsSaving(false);
    }
  };

  const genders = [
    { value: "MALE", label: "ຊາຍ / Male" },
    { value: "FEMALE", label: "ຍິງ / Female" },
    { value: "OTHER", label: "ອື່ນໆ / Other" },
  ];

  const inputClass =
    "border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#075e3d]/40 focus:border-[#075e3d] transition";

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
        <span className="text-base font-bold tracking-wide">ແກ້ໄຂໂປຣໄຟລ໌ / Edit Profile</span>
        <div className="w-9" />
      </nav>

      {/* Content */}
      <main className="flex-1 bg-[#d9d9d9] flex flex-col p-6 md:p-10">
        <div className="max-w-2xl mx-auto w-full space-y-4">

          {/* Avatar */}
          <Card className="shadow-sm border border-gray-100 rounded-3xl">
            <CardBody className="p-6 flex flex-col items-center gap-3">
              <div className="relative w-28 h-28">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#075e3d]/20 bg-slate-100 flex items-center justify-center">
                  {uploadingProfile ? (
                    <Loader2 className="w-8 h-8 text-[#075e3d] animate-spin" />
                  ) : profileImage ? (
                    <img src={getDisplayImageUrl(profileImage)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-gray-300" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-[#075e3d] text-white rounded-full p-2 shadow-md cursor-pointer hover:bg-[#064e32] transition-colors">
                  <Camera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e, "profile")}
                  />
                </label>
              </div>
              <p className="text-sm font-bold text-gray-700">
                {firstName} {lastName}
              </p>
            </CardBody>
          </Card>

          {/* Personal Info */}
          <Card className="shadow-sm border border-gray-100 rounded-3xl">
            <CardBody className="p-6 space-y-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <User size={18} className="text-[#075e3d]" />
                <span>ຂໍ້ມູນສ່ວນຕົວ / Personal Info</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">ຊື່ແທ້ / First Name *</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">ນາມສະກຸນ / Last Name *</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">ວັນເດືອນປີເກີດ / Date of Birth</label>
                  <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={inputClass} />
                </div>
                <div className="flex flex-col space-y-1">
                  <label htmlFor="gender" className="text-xs font-bold text-gray-500 uppercase tracking-wide">ເພດ / Gender</label>
                  <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className={`${inputClass} cursor-pointer`}>
                    {genders.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Identity / Card */}
          <Card className="shadow-sm border border-gray-100 rounded-3xl">
            <CardBody className="p-6 space-y-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <CreditCard size={18} className="text-[#075e3d]" />
                <span>ບັດປະຈຳຕົວ / ID Card</span>
              </h2>

              <div className="flex flex-col space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">ເລກບັດປະຈຳຕົວ / Card Number *</label>
                <input type="text" value={cartNumber} onChange={(e) => setCartNumber(e.target.value)} className={inputClass} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Front */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">ຮູບໜ້າບັດ / Front</label>
                  <div className="relative h-36 rounded-xl border-2 border-dashed border-gray-300 bg-slate-50 flex items-center justify-center overflow-hidden group">
                    {uploadingFront ? (
                      <Loader2 className="w-7 h-7 text-[#075e3d] animate-spin" />
                    ) : (
                      <>
                        {cartImage && <img src={getDisplayImageUrl(cartImage)} alt="Front" className="w-full h-full object-cover" />}
                        <label className={`absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-xs font-semibold transition-opacity ${cartImage ? "bg-black/40 text-white opacity-0 group-hover:opacity-100" : "text-[#075e3d]"}`}>
                          <Upload size={20} className="mb-1" />
                          {cartImage ? "ປ່ຽນຮູບ" : "ອັບໂຫຼດ"}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "front")} />
                        </label>
                      </>
                    )}
                  </div>
                </div>

                {/* Back */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">ຮູບຫຼັງບັດ / Back</label>
                  <div className="relative h-36 rounded-xl border-2 border-dashed border-gray-300 bg-slate-50 flex items-center justify-center overflow-hidden group">
                    {uploadingBack ? (
                      <Loader2 className="w-7 h-7 text-[#075e3d] animate-spin" />
                    ) : (
                      <>
                        {cartImageBack && <img src={getDisplayImageUrl(cartImageBack)} alt="Back" className="w-full h-full object-cover" />}
                        <label className={`absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-xs font-semibold transition-opacity ${cartImageBack ? "bg-black/40 text-white opacity-0 group-hover:opacity-100" : "text-[#075e3d]"}`}>
                          <Upload size={20} className="mb-1" />
                          {cartImageBack ? "ປ່ຽນຮູບ" : "ອັບໂຫຼດ"}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "back")} />
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Account Info (read-only — managed by account, no update endpoint) */}
          <Card className="shadow-sm border border-gray-100 rounded-3xl">
            <CardBody className="p-6 space-y-3">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Mail size={18} className="text-[#075e3d]" />
                <span>ຂໍ້ມູນບັນຊີ / Account</span>
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={15} className="text-gray-400" />
                  <span className="font-semibold">{account?.userName || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={15} className="text-gray-400" />
                  <span className="font-semibold">{account?.email || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={15} className="text-gray-400" />
                  <span className="font-semibold">{account?.phone || "-"}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Save */}
          <div className="flex gap-3 pb-6">
            <Button
              onClick={() => navigate(-1)}
              variant="bordered"
              className="flex-1 font-bold rounded-2xl py-3 border-gray-300 text-gray-600 cursor-pointer"
            >
              ຍົກເລີກ
            </Button>
            <Button
              onClick={handleSave}
              isDisabled={isSaving || uploadingProfile || uploadingFront || uploadingBack}
              className="flex-1 bg-[#075e3d] hover:bg-[#064e32] text-white font-bold rounded-2xl py-3 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ ✓"}
            </Button>
          </div>

        </div>
      </main>

      <footer className="bg-[#075e3d] h-12 w-full shadow-inner" />
    </div>
  );
}
