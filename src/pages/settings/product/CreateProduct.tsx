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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  Barcode,
  Tag,
  Package,
  Upload,
  X,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";

import CameraModal from "@/components/camera";

import { toast } from "react-hot-toast";

import {
  useCreateProduct,
  useUpdateProduct,
  getProductByBarcode,
} from "@/services/product/useProduct";
import { useUploadImage } from "@/services/storage";
import { Category } from "@/services/category/useCategory";
import { getDisplayImageUrl } from "@/lib/utils";
import { formatNumber, parseNumber } from "@/utils/numberFormat";
import { useGetUnits, Unit } from "@/services/unit/useUnit";
import { Layers } from "lucide-react";

interface CreateProductProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  storeId: string;
  categories: Category[];
  initialBarcode?: string;
}

export default function CreateProduct({
  isOpen,
  onOpenChange,
  storeId,
  categories,
  initialBarcode,
}: CreateProductProps) {
  const { t } = useTranslation();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const uploadImageMutation = useUploadImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);

  const [previewImage, setPreviewImage] = useState<string>("");
  const [formData, setFormData] = useState({
    barcode: "",
    name: "",
    description: "",
    cost: 0,
    price: 0,
    stockQty: 0,
    categoryId: "",
    unitId: "",
    image: "",
    isActive: true,
    isBarcode: false,
  });
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [existingProductId, setExistingProductId] = useState<string | null>(
    null,
  );

  const resetForm = () => {
    setFormData({
      barcode: "",
      name: "",
      description: "",
      cost: 0,
      price: 0,
      stockQty: 0,
      categoryId: "",
      unitId: "",
      image: "",
      isActive: true,
      isBarcode: false,
    });
    setPreviewImage("");
    setIsUpdateMode(false);
    setExistingProductId(null);
  };

  // When opened with a scanned barcode, pre-fill and search
  useEffect(() => {
    if (isOpen && initialBarcode) {
      setFormData((prev) => ({ ...prev, barcode: initialBarcode, isBarcode: true }));
      handleBarcodeSearch(initialBarcode);
    }
  }, [isOpen, initialBarcode]);

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

  const handleTakePhoto = () => {
    setIsCameraOpen(true);
  };

  const handleBarcodeScan = (data: string) => {
    setFormData((prev) => ({ ...prev, barcode: data }));
    handleBarcodeSearch(data);
  };

  const handleBarcodeSearch = async (barcode: string) => {
    if (!barcode.trim() || !storeId) return;
    try {
      const product = await getProductByBarcode(barcode.trim(), storeId);

      if (product) {
        setFormData({
          barcode: product.barcode,
          name: product.name,
          description: product.description || "",
          cost: Number(product.cost),
          price: Number(product.price),
          stockQty: Number(product.stockQty),
          categoryId: product.categoryId,
          unitId: product.unitId || "",
          image: product.image || "",
          isActive: product.isActive,
          isBarcode: product.isBarcode || false,
        });
        setPreviewImage(product.image || "");
        setIsUpdateMode(true);
        setExistingProductId(product.id);
        toast.success(t("product.foundExisting") || "พบข้อมูลสินค้าเดิม");
      } else {
        setIsUpdateMode(false);
        setExistingProductId(null);
      }
    } catch (error) {
      setIsUpdateMode(false);
      setExistingProductId(null);
    }
  };

  const { data: unitsResponse } = useGetUnits(storeId);
  const units = unitsResponse?.data || [];

  const handleSubmit = async (onModalClose: () => void) => {
    try {
      if (isUpdateMode && existingProductId) {
        await updateProductMutation.mutateAsync({
          ...formData,
          id: existingProductId,
          cost: Number(formData.cost),
          price: Number(formData.price),
          stockQty: Number(formData.stockQty),
          storeId: storeId,
        });
        toast.success(t("product.updateSuccess") || "อัปเดตสินค้าสำเร็จ");
      } else {
        await createProductMutation.mutateAsync({
          ...formData,
          cost: Number(formData.cost),
          price: Number(formData.price),
          stockQty: Number(formData.stockQty),
          storeId: storeId,
        });
        toast.success(t("product.createSuccess") || "เพิ่มสินค้าสำเร็จ");
      }
      resetForm();
      onModalClose();
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error(t("product.saveError") || "เกิดข้อผิดพลาดในการบันทึก");
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
              {isUpdateMode ? t("product.editTitle") : t("product.addTitle")}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-6 py-2">
                <div className="flex flex-col gap-2">
                  <label className="text-small font-medium text-default-700">
                    {t("product.image")}
                  </label>
                  <Dropdown>
                    <DropdownTrigger>
                      <div
                        className={`
                          relative group cursor-pointer
                          w-full h-48 rounded-xl border-2 border-dashed 
                          transition-all duration-200 ease-in-out
                          flex flex-col items-center justify-center gap-3
                          ${previewImage || formData.image ? "border-primary bg-primary/5" : "border-default-200 hover:border-primary hover:bg-default-50"}
                        `}
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
                      </div>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Image Upload Options">
                      <DropdownItem
                        key="gallery"
                        startContent={<ImageIcon size={18} />}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {t("product.chooseGallery")}
                      </DropdownItem>
                      <DropdownItem
                        key="camera"
                        startContent={<Camera size={18} />}
                        onClick={handleTakePhoto}
                      >
                        {t("product.takePhoto")}
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>

                  <input
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    type="file"
                    onChange={handleImageChange}
                  />

                  <CameraModal
                    isOpen={isCameraOpen}
                    onCapture={handleUploadImage}
                    onClose={() => setIsCameraOpen(false)}
                  />

                  <CameraModal
                    cameraType="BARCODE"
                    isOpen={isBarcodeScannerOpen}
                    onScan={handleBarcodeScan}
                    onClose={() => setIsBarcodeScannerOpen(false)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    isRequired
                    className="col-span-1 md:col-span-3"
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
                    className="md:col-span-2"
                    label={t("product.barcode")}
                    labelPlacement="outside"
                    placeholder={t("product.barcode")}
                    startContent={
                      <Barcode className="text-default-400" size={18} />
                    }
                    endContent={
                      formData.isBarcode && (
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onClick={() => setIsBarcodeScannerOpen(true)}
                        >
                          <Camera size={18} className="text-primary" />
                        </Button>
                      )
                    }
                    value={formData.barcode}
                    variant="bordered"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleBarcodeSearch(formData.barcode);
                      }
                    }}
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
                  <Select
                    label={t("product.unit")}
                    labelPlacement="outside"
                    placeholder={t("product.unit")}
                    selectedKeys={formData.unitId ? [formData.unitId] : []}
                    startContent={
                      <Layers className="text-default-400" size={18} />
                    }
                    variant="bordered"
                    onSelectionChange={(keys) =>
                      setFormData((prev) => ({
                        ...prev,
                        unitId: Array.from(keys)[0] as string,
                      }))
                    }
                  >
                    {units.map((unit: Unit) => (
                      <SelectItem key={unit.id}>{unit.name}</SelectItem>
                    ))}
                  </Select>
                  <Input
                    label={t("product.cost")}
                    labelPlacement="outside"
                    placeholder="0"
                    startContent={
                      <span className="text-default-400 font-bold text-small">
                        {t("common.currency")}
                      </span>
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
                      <span className="text-default-400 font-bold text-small">
                        {t("common.currency")}
                      </span>
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
                  <div className="hidden md:block" />
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
                  updateProductMutation.isPending ||
                  uploadImageMutation.isPending
                }
                onPress={() => handleSubmit(onModalClose)}
              >
                {isUpdateMode
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
