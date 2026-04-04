import { useState, useEffect, useRef, type ChangeEvent } from "react";
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
import { Store as StoreIcon, Upload, Save, X, Phone, MapPin, Building, Mail, Languages } from "lucide-react";
import { useAuth } from "@/routes/AuthContext";
import { useGetStoreDetail, useUpdateStore } from "@/services/store/useStore";
import { useUploadImage } from "@/services/storage";
import { getDisplayImageUrl } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const { data: storeResponse, isLoading } = useGetStoreDetail(user?.user?.store?.id);
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
    province: "",
    district: "",
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
        province: currentLang === "LA" 
          ? store.province?.nameLo || store.province?.nameEn || ""
          : store.province?.nameEn || store.province?.nameLo || "",
        district: currentLang === "LA"
          ? store.district?.nameLo || store.district?.nameEn || ""
          : store.district?.nameEn || store.district?.nameLo || "",
      });
      setPreviewImage(store.logoUrl || "");
    }
  }, [store, i18n.language]);

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
    if (!store?.id) return;
    try {
      await updateStoreMutation.mutateAsync({
        ...formData,
        id: store.id,
      });
    } catch (error) {
      console.error("Failed to update store:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  console.log('formData', formData)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <StoreIcon size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary">ຈັດການໂປຟາຍຮ້ານ</h1>
          <p className="text-default-500">ອັບເດດຂໍ້ມູນພື້ນຖານຂອງຮ້านທ່ານ</p>
        </div>
      </div>

      <Card className="shadow-sm border border-divider">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Logo Section */}
            <div className="flex flex-col items-center gap-4">
              <label className="text-sm font-medium text-default-700 w-full text-center md:text-left">
                ໂລໂກ້ຮ້ານ
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative group cursor-pointer
                  w-48 h-48 rounded-2xl border-2 border-dashed 
                  transition-all duration-200 ease-in-out
                  flex items-center justify-center overflow-hidden
                  ${previewImage || formData.logoUrl ? "border-primary bg-primary/5" : "border-default-200 hover:border-primary hover:bg-default-50"}
                `}
              >
                {uploadImageMutation.isPending ? (
                  <Spinner color="primary" />
                ) : previewImage || formData.logoUrl ? (
                  <>
                    <Image
                      src={getDisplayImageUrl(previewImage || formData.logoUrl)}
                      alt="Store Logo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                      <Upload size={24} />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-default-400">
                    <Upload size={32} />
                    <span className="text-sm">ອັບໂຫຼດໂລໂກ້</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              {(previewImage || formData.logoUrl) && (
                <Button
                  size="sm"
                  color="danger"
                  variant="light"
                  startContent={<X size={16} />}
                  onPress={removeImage}
                >
                  ລົບຮູບ
                </Button>
              )}
            </div>

            {/* Form Section */}
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <Input
                  label="ຊື່ຮ້ານ"
                  placeholder="ລະບຸຊື່ຮ້ານຂອງທ່ານ"
                  variant="bordered"
                  labelPlacement="outside"
                  value={formData.name}
                  onValueChange={(val) => setFormData({ ...formData, name: val })}
                  startContent={<Building size={18} className="text-default-400" />}
                />

                <Input
                  label="ເບີໂທລະສັບ"
                  placeholder="ລະບຸເບີໂທຕິດຕໍ່"
                  variant="bordered"
                  labelPlacement="outside"
                  value={formData.phone}
                  onValueChange={(val) => setFormData({ ...formData, phone: val })}
                  startContent={<Phone size={18} className="text-default-400" />}
                />

                <Input
                  label="ອີເມວ"
                  placeholder="ລະບຸອີເມວຂອງທ່ານ"
                  variant="bordered"
                  labelPlacement="outside"
                  value={formData.email}
                  onValueChange={(val) => setFormData({ ...formData, email: val })}
                  startContent={<Mail size={18} className="text-default-400" />}
                />


                <Input
                  label="ແຂວງ (Province)"
                  placeholder="ແຂວງ"
                  variant="bordered"
                  labelPlacement="outside"
                  value={formData.province}
                  isReadOnly
                  startContent={<MapPin size={18} className="text-default-400" />}
                />

                <Input
                  label="ເມືອງ (District)"
                  placeholder="ເມືອງ"
                  variant="bordered"
                  labelPlacement="outside"
                  value={formData.district}
                  isReadOnly
                  startContent={<MapPin size={18} className="text-default-400" />}
                />

                <Textarea
                  label="ລາຍລະອຽດທີ່ຢູ່"
                  placeholder="ລະບຸທີ່ຢູ່ຂອງຮ້ານ"
                  variant="bordered"
                  labelPlacement="outside"
                  value={formData.address}
                  onValueChange={(val) => setFormData({ ...formData, address: val })}
                  startContent={<MapPin size={18} className="text-default-400 mt-2" />}
                  minRows={3}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  color="primary"
                  size="lg"
                  className="font-bold px-8"
                  startContent={<Save size={20} />}
                  onPress={handleSubmit}
                  isLoading={updateStoreMutation.isPending}
                >
                  ບັນທຶກการป່ຽນແປງ
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
