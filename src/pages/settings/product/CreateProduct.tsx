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
} from "@heroui/react";
import { Barcode, Tag, DollarSign, Package, Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useRef } from "react";

import { useCreateProduct } from "@/services/product/useProduct";
import { useUploadImage } from "@/services/storage";
import { Category } from "@/services/category/useCategory";
import { getDisplayImageUrl } from "@/lib/utils";
import { formatNumber, parseNumber } from "@/utils/numberFormat";

interface CreateProductProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  storeId: string;
  categories: Category[];
}

export default function CreateProduct({
  isOpen,
  onOpenChange,
  storeId,
  categories,
}: CreateProductProps) {
  const { t } = useTranslation();
  const createProductMutation = useCreateProduct();
  const uploadImageMutation = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewImage, setPreviewImage] = useState<string>("");
  const [formData, setFormData] = useState({
    barcode: "",
    name: "",
    description: "",
    cost: 0,
    price: 0,
    stockQty: 0,
    categoryId: "",
    image: "",
    isActive: true,
    isBarcode: false,
  });

  const resetForm = () => {
    setFormData({
      barcode: "",
      name: "",
      description: "",
      cost: 0,
      price: 0,
      stockQty: 0,
      categoryId: "",
      image: "",
      isActive: true,
      isBarcode: false,
    });
    setPreviewImage("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  const handleUploadImage = async (file: File) => {
    try {
      const previewUrl = URL.createObjectURL(file);

      setPreviewImage(previewUrl);
      const imageName = await uploadImageMutation.mutateAsync(file);

      setFormData((prev) => ({ ...prev, image: imageName }));
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      handleUploadImage(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
    setPreviewImage("");
  };

  const handleSubmit = async (onModalClose: () => void) => {
    try {
      await createProductMutation.mutateAsync({
        ...formData,
        cost: Number(formData.cost),
        price: Number(formData.price),
        stockQty: Number(formData.stockQty),
        storeId: storeId,
      });
      resetForm();
      onModalClose();
    } catch (error) {
      console.error("Failed to create product:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="2xl"
      onOpenChange={handleOpenChange}
    >
      <ModalContent>
        {(onModalClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-xl font-bold text-primary">
              {t("product.addTitle")}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-6 py-2">
                <div className="flex flex-col gap-2">
                  <label className="text-small font-medium text-default-700">
                    {t("product.image")}
                  </label>
                  <div
                    className={`
                      relative group cursor-pointer
                      w-full h-48 rounded-xl border-2 border-dashed 
                      transition-all duration-200 ease-in-out
                      flex flex-col items-center justify-center gap-3
                      ${previewImage || formData.image ? "border-primary bg-primary/5" : "border-default-200 hover:border-primary hover:bg-default-50"}
                    `}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];

                      if (file) {
                        handleUploadImage(file);
                      }
                    }}
                  >
                    {uploadImageMutation.isPending ? (
                      <div className="flex flex-col items-center gap-2">
                        <Spinner color="primary" size="lg" />
                        <p className="text-small text-default-500">
                          {t("settings.common.uploading")}
                        </p>
                      </div>
                    ) : previewImage || formData.image ? (
                      <>
                        <img
                          alt="Preview"
                          className="w-full h-full object-contain rounded-lg p-2"
                          src={getDisplayImageUrl(
                            previewImage || formData.image,
                          )}
                        />
                        <Button
                          isIconOnly
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          color="danger"
                          size="sm"
                          variant="flat"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage();
                          }}
                        >
                          <X size={16} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="p-4 rounded-full bg-primary/10 text-primary">
                          <Upload size={32} />
                        </div>
                        <div className="text-center">
                          <p className="text-small font-semibold">
                            {t("product.dragAndDrop")}
                          </p>
                          <p className="text-tiny text-default-400">
                            {t("product.imageHint")}
                          </p>
                        </div>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      type="file"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    isRequired
                    className="col-span-1 md:col-span-2"
                    label={t("settings.common.nameLabel")}
                    labelPlacement="outside"
                    placeholder={t("settings.common.nameLabel")}
                    value={formData.name}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormData((prev) => ({ ...prev, name: val }))
                    }
                  />
                  <Select
                    label={t("product.barcodeType")}
                    labelPlacement="outside"
                    placeholder={t("product.barcodeType")}
                    selectedKeys={formData.isBarcode ? ["yes"] : ["no"]}
                    variant="bordered"
                    onSelectionChange={(keys) => {
                      const val = Array.from(keys)[0] === "yes";

                      setFormData((prev) => ({
                        ...prev,
                        isBarcode: val,
                        barcode: val ? prev.barcode : "",
                      }));
                    }}
                  >
                    <SelectItem key={"yes"}>
                      {t("product.hasBarcode")}
                    </SelectItem>
                    <SelectItem key={"no"}>{t("product.noBarcode")}</SelectItem>
                  </Select>
                  <Input
                    isDisabled={!formData.isBarcode}
                    label={t("product.barcode")}
                    labelPlacement="outside"
                    placeholder={t("product.barcode")}
                    startContent={
                      <Barcode className="text-default-400" size={18} />
                    }
                    value={formData.barcode}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormData((prev) => ({ ...prev, barcode: val }))
                    }
                  />
                  <Select
                    isRequired
                    label={t("product.category")}
                    labelPlacement="outside"
                    placeholder={t("product.category")}
                    selectedKeys={
                      formData.categoryId ? [formData.categoryId] : []
                    }
                    startContent={
                      <Tag className="text-default-400" size={18} />
                    }
                    variant="bordered"
                    onSelectionChange={(keys) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: Array.from(keys)[0] as string,
                      }))
                    }
                  >
                    {categories.map((cat: Category) => (
                      <SelectItem key={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </Select>
                  <Input
                    label={t("product.stockQty")}
                    labelPlacement="outside"
                    placeholder="0"
                    startContent={
                      <Package className="text-default-400" size={18} />
                    }
                    type="text"
                    value={formatNumber(formData.stockQty)}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        stockQty: parseNumber(val),
                      }))
                    }
                  />
                  <Input
                    label={t("product.cost")}
                    labelPlacement="outside"
                    placeholder="0"
                    startContent={
                      <DollarSign className="text-default-400" size={18} />
                    }
                    type="text"
                    value={formatNumber(formData.cost)}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        cost: parseNumber(val),
                      }))
                    }
                  />
                  <Input
                    isRequired
                    label={t("product.price")}
                    labelPlacement="outside"
                    placeholder="0"
                    startContent={
                      <DollarSign className="text-default-400" size={18} />
                    }
                    type="text"
                    value={formatNumber(formData.price)}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: parseNumber(val),
                      }))
                    }
                  />
                  
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onModalClose}>
                {t("settings.common.cancel")}
              </Button>
              <Button
                color="primary"
                isDisabled={
                  !formData.name || !formData.categoryId || formData.price <= 0
                }
                isLoading={
                  createProductMutation.isPending ||
                  uploadImageMutation.isPending
                }
                onPress={() => handleSubmit(onModalClose)}
              >
                {t("settings.common.save")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
