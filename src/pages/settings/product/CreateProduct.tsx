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
      onOpenChange={handleOpenChange}
      size="2xl"
      scrollBehavior="inside"
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
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        handleUploadImage(file);
                      }
                    }}
                    className={`
                      relative group cursor-pointer
                      w-full h-48 rounded-xl border-2 border-dashed 
                      transition-all duration-200 ease-in-out
                      flex flex-col items-center justify-center gap-3
                      ${previewImage || formData.image ? "border-primary bg-primary/5" : "border-default-200 hover:border-primary hover:bg-default-50"}
                    `}
                  >
                    {uploadImageMutation.isPending ? (
                      <div className="flex flex-col items-center gap-2">
                        <Spinner size="lg" color="primary" />
                        <p className="text-small text-default-500">{t("settings.common.uploading")}</p>
                      </div>
                    ) : previewImage || formData.image ? (
                      <>
                        <img
                          src={getDisplayImageUrl(previewImage || formData.image)}
                          alt="Preview"
                          className="w-full h-full object-contain rounded-lg p-2"
                        />
                        <Button
                          isIconOnly
                          size="sm"
                          color="danger"
                          variant="flat"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t("settings.common.nameLabel")}
                    placeholder={t("settings.common.nameLabel")}
                    variant="bordered"
                    labelPlacement="outside"
                    className="col-span-1 md:col-span-2"
                    value={formData.name}
                    onValueChange={(val) =>
                      setFormData((prev) => ({ ...prev, name: val }))
                    }
                    isRequired
                  />
                  <Select
                    label={t("product.barcodeType")}
                    placeholder={t("product.barcodeType")}
                    variant="bordered"
                    labelPlacement="outside"
                    selectedKeys={formData.isBarcode ? ["yes"] : ["no"]}
                    onSelectionChange={(keys) => {
                      const val = Array.from(keys)[0] === "yes";
                      setFormData((prev) => ({
                        ...prev,
                        isBarcode: val,
                        barcode: val ? prev.barcode : "",
                      }));
                    }}
                  >
                    <SelectItem key={"yes"}>{t("product.hasBarcode")}</SelectItem>
                    <SelectItem key={"no"}>{t("product.noBarcode")}</SelectItem>
                  </Select>
                  <Input
                    label={t("product.barcode")}
                    placeholder={t("product.barcode")}
                    variant="bordered"
                    labelPlacement="outside"
                    startContent={<Barcode size={18} className="text-default-400" />}
                    value={formData.barcode}
                    onValueChange={(val) =>
                      setFormData((prev) => ({ ...prev, barcode: val }))
                    }
                    isDisabled={!formData.isBarcode}
                  />
                  <Select
                    label={t("product.category")}
                    placeholder={t("product.category")}
                    variant="bordered"
                    labelPlacement="outside"
                    startContent={<Tag size={18} className="text-default-400" />}
                    selectedKeys={formData.categoryId ? [formData.categoryId] : []}
                    onSelectionChange={(keys) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: Array.from(keys)[0] as string,
                      }))
                    }
                    isRequired
                  >
                    {categories.map((cat: Category) => (
                      <SelectItem key={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </Select>
                  <Input
                    label={t("product.cost")}
                    placeholder="0"
                    type="text"
                    variant="bordered"
                    labelPlacement="outside"
                    startContent={<DollarSign size={18} className="text-default-400" />}
                    value={formatNumber(formData.cost)}
                    onValueChange={(val) =>
                      setFormData((prev) => ({ ...prev, cost: parseNumber(val) }))
                    }
                  />
                  <Input
                    label={t("product.price")}
                    placeholder="0"
                    type="text"
                    variant="bordered"
                    labelPlacement="outside"
                    startContent={<DollarSign size={18} className="text-default-400" />}
                    value={formatNumber(formData.price)}
                    onValueChange={(val) =>
                      setFormData((prev) => ({ ...prev, price: parseNumber(val) }))
                    }
                    isRequired
                  />
                  <Input
                    label={t("product.stockQty")}
                    placeholder="0"
                    type="text"
                    variant="bordered"
                    labelPlacement="outside"
                    startContent={<Package size={18} className="text-default-400" />}
                    value={formatNumber(formData.stockQty)}
                    onValueChange={(val) =>
                      setFormData((prev) => ({ ...prev, stockQty: parseNumber(val) }))
                    }
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" color="danger" onPress={onModalClose}>
                {t("settings.common.cancel")}
              </Button>
              <Button
                color="primary"
                onPress={() => handleSubmit(onModalClose)}
                isLoading={
                  createProductMutation.isPending || uploadImageMutation.isPending
                }
                isDisabled={
                  !formData.name || !formData.categoryId || formData.price <= 0
                }
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
