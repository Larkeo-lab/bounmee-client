import { useState, useEffect, useRef, useMemo, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardBody,
  Input,
  Button,
  Image,
  Spinner,
  Textarea,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  Store as StoreIcon,
  Upload,
  Save,
  X,
  Phone,
  MapPin,
  Building,
  Mail,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "@/routes/AuthContext";
import { useGetStoreDetail, useUpdateStore } from "@/services/store/useStore";
import { useGetAllProvinces } from "@/services/province/useProvince";
import { useGetDistrictsByProvince } from "@/services/district/useDistrict";
import { useUploadImage } from "@/services/storage";
import { getDisplayImageUrl } from "@/lib/utils";

export default function ProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isNotAdmin = user?.user?.role !== "STORE_ADMIN";
  const { t, i18n } = useTranslation();
  const { data: storeResponse, isLoading } = useGetStoreDetail(
    user?.user?.store?.id,
  );
  const store = storeResponse?.data;

  const updateStoreMutation = useUpdateStore();
  const uploadImageMutation = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    logoUrl: "",
    language: "LA" as string,
    provinceId: "",
    districtId: "",
  });
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    if (store) {
      const adminUser = store.users?.find((u: any) => u.role === "STORE_ADMIN");
      const currentLang = i18n.language === "EN" ? "EN" : "LA";

      setFormData({
        name: store.name || "",
        address: store.address || "",
        phone: adminUser?.phone || "",
        email: adminUser?.email || "",
        logoUrl: store.logoUrl || "",
        language: currentLang,
        provinceId: store.provinceId || "",
        districtId: store.districtId || "",
      });
      setPreviewImage(store.logoUrl || "");
    }
  }, [store, i18n.language]);

  console.log("user", user);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      try {
        const previewUrl = URL.createObjectURL(file);

        setPreviewImage(previewUrl);

        const imageName = await uploadImageMutation.mutateAsync(file);

        setFormData((prev) => ({ ...prev, logoUrl: imageName }));
      } catch (error) {
        console.error("Failed to upload image:", error);
      }
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, logoUrl: "" }));
    setPreviewImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!store?.id || isNotAdmin) return;
    try {
      await updateStoreMutation.mutateAsync({
        ...formData,
        id: store.id,
      });
      navigate("/settings/profile");
    } catch (error) {
      console.error("Failed to update store:", error);
    }
  };

  const { data: provinces = [] } = useGetAllProvinces();

  const selectedProvinceCode = useMemo(() => {
    return provinces.find((p) => p.id === formData.provinceId)?.code;
  }, [provinces, formData.provinceId]);

  const { data: districts = [] } =
    useGetDistrictsByProvince(selectedProvinceCode);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="m-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <StoreIcon size={28} />
            {t("settings.storeProfile.title")}
          </h1>
          <p className="text-default-500">
            {t("settings.storeProfile.subtitle")}
          </p>
        </div>
      </div>

      <Card className="shadow-sm border border-divider">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Logo Section */}
            <div className="flex flex-col items-center gap-4">
              <label className="text-sm font-medium text-default-700 w-full text-center md:text-left">
                {t("settings.common.image")}
              </label>
              <div
                role="button"
                tabIndex={isNotAdmin ? -1 : 0}
                aria-label="Upload store logo"
                aria-disabled={isNotAdmin}
                className={`
                  relative group
                  ${isNotAdmin ? "cursor-not-allowed opacity-80" : "cursor-pointer"}
                  w-48 h-48 rounded-2xl border-2 border-dashed 
                  transition-all duration-200 ease-in-out
                  flex items-center justify-center overflow-hidden
                  ${previewImage || formData.logoUrl ? "border-primary bg-primary/5" : "border-default-200 hover:border-primary hover:bg-default-50"}
                `}
                onClick={() => !isNotAdmin && fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (!isNotAdmin && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                {uploadImageMutation.isPending ? (
                  <Spinner color="primary" />
                ) : previewImage || formData.logoUrl ? (
                  <>
                    <Image
                      alt="Store Logo"
                      className="w-full h-full object-cover"
                      src={getDisplayImageUrl(previewImage || formData.logoUrl)}
                    />
                    {!isNotAdmin && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                        <Upload size={24} />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-default-400">
                    <Upload size={32} />
                    <span className="text-sm">
                      {t("settings.common.upload")} {t("settings.common.image")}
                    </span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  type="file"
                  onChange={handleImageChange}
                />
              </div>
              {(previewImage || formData.logoUrl) && !isNotAdmin && (
                <Button
                  color="danger"
                  size="sm"
                  startContent={<X size={16} />}
                  variant="light"
                  onPress={removeImage}
                >
                  {t("settings.common.remove")}
                </Button>
              )}
            </div>

            {/* Form Section */}
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  isDisabled={isNotAdmin}
                  label={t("auth.storeName")}
                  labelPlacement="outside"
                  placeholder={t("auth.storeNamePlaceholder")}
                  startContent={
                    <Building className="text-default-400" size={18} />
                  }
                  value={formData.name}
                  variant="bordered"
                  onValueChange={(val) =>
                    setFormData({ ...formData, name: val })
                  }
                />

                <Input
                  isDisabled={isNotAdmin}
                  label={t("auth.phone")}
                  labelPlacement="outside"
                  placeholder={t("auth.phonePlaceholder")}
                  startContent={
                    <Phone className="text-default-400" size={18} />
                  }
                  value={formData.phone}
                  variant="bordered"
                  onValueChange={(val) =>
                    setFormData({ ...formData, phone: val })
                  }
                />

                <Input
                  isDisabled={isNotAdmin}
                  className="md:col-span-2"
                  label={t("auth.email")}
                  labelPlacement="outside"
                  placeholder={t("auth.emailOrUsernamePlaceholder")}
                  startContent={<Mail className="text-default-400" size={18} />}
                  value={formData.email}
                  variant="bordered"
                  onValueChange={(val) =>
                    setFormData({ ...formData, email: val })
                  }
                />

                <Select
                  isDisabled={isNotAdmin}
                  label={t("auth.province")}
                  labelPlacement="outside"
                  placeholder={t("auth.province")}
                  selectedKeys={
                    formData.provinceId ? [formData.provinceId] : []
                  }
                  startContent={
                    <MapPin className="text-default-400" size={18} />
                  }
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const val = Array.from(keys)[0] as string;
                    setFormData({
                      ...formData,
                      provinceId: val,
                      districtId: "",
                    });
                  }}
                >
                  {provinces.map((p) => (
                    <SelectItem
                      key={p.id}
                      textValue={
                        formData.language === "LA" ? p.nameLo : p.nameEn
                      }
                    >
                      {formData.language === "LA" ? p.nameLo : p.nameEn}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  isDisabled={isNotAdmin || !formData.provinceId}
                  label={t("auth.district")}
                  labelPlacement="outside"
                  placeholder={t("auth.district")}
                  selectedKeys={
                    formData.districtId ? [formData.districtId] : []
                  }
                  startContent={
                    <MapPin className="text-default-400" size={18} />
                  }
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const val = Array.from(keys)[0] as string;
                    setFormData({ ...formData, districtId: val });
                  }}
                >
                  {districts.map((d) => (
                    <SelectItem
                      key={d.id}
                      textValue={
                        formData.language === "LA" ? d.nameLo : d.nameEn
                      }
                    >
                      {formData.language === "LA" ? d.nameLo : d.nameEn}
                    </SelectItem>
                  ))}
                </Select>

                <Textarea
                  isDisabled={isNotAdmin}
                  className="md:col-span-2"
                  label={t("auth.address")}
                  labelPlacement="outside"
                  minRows={3}
                  placeholder={t("auth.addressPlaceholder")}
                  startContent={
                    <MapPin className="text-default-400 mt-2" size={18} />
                  }
                  value={formData.address}
                  variant="bordered"
                  onValueChange={(val) =>
                    setFormData({ ...formData, address: val })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="flat"
                  onPress={() => navigate("/settings/profile")}
                  className="font-bold px-6"
                >
                  ຍົກເລີກ
                </Button>
                <Button
                  isDisabled={isNotAdmin}
                  className="font-bold px-8"
                  color="primary"
                  isLoading={updateStoreMutation.isPending}
                  size="lg"
                  startContent={<Save size={20} />}
                  onPress={handleSubmit}
                >
                  {t("settings.common.save")}
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
