import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Spinner,
  Image,
} from "@heroui/react";
import { User, Phone, Lock, Shield, Upload, X, Edit2 } from "lucide-react";

import {
  useCreateEmployee,
  useUpdateEmployee,
} from "@/services/employee/useEmployee";
import { useUploadImage } from "@/services/storage";
import { getDisplayImageUrl } from "@/lib/utils";
import { useGetPermissions } from "@/services/role-permission";

interface AddAndEditProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedEmployee: any | null;
  onSuccess: () => void;
  storeId: string;
}

export default function AddAndEdit({
  isOpen,
  onOpenChange,
  selectedEmployee,
  onSuccess,
  storeId,
}: AddAndEditProps) {
  const { t } = useTranslation();
  const [previewImage, setPreviewImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    phone: "",
    userName: "",
    password: "",
    language: "LA" as "LA" | "EN",
    permissionId: "",
    businessType: "RESTAURANT" as "RETAIL" | "RESTAURANT" | "ONLINE" | "CAFE",
  });

  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const uploadImageMutation = useUploadImage();
  const { data: permissionResponse } = useGetPermissions();
  const permissionsData = permissionResponse?.data || [];

  useEffect(() => {
    if (selectedEmployee) {
      setFormData({
        name: selectedEmployee.name || "",
        logoUrl: selectedEmployee.logoUrl || "",
        phone: selectedEmployee.phone || "",
        userName: selectedEmployee.userName || "",
        language: selectedEmployee.language || "LA",
        password: "",
        permissionId: selectedEmployee.permissionId || "",
        businessType: selectedEmployee.businessType || "RESTAURANT",
      });
      setPreviewImage(selectedEmployee.logoUrl || "");
    } else {
      resetForm();
    }
  }, [selectedEmployee, isOpen]);

  const resetForm = () => {
    setFormData({
      name: "",
      logoUrl: "",
      phone: "",
      userName: "",
      password: "",
      language: "LA",
      permissionId: "",
      businessType: "RESTAURANT",
    });
    setPreviewImage("");
  };

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

  const handleCreateSubmit = async (onClose: () => void) => {
    try {
      await createEmployeeMutation.mutateAsync({
        ...formData,
        storeId: storeId,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to create employee:", error);
    }
  };

  const handleUpdateSubmit = async (onClose: () => void) => {
    if (!selectedEmployee) return;

    const updateData: any = {
      id: selectedEmployee.id,
      storeId: storeId,
    };

    if (formData.name !== selectedEmployee.name)
      updateData.name = formData.name;
    if (formData.logoUrl !== selectedEmployee.logoUrl)
      updateData.logoUrl = formData.logoUrl;
    if (formData.phone !== selectedEmployee.phone)
      updateData.phone = formData.phone;
    if (formData.userName !== selectedEmployee.userName)
      updateData.userName = formData.userName;
    if (formData.language !== selectedEmployee.language)
      updateData.language = formData.language;
    if (formData.password) updateData.password = formData.password;
    if (formData.permissionId !== selectedEmployee.permissionId)
      updateData.permissionId = formData.permissionId;
    if (formData.businessType !== selectedEmployee.businessType)
      updateData.businessType = formData.businessType;

    if (Object.keys(updateData).length <= 2) {
      onClose();

      return;
    }

    try {
      await updateEmployeeMutation.mutateAsync(updateData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update employee:", error);
    }
  };

  const employeeForm = (
    <div className="space-y-4 py-2">
      <div className="flex flex-col items-center gap-2 mb-2">
        <div
          className={`
            relative group cursor-pointer
            w-24 h-24 rounded-full border-2 border-dashed 
            transition-all duration-200 ease-in-out
            flex items-center justify-center overflow-hidden
            ${previewImage || formData.logoUrl ? "border-primary bg-primary/5" : "border-default-200 hover:border-primary hover:bg-default-50"}
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploadImageMutation.isPending ? (
            <Spinner color="primary" />
          ) : previewImage || formData.logoUrl ? (
            <>
              <Image
                alt="Preview"
                className="w-full h-full object-cover"
                src={getDisplayImageUrl(previewImage || formData.logoUrl)}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Edit2 className="text-white" size={20} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-default-400">
              <Upload size={20} />
              <span className="text-[10px]">{t("settings.common.image")}</span>
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
        {(previewImage || formData.logoUrl) && (
          <Button
            className="h-7 min-w-0"
            color="danger"
            size="sm"
            startContent={<X size={14} />}
            variant="light"
            onPress={removeImage}
          >
            {t("settings.common.remove")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          isRequired
          label={t("employee.name")}
          placeholder={t("employee.name")}
          startContent={<User className="text-default-400" size={18} />}
          value={formData.name}
          variant="bordered"
          onValueChange={(val) => setFormData({ ...formData, name: val })}
        />
        <Input
          isRequired
          label={t("employee.phone")}
          placeholder="20XXXXXXXX"
          startContent={<Phone className="text-default-400" size={18} />}
          value={formData.phone}
          variant="bordered"
          onValueChange={(val) => setFormData({ ...formData, phone: val })}
        />
        <Input
          isRequired
          label={t("employee.username")}
          placeholder={t("employee.username")}
          startContent={<User className="text-default-400" size={18} />}
          value={formData.userName}
          variant="bordered"
          onValueChange={(val) => setFormData({ ...formData, userName: val })}
        />
        {!selectedEmployee && (
          <Input
            isRequired
            label={t("employee.password")}
            placeholder={t("employee.password")}
            startContent={<Lock className="text-default-400" size={18} />}
            type="password"
            value={formData.password}
            variant="bordered"
            onValueChange={(val) => setFormData({ ...formData, password: val })}
          />
        )}
        <Select
          className="md:col-span-2"
          label={t("employee.permissions")}
          placeholder={t("employee.permissions")}
          selectedKeys={formData.permissionId ? [formData.permissionId] : []}
          startContent={<Shield className="text-default-400" size={18} />}
          variant="bordered"
          onSelectionChange={(keys) => {
            const val = Array.from(keys)[0] as string;

            setFormData({ ...formData, permissionId: val });
          }}
        >
          {permissionsData.map((perm: any) => (
            <SelectItem key={perm.id}>{perm.name}</SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      size="2xl"
      onClose={resetForm}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {selectedEmployee
                ? t("employee.editTitle")
                : t("employee.addTitle")}
            </ModalHeader>
            <ModalBody>{employeeForm}</ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                {t("settings.common.cancel")}
              </Button>
              <Button
                color="primary"
                isDisabled={
                  !formData.name ||
                  !formData.userName ||
                  (!selectedEmployee && !formData.password)
                }
                isLoading={
                  (selectedEmployee
                    ? updateEmployeeMutation.isPending
                    : createEmployeeMutation.isPending) ||
                  uploadImageMutation.isPending
                }
                onPress={() =>
                  selectedEmployee
                    ? handleUpdateSubmit(onClose)
                    : handleCreateSubmit(onClose)
                }
              >
                {selectedEmployee
                  ? t("settings.common.update")
                  : t("settings.common.save")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
