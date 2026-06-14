import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  Upload,
  FileText,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { Card, CardBody, Button } from "@heroui/react";

import { uploadImage } from "@/services/storage";
import { useCreateReport } from "@/services/report/useReport";
import { useGetAllProvinces } from "@/services/province/useProvince";
import { useGetDistrictsByProvince } from "@/services/district/useDistrict";
import { useGetVillagesByDistrict } from "@/services/village/useVillage";
import { API_BASE_URL } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

type IncidentType = "theft" | "assault" | "fraud" | "traffic" | "other" | "";

export default function Report() {
  const navigate = useNavigate();
  const { mutateAsync: createReport } = useCreateReport();

  // Step state
  const [step, setStep] = React.useState<1 | 2 | 3>(1);

  // Step 1
  const [incidentType, setIncidentType] = React.useState<IncidentType>("");

  // Step 2 — maps to backend reportCreateSchema
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [provinceId, setProvinceId] = React.useState("");
  const [selectedProvinceCode, setSelectedProvinceCode] = React.useState("");
  const [districtId, setDistrictId] = React.useState("");
  const [selectedDistrictCode, setSelectedDistrictCode] = React.useState("");
  const [villageId, setVillageId] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [images, setImages] = React.useState<string[]>([]); // uploaded image names

  // Upload / submit states
  const [uploading, setUploading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Location queries (cascading)
  const { data: provinces = [], isLoading: isLoadingProvinces } = useGetAllProvinces();
  const { data: districts = [], isLoading: isLoadingDistricts } = useGetDistrictsByProvince(selectedProvinceCode);
  const { data: villages = [], isLoading: isLoadingVillages } = useGetVillagesByDistrict(selectedDistrictCode);

  const incidentTypes = [
    { value: "theft", titleLo: "ລັກຂະໂມຍ", label: "ລັກຂະໂມຍ / Theft", color: "bg-orange-50 border-orange-300 text-orange-700" },
    { value: "assault", titleLo: "ທຳຮ້າຍຮ່າງກາຍ", label: "ທຳຮ້າຍຮ່າງກາຍ / Assault", color: "bg-red-50 border-red-300 text-red-700" },
    { value: "fraud", titleLo: "ສໍ້ໂກງ", label: "ສໍ້ໂກງ / Fraud", color: "bg-purple-50 border-purple-300 text-purple-700" },
    { value: "traffic", titleLo: "ຈະລາຈອນ", label: "ຈະລາຈອນ / Traffic", color: "bg-blue-50 border-blue-300 text-blue-700" },
    { value: "other", titleLo: "ອື່ນໆ", label: "ອື່ນໆ / Other", color: "bg-gray-50 border-gray-300 text-gray-700" },
  ];

  const getImageUrl = (imageName: string) =>
    `${API_BASE_URL}${API_ENDPOINTS.STORAGE.VIEW_IMAGE("medium", imageName)}`;

  const handleSelectType = () => {
    if (!incidentType) return;
    // Prefill the title from the chosen type (still editable in step 2)
    if (!title) {
      const t = incidentTypes.find((i) => i.value === incidentType);
      if (t) setTitle(t.titleLo);
    }
    setStep(2);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const available = 5 - images.length;
    if (available <= 0) {
      toast.error("ອັບໂຫຼດໄດ້ສູງສຸດ 5 ຮູບ");
      return;
    }

    setUploading(true);
    try {
      const toUpload = files.slice(0, available);
      const names = await Promise.all(toUpload.map((f) => uploadImage(f)));
      setImages((prev) => [...prev, ...names.filter(Boolean)]);
    } catch (err) {
      console.error("Failed to upload evidence:", err);
      toast.error("ອັບໂຫຼດຮູບບໍ່ສຳເລັດ");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!title.trim()) return toast.error("ກະລຸນາປ້ອນຫົວຂໍ້");
    if (!location.trim()) return toast.error("ກະລຸນາປ້ອນສະຖານທີ່ເກີດເຫດ");

    setIsSubmitting(true);
    try {
      await createReport({
        title: title.trim(),
        description: description.trim() || null,
        provinceId: provinceId || null,
        districtId: districtId || null,
        villageId: villageId || null,
        location: location.trim(),
        image: images[0] || null,
        video: null,
        attachments: images.length ? images : null,
      });
      toast.success("ສົ່ງຄຳຮ້ອງສຳເລັດ");
      setStep(3);
    } catch (err) {
      console.error("Failed to create report:", err);
      toast.error("ສົ່ງຄຳຮ້ອງບໍ່ສຳເລັດ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setIncidentType("");
    setTitle("");
    setDescription("");
    setProvinceId("");
    setSelectedProvinceCode("");
    setDistrictId("");
    setSelectedDistrictCode("");
    setVillageId("");
    setLocation("");
    setImages([]);
  };

  const stepLabel = ["ເລືອກປະເພດ", "ຂໍ້ມູນເຫດການ", "ສຳເລັດ"];

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 font-sans">
      {/* 1. Header */}
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

      {/* 2. Sub-header / Green Nav Bar */}
      <nav className="bg-[#075e3d] text-white h-14 flex items-center justify-between px-6 shadow-md relative z-10">
        <button
          onClick={() => navigate("/home")}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-95 cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft size={26} />
        </button>
        <span className="text-base font-bold tracking-wide">
          ແຈ້ງຄວາມອອນລາຍ / Online Report
        </span>
        <div className="w-9" />
      </nav>

      {/* 3. Main Content */}
      <main className="flex-1 bg-[#d9d9d9] flex flex-col p-6 md:p-10">
        <div className="max-w-2xl mx-auto w-full space-y-6">

          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-2 mb-2">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step >= s
                        ? "bg-[#075e3d] text-white shadow-md"
                        : "bg-white text-gray-400 border border-gray-300"
                    }`}
                  >
                    {step > s ? <CheckCircle2 size={16} /> : s}
                  </div>
                  <span className={`text-[10px] mt-1 font-bold ${step >= s ? "text-[#075e3d]" : "text-gray-400"}`}>
                    {stepLabel[s - 1]}
                  </span>
                </div>
                {s < 3 && (
                  <div className={`h-0.5 w-12 mb-4 transition-all ${step > s ? "bg-[#075e3d]" : "bg-gray-300"}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ─── STEP 1: Choose Incident Type ─── */}
          {step === 1 && (
            <Card className="shadow-sm border border-gray-100 rounded-3xl">
              <CardBody className="p-6 space-y-5">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertCircle size={20} className="text-[#075e3d]" />
                  <h2 className="text-base font-bold text-gray-800">
                    ເລືອກປະເພດຄະດີ (Select Incident Type)
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {incidentTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setIncidentType(type.value as IncidentType)}
                      className={`border-2 rounded-2xl px-4 py-3 text-sm font-bold text-left transition-all cursor-pointer ${
                        incidentType === type.value
                          ? `${type.color} border-current shadow-md scale-[1.02]`
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                <Button
                  isDisabled={!incidentType}
                  onClick={handleSelectType}
                  className="w-full bg-[#075e3d] hover:bg-[#064e32] text-white font-bold rounded-2xl py-3 mt-2 cursor-pointer disabled:opacity-50"
                >
                  ຕໍ່ໄປ →
                </Button>
              </CardBody>
            </Card>
          )}

          {/* ─── STEP 2: Report Details ─── */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Incident Details */}
              <Card className="shadow-sm border border-gray-100 rounded-3xl">
                <CardBody className="p-6 space-y-4">
                  <h2 className="text-base font-bold text-gray-800 flex items-center space-x-2">
                    <FileText size={18} className="text-[#075e3d]" />
                    <span>ຂໍ້ມູນເຫດການ (Incident Details)</span>
                  </h2>

                  {/* Title */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      ຫົວຂໍ້ / Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="ຫົວຂໍ້ການແຈ້ງຄວາມ..."
                      className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#075e3d]/40 focus:border-[#075e3d] transition"
                    />
                  </div>

                  {/* Description */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      ລາຍລະອຽດ / Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="ອະທິບາຍລາຍລະອຽດຂອງເຫດການ..."
                      className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#075e3d]/40 focus:border-[#075e3d] transition resize-none"
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Location */}
              <Card className="shadow-sm border border-gray-100 rounded-3xl">
                <CardBody className="p-6 space-y-4">
                  <h2 className="text-base font-bold text-gray-800 flex items-center space-x-2">
                    <MapPin size={18} className="text-[#075e3d]" />
                    <span>ສະຖານທີ່ (Location)</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Province */}
                    <div className="flex flex-col space-y-1">
                      <label htmlFor="report-province" className="text-xs font-bold text-gray-500 uppercase tracking-wide">ແຂວງ / Province</label>
                      <select
                        id="report-province"
                        value={provinceId}
                        onChange={(e) => {
                          const pId = e.target.value;
                          setProvinceId(pId);
                          const prov = provinces.find((p: any) => p.id === pId);
                          setSelectedProvinceCode(prov ? prov.code : "");
                          setDistrictId("");
                          setSelectedDistrictCode("");
                          setVillageId("");
                        }}
                        disabled={isLoadingProvinces}
                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#075e3d]/40 focus:border-[#075e3d] transition cursor-pointer"
                      >
                        <option value="">{isLoadingProvinces ? "ກຳລັງໂຫຼດ..." : "ເລືອກແຂວງ..."}</option>
                        {provinces.map((prov: any) => (
                          <option key={prov.id} value={prov.id}>{prov.nameLo}</option>
                        ))}
                      </select>
                    </div>

                    {/* District */}
                    <div className="flex flex-col space-y-1">
                      <label htmlFor="report-district" className="text-xs font-bold text-gray-500 uppercase tracking-wide">ເມືອງ / District</label>
                      <select
                        id="report-district"
                        value={districtId}
                        onChange={(e) => {
                          const dId = e.target.value;
                          setDistrictId(dId);
                          const dist = districts.find((d: any) => d.id === dId);
                          setSelectedDistrictCode(dist ? dist.code : "");
                          setVillageId("");
                        }}
                        disabled={!selectedProvinceCode || isLoadingDistricts}
                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#075e3d]/40 focus:border-[#075e3d] transition cursor-pointer disabled:opacity-60"
                      >
                        <option value="">
                          {!selectedProvinceCode ? "ເລືອກແຂວງກ່ອນ..." : isLoadingDistricts ? "ກຳລັງໂຫຼດ..." : "ເລືອກເມືອງ..."}
                        </option>
                        {districts.map((dist: any) => (
                          <option key={dist.id} value={dist.id}>{dist.nameLo}</option>
                        ))}
                      </select>
                    </div>

                    {/* Village */}
                    <div className="flex flex-col space-y-1">
                      <label htmlFor="report-village" className="text-xs font-bold text-gray-500 uppercase tracking-wide">ບ້ານ / Village</label>
                      <select
                        id="report-village"
                        value={villageId}
                        onChange={(e) => setVillageId(e.target.value)}
                        disabled={!selectedDistrictCode || isLoadingVillages}
                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#075e3d]/40 focus:border-[#075e3d] transition cursor-pointer disabled:opacity-60"
                      >
                        <option value="">
                          {!selectedDistrictCode ? "ເລືອກເມືອງກ່ອນ..." : isLoadingVillages ? "ກຳລັງໂຫຼດ..." : "ເລືອກບ້ານ..."}
                        </option>
                        {villages.map((vil: any) => (
                          <option key={vil.id} value={vil.id}>{vil.nameLo}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location free text (required) */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      ສະຖານທີ່ເກີດເຫດ / Location *
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="ບ້ານ, ຖະໜົນ, ຈຸດສັງເກດ..."
                      className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#075e3d]/40 focus:border-[#075e3d] transition"
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Evidence Upload */}
              <Card className="shadow-sm border border-gray-100 rounded-3xl">
                <CardBody className="p-6 space-y-4">
                  <h2 className="text-base font-bold text-gray-800 flex items-center space-x-2">
                    <Upload size={18} className="text-[#075e3d]" />
                    <span>ອັບໂຫຼດຫຼັກຖານ (Evidence) — ສູງສຸດ 5 ຮູບ</span>
                  </h2>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || images.length >= 5}
                    className="w-full border-2 border-dashed border-[#075e3d]/40 rounded-2xl p-6 text-center hover:bg-[#075e3d]/5 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <Loader2 size={28} className="text-[#075e3d] mx-auto mb-2 animate-spin" />
                    ) : (
                      <Upload size={28} className="text-[#075e3d]/50 mx-auto mb-2" />
                    )}
                    <p className="text-sm font-bold text-gray-500">
                      {uploading ? "ກຳລັງອັບໂຫຼດ..." : "ກົດເພື່ອເລືອກໄຟລ໌ຮູບ"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG — ສູງສຸດ 10MB/ໄຟລ໌</p>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((name, i) => (
                        <div key={name + i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                          <img src={getImageUrl(name)} alt={`evidence-${i}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 pb-6">
                <Button
                  onClick={() => setStep(1)}
                  variant="bordered"
                  className="flex-1 font-bold rounded-2xl py-3 border-gray-300 text-gray-600 cursor-pointer"
                >
                  ← ກັບຄືນ
                </Button>
                <Button
                  onClick={handleSubmit}
                  isDisabled={!title.trim() || !location.trim() || uploading || isSubmitting}
                  className="flex-1 bg-[#075e3d] hover:bg-[#064e32] text-white font-bold rounded-2xl py-3 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "ກຳລັງສົ່ງ..." : "ສົ່ງຄຳຮ້ອງ ✓"}
                </Button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Success ─── */}
          {step === 3 && (
            <Card className="shadow-2xl border border-gray-100 rounded-3xl">
              <CardBody className="p-10 flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center shadow-inner">
                  <CheckCircle2 size={52} className="text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-gray-800">
                    ສົ່ງຄຳຮ້ອງສຳເລັດແລ້ວ!
                  </h2>
                  <p className="text-sm text-gray-500 font-bold leading-relaxed max-w-sm">
                    ຄຳຮ້ອງຂອງທ່ານໄດ້ຮັບການສົ່ງໃຫ້ທາງເຈົ້າໜ້າທີ່ຮຽບຮ້ອຍແລ້ວ.<br />
                    ທ່ານຈະໄດ້ຮັບການຕິດຕໍ່ກັບຄືນໂດຍໄວ.
                  </p>
                </div>
                <div className="w-full border-t border-gray-100" />
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    onClick={resetForm}
                    variant="bordered"
                    className="flex-1 font-bold rounded-2xl py-3 border-gray-300 text-gray-600 cursor-pointer"
                  >
                    ແຈ້ງໃໝ່
                  </Button>
                  <Button
                    onClick={() => navigate("/home")}
                    className="flex-1 bg-[#075e3d] hover:bg-[#064e32] text-white font-bold rounded-2xl py-3 cursor-pointer"
                  >
                    ກັບໜ້າຫຼັກ
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

        </div>
      </main>

      {/* 4. Footer */}
      <footer className="bg-[#075e3d] h-12 w-full shadow-inner" />
    </div>
  );
}
