import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  User,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Camera,
  Upload,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  Users,
  Eye,
  EyeOff
} from "lucide-react";

import { useAuth } from "@/routes/AuthContext";
import { useGetAllProvinces } from "@/services/province/useProvince";
import { useGetDistrictsByProvince } from "@/services/district/useDistrict";
import { useGetVillagesByDistrict } from "@/services/village/useVillage";
import { uploadImage } from "@/services/storage";
import { API_BASE_URL } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";
import { showErrorToast } from "@/config/error-messages";

export default function Register() {
  const navigate = useNavigate();
  const { registerCitizen } = useAuth();

  // Multi-step state: 1 = Personal & Address, 2 = Identity & Account
  const [step, setStep] = React.useState<1 | 2>(1);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form Field States
  const [userName, setUserName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [profileImage, setProfileImage] = React.useState("");

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [dateOfBirth, setDateOfBirth] = React.useState("");
  const [gender, setGender] = React.useState("MALE");
  const [provinceId, setProvinceId] = React.useState("");
  const [selectedProvinceCode, setSelectedProvinceCode] = React.useState("");
  const [districtId, setDistrictId] = React.useState("");
  const [selectedDistrictCode, setSelectedDistrictCode] = React.useState("");
  const [villageId, setVillageId] = React.useState("");
  const [address, setAddress] = React.useState("");

  const [cartNumber, setCartNumber] = React.useState("");
  const [cartImage, setCartImage] = React.useState("");
  const [cartImageBack, setCartImageBack] = React.useState("");

  // Upload States
  const [uploadingProfile, setUploadingProfile] = React.useState(false);
  const [uploadingFront, setUploadingFront] = React.useState(false);
  const [uploadingBack, setUploadingBack] = React.useState(false);

  // Locations Queries
  const { data: provinces = [], isLoading: isLoadingProvinces } = useGetAllProvinces();
  const { data: districts = [], isLoading: isLoadingDistricts } = useGetDistrictsByProvince(selectedProvinceCode);
  const { data: villages = [], isLoading: isLoadingVillages } = useGetVillagesByDistrict(selectedDistrictCode);

  // Password visibility states
  const [isPassVisible, setIsPassVisible] = React.useState(false);
  const [isConfirmPassVisible, setIsConfirmPassVisible] = React.useState(false);

  // Upload handlers
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "front" | "back"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "profile") setUploadingProfile(true);
    else if (type === "front") setUploadingFront(true);
    else if (type === "back") setUploadingBack(true);

    try {
      const imageName = await uploadImage(file);
      if (type === "profile") setProfileImage(imageName);
      else if (type === "front") setCartImage(imageName);
      else if (type === "back") setCartImageBack(imageName);
      toast.success("ອັບໂຫຼດຮູບສຳເລັດ");
    } catch (err) {
      console.error("Failed to upload image:", err);
      toast.error("ອັບໂຫຼດຮູບບໍ່ສຳເລັດ");
    } finally {
      if (type === "profile") setUploadingProfile(false);
      else if (type === "front") setUploadingFront(false);
      else if (type === "back") setUploadingBack(false);
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    // Personal Info
    if (!firstName.trim()) return "ກະລຸນາປ້ອນຊື່ແທ້";
    if (!lastName.trim()) return "ກະລຸນາປ້ອນນາມສະກຸນ";
    if (!dateOfBirth) return "ກະລຸນາເລືອກວັນເດືອນປີເກີດ";
    if (!gender) return "ກະລຸນາເລືອກເພດ";

    // Address Info
    if (!provinceId) return "ກະລຸນາເລືອກແຂວງ";
    if (!districtId) return "ກະລຸນາເລືອກເມືອງ";
    if (!villageId) return "ກະລຸນາເລືອກບ້าน";

    return null;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    // Identity Verification
    if (!cartNumber.trim()) return "ກະລຸນາປ້ອນເລກບັດປະຈຳຕົວ";
    if (!cartImage) return "ກະລຸນາອັບໂຫຼດຮູບໜ້າບັດປະຈຳຕົວ";

    // Account Info
    if (!userName.trim()) return "ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້";
    if (password.length < 6) return "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ";
    if (password !== confirmPassword) return "ລະຫັດຜ່ານບໍ່ກົງກັນ";

    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) return toast.error(err);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else navigate("/");
  };

  // Submit Handler
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validateStep2();
    if (err) return toast.error(err);

    setIsLoading(true);

    try {
      const payload = {
        userName,
        password,
        email: email || null,
        phone: phone || null,
        profileImage: profileImage || null,
        provinceId,
        districtId,
        villageId,
        address: address || null,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth).toISOString(),
        gender: gender.toUpperCase(),
        cartNumber,
        cartImage,
        cartImageBack,
      };

      await registerCitizen(payload);
      toast.success("ລົງທະບຽນສຳເລັດແລ້ວ!");
      navigate("/login");
    } catch (err: any) {
      showErrorToast(err, "", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  // Image View Helpers
  const getImageUrl = (imageName: string) => {
    return `${API_BASE_URL}${API_ENDPOINTS.STORAGE.VIEW_IMAGE("medium", imageName)}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm h-20 z-10">
        <div className="flex items-center space-x-3">
          <img
            src="/assets/logo.png"
            alt="Ministry Logo"
            className="h-12 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.src = "/logo.png";
            }}
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
        <button
          onClick={handleBack}
          className="flex items-center space-x-1 px-4 py-2 text-[#075e3d] font-bold hover:bg-[#075e3d]/5 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>ຍ້ອນກັບ</span>
        </button>
      </header>

      {/* Main Container with Background */}
      <div
        className="flex-1 w-full flex items-center justify-center p-4 md:p-8 relative bg-cover bg-center overflow-y-auto"
        style={{
          backgroundImage: "url('/assets/images/02.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] z-0" />

        {/* Register Card */}
        <div className="relative z-10 w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col my-4">

          {/* Stepper Header */}
          <div className="bg-[#075e3d] text-white px-8 py-6 flex flex-col space-y-4 text-center">
            <h2 className="text-2xl font-bold">ລົງທະບຽນພົນລະເມືອງ</h2>

            {/* Step Indicators */}
            <div className="flex items-center justify-center space-x-4 max-w-md mx-auto w-full pt-2">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 1 ? "bg-white text-[#075e3d] border-white" : "border-white/50 text-white/50"
                  }`}>
                  1
                </div>
                <span className={`text-xs font-semibold hidden sm:inline ${step >= 1 ? "opacity-100" : "opacity-50"}`}>
                  ຂໍ້ມູນສ່ວນຕົວ & ທີ່ຢູ່
                </span>
              </div>
              <div className={`h-[2px] w-16 ${step >= 2 ? "bg-white" : "bg-white/30"}`} />
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 2 ? "bg-white text-[#075e3d] border-white" : "border-white/50 text-white/50"
                  }`}>
                  2
                </div>
                <span className={`text-xs font-semibold hidden sm:inline ${step >= 2 ? "opacity-100" : "opacity-50"}`}>
                  ຢືນຢັນ & ບັນຊີ
                </span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={onSubmit} className="p-8 md:p-10 flex-1 flex flex-col space-y-8">

            {/* STEP 1: PERSONAL INFO & CURRENT ADDRESS */}
            {step === 1 && (
              <div className="space-y-8">
                {/* SECTION 1: PERSONAL INFO */}
                <div className="space-y-6">

                  {/* Profile Photo Upload */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative w-28 h-28 rounded-full bg-slate-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shadow-inner group">
                      {profileImage ? (
                        <img src={getImageUrl(profileImage)} alt="Profile" className="w-full h-full object-cover" />
                      ) : uploadingProfile ? (
                        <Loader2 className="w-8 h-8 text-[#075e3d] animate-spin" />
                      ) : (
                        <User className="w-12 h-12 text-gray-400" />
                      )}
                      <label className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-semibold">
                        <Camera size={20} className="mb-1" />
                        ອັບໂຫຼດຮູບ
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "profile")}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">ຮູບໂປຣໄຟລ໌ (ບໍ່ບັງຄັບ)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div className="flex flex-col space-y-1.5">
                      <label htmlFor="firstName" className="text-sm font-bold text-gray-700">ຊື່ແທ້ / First Name <span className="text-red-500">*</span></label>
                      <div className="relative flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-[#075e3d] transition-colors h-12">
                        <User className="text-gray-400 mr-2.5" size={18} />
                        <input
                          id="firstName"
                          type="text"
                          placeholder="ປ້ອນຊື່ແທ້..."
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 text-sm font-medium"
                          required
                        />
                      </div>
                    </div>

                    {/* Last Name */}
                    <div className="flex flex-col space-y-1.5">
                      <label htmlFor="lastName" className="text-sm font-bold text-gray-700">ນາມສະກຸນ / Last Name <span className="text-red-500">*</span></label>
                      <div className="relative flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-[#075e3d] transition-colors h-12">
                        <User className="text-gray-400 mr-2.5" size={18} />
                        <input
                          id="lastName"
                          type="text"
                          placeholder="ປ້ອນນາມສະກຸນ..."
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 text-sm font-medium"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date of Birth */}
                    <div className="flex flex-col space-y-1.5">
                      <label htmlFor="dateOfBirth" className="text-sm font-bold text-gray-700">ວັນເດືອນປີເກີດ / Date of Birth <span className="text-red-500">*</span></label>
                      <div className="relative flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-[#075e3d] transition-colors h-12">
                        <Calendar className="text-gray-400 mr-2.5" size={18} />
                        <input
                          id="dateOfBirth"
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-gray-800 text-sm font-medium"
                          required
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="flex flex-col space-y-1.5">
                      <label htmlFor="gender" className="text-sm font-bold text-gray-700">ເພດ / Gender <span className="text-red-500">*</span></label>
                      <div className="relative flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-[#075e3d] transition-colors h-12">
                        <Users className="text-gray-400 mr-2.5" size={18} />
                        <select
                          id="gender"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-gray-800 text-sm font-medium cursor-pointer"
                          required
                        >
                          <option value="MALE">ຊາຍ / Male</option>
                          <option value="FEMALE">ຍິງ / Female</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div className="flex flex-col space-y-1.5">
                      <label htmlFor="phone" className="text-sm font-bold text-gray-700">ເບີໂທລະສັບ / Phone</label>
                      <div className="relative flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-[#075e3d] transition-colors h-12">
                        <Phone className="text-gray-400 mr-2.5" size={18} />
                        <input
                          id="phone"
                          type="tel"
                          placeholder="...ປ້ອນເເບີໂທ"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 text-sm font-medium"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col space-y-1.5">
                      <label htmlFor="email" className="text-sm font-bold text-gray-700">ອີເມວ / Email</label>
                      <div className="relative flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-[#075e3d] transition-colors h-12">
                        <Mail className="text-gray-400 mr-2.5" size={18} />
                        <input
                          id="email"
                          type="email"
                          placeholder="example@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 text-sm font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: CURRENT ADDRESS */}
                <div className="space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Province */}
                    <div className="flex flex-col space-y-1.5">
                      <label htmlFor="provinceId" className="text-sm font-bold text-gray-700">ແຂວງ / Province <span className="text-red-500">*</span></label>
                      <div className="relative flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-[#075e3d] transition-colors h-12">
                        <select
                          id="provinceId"
                          value={provinceId}
                          onChange={(e) => {
                            const pId = e.target.value;
                            setProvinceId(pId);
                            const prov = provinces.find((p: any) => p.id === pId);
                            setSelectedProvinceCode(prov ? prov.code : "");

                            // Reset dependents
                            setDistrictId("");
                            setSelectedDistrictCode("");
                            setVillageId("");
                          }}
                          className="w-full bg-transparent focus:outline-none text-gray-800 text-sm font-medium cursor-pointer"
                          required
                          disabled={isLoadingProvinces}
                        >
                          <option value="">{isLoadingProvinces ? "ກຳລັງໂຫຼດ..." : "ເລືອກແຂວງ..."}</option>
                          {provinces.map((prov: any) => (
                            <option key={prov.id} value={prov.id}>
                              {prov.nameLo}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* District */}
                    <div className="flex flex-col space-y-1.5">
                      <label htmlFor="districtId" className="text-sm font-bold text-gray-700">ເມືອງ / District <span className="text-red-500">*</span></label>
                      <div className="relative flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-[#075e3d] transition-colors h-12">
                        <select
                          id="districtId"
                          value={districtId}
                          onChange={(e) => {
                            const dId = e.target.value;
                            setDistrictId(dId);
                            const dist = districts.find((d: any) => d.id === dId);
                            setSelectedDistrictCode(dist ? dist.code : "");

                            // Reset dependents
                            setVillageId("");
                          }}
                          className="w-full bg-transparent focus:outline-none text-gray-800 text-sm font-medium cursor-pointer"
                          required
                          disabled={!selectedProvinceCode || isLoadingDistricts}
                        >
                          <option value="">
                            {!selectedProvinceCode
                              ? "ເລືອກແຂວງກ່ອນ..."
                              : isLoadingDistricts
                                ? "ກຳລັງໂຫຼດ..."
                                : "ເລືອກເມືອງ..."}
                          </option>
                          {districts.map((dist: any) => (
                            <option key={dist.id} value={dist.id}>
                              {dist.nameLo}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Village */}
                    <div className="flex flex-col space-y-1.5">
                      <label htmlFor="villageId" className="text-sm font-bold text-gray-700">ບ້ານ / Village <span className="text-red-500">*</span></label>
                      <div className="relative flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-[#075e3d] transition-colors h-12">
                        <select
                          id="villageId"
                          value={villageId}
                          onChange={(e) => setVillageId(e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-gray-800 text-sm font-medium cursor-pointer"
                          required
                          disabled={!selectedDistrictCode || isLoadingVillages}
                        >
                          <option value="">
                            {!selectedDistrictCode
                              ? "ເລືອກເມືອງກ່ອນ..."
                              : isLoadingVillages
                                ? "ກຳລັງໂຫຼດ..."
                                : "ເລືອກບ້ານ..."}
                          </option>
                          {villages.map((vil: any) => (
                            <option key={vil.id} value={vil.id}>
                              {vil.nameLo}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Address details */}
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="address" className="text-sm font-bold text-gray-700">ທີ່ຢູ່ປະຈຸບັນ / Address Detail</label>
                    <div className="relative flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-[#075e3d] transition-colors h-12">
                      <MapPin className="text-gray-400 mr-2.5" size={18} />
                      <input
                        id="address"
                        type="text"
                        placeholder="ປ້ອນທີ່ຢູ່ລະອຽດ, ເຮືອນເລກທີ, ໜ່ວຍ..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: IDENTITY DOCUMENTS & ACCOUNT CREDENTIALS */}
            {step === 2 && (
              <div className="space-y-8">
                {/* SECTION 3: IDENTITY DOCUMENTS */}
                <div className="space-y-6">

                  {/* ID Card Number */}
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="cartNumber" className="text-sm font-bold text-gray-700">ເລກບັດປະຈຳຕົວ / ID Card Number <span className="text-red-500">*</span></label>
                    <div className="relative flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-[#075e3d] transition-colors h-12">
                      <CreditCard className="text-gray-400 mr-2.5" size={18} />
                      <input
                        id="cartNumber"
                        type="text"
                        placeholder="ປ້ອນເລກບັດປະຈຳຕົວ..."
                        value={cartNumber}
                        onChange={(e) => setCartNumber(e.target.value)}
                        className="w-full bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 text-sm font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* ID Card Document Uploads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Front of ID Card */}
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm font-bold text-gray-700">ຮູບໜ້າບັດ / ID Card Front <span className="text-red-500">*</span></span>
                      <div className="relative h-44 rounded-xl border-2 border-dashed border-gray-300 bg-slate-50 flex flex-col items-center justify-center overflow-hidden shadow-inner group">
                        {cartImage ? (
                          <>
                            <img src={getImageUrl(cartImage)} alt="ID Front" className="w-full h-full object-cover" />
                            <label className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-semibold">
                              <Upload size={20} className="mb-1" />
                              ປ່ຽນຮູບໜ້າບັດ
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, "front")}
                                className="hidden"
                              />
                            </label>
                          </>
                        ) : uploadingFront ? (
                          <Loader2 className="w-8 h-8 text-[#075e3d] animate-spin" />
                        ) : (
                          <label className="flex flex-col items-center text-center p-4 cursor-pointer w-full h-full justify-center">
                            <Upload className="w-10 h-10 text-gray-400 mb-2" />
                            <span className="text-xs font-bold text-[#075e3d]">ກົດເພື່ອອັບໂຫຼດຮູບໜ້າບັດ</span>
                            <span className="text-[10px] text-gray-400 mt-1">ຮອງຮັບໄຟລ໌ຮູບ JPG, PNG</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, "front")}
                              className="hidden"
                              required
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: ACCOUNT CREDENTIALS */}
                <div className="space-y-6">
                  {/* Username */}
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="userName" className="text-sm font-bold text-gray-700">ຊື່ຜູ້ໃຊ້ / Username <span className="text-red-500">*</span></label>
                    <div className="relative flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-[#075e3d] transition-colors h-12">
                      <User className="text-gray-400 mr-2.5" size={18} />
                      <input
                        id="userName"
                        type="text"
                        placeholder="ປ້ອນຊື່ຜູ້ໃຊ້..."
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 text-sm font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Password */}
                    <div className="flex flex-col space-y-1.5">
                      <label htmlFor="password" className="text-sm font-bold text-gray-700">ລະຫັດຜ່ານ / Password <span className="text-red-500">*</span></label>
                      <div className="relative flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-[#075e3d] transition-colors h-12">
                        <Lock className="text-gray-400 mr-2.5" size={18} />
                        <input
                          id="password"
                          type={isPassVisible ? "text" : "password"}
                          placeholder="ລະຫັດຜ່ານຢ່າງໜ້ອຍ 6 ຕົວ..."
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 text-sm font-medium"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setIsPassVisible(!isPassVisible)}
                          className="focus:outline-none ml-2 text-gray-400 hover:text-gray-600"
                        >
                          {isPassVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col space-y-1.5">
                      <label htmlFor="confirmPassword" className="text-sm font-bold text-gray-700">ຢືນຢັນລະຫັດຜ່ານ / Confirm Password <span className="text-red-500">*</span></label>
                      <div className="relative flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-[#075e3d] transition-colors h-12">
                        <Lock className="text-gray-400 mr-2.5" size={18} />
                        <input
                          id="confirmPassword"
                          type={isConfirmPassVisible ? "text" : "password"}
                          placeholder="ປ້ອນລະຫັດຜ່ານຄືນ..."
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 text-sm font-medium"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setIsConfirmPassVisible(!isConfirmPassVisible)}
                          className="focus:outline-none ml-2 text-gray-400 hover:text-gray-600"
                        >
                          {isConfirmPassVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions footer */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-4">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2.5 border border-gray-300 rounded-full font-bold text-sm text-gray-600 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
              >
                {step === 1 ? "ຍົກເລີກ" : "ກັບຄືນ"}
              </button>

              {step === 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center space-x-1.5 px-6 py-2.5 bg-[#075e3d] hover:bg-[#064e32] active:scale-95 text-white font-bold rounded-full text-sm transition-all cursor-pointer"
                >
                  <span>ຕໍ່ໄປ</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || uploadingFront || uploadingBack || uploadingProfile}
                  className="flex items-center space-x-1.5 px-8 py-2.5 bg-[#4ADE80] hover:bg-[#22C55E] active:scale-95 text-gray-900 font-bold rounded-full text-sm transition-all cursor-pointer shadow-md"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>ກຳລັງລົງທະບຽນ...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>ລົງທະບຽນ</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
