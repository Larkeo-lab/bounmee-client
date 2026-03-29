import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Chip,
  Pagination,
  Spinner,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Switch,
} from "@heroui/react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Barcode,
  DollarSign,
  Package,
  Tag,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";
import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  type ChangeEvent,
} from "react";
import { useAuth } from "@/routes/AuthContext";
import { getDisplayImageUrl } from "@/lib/utils";
import {
  useGetProducts,
  Product,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/services/product/useProduct";
import { useGetCategories, Category } from "@/services/category/useCategory";
import { useUploadImage } from "@/services/storage";
import { formatNumber, parseNumber } from "@/utils/numberFormat";
import EmptyState from "@/components/common/empty-state";

export default function ProductPage() {
  const { user } = useAuth();
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onOpenChange: onCreateOpenChange,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const uploadImageMutation = useUploadImage();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [filterValue, setFilterValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filterValue);
      setPage(1); // Reset page on search
    }, 500);

    return () => clearTimeout(handler);
  }, [filterValue]);
  const rowsPerPage = 10;

  const [formData, setFormData] = useState({
    barcode: "",
    name: "",
    description: "",
    cost: 0,
    price: 0,
    stockQty: 0,
    categoryId: "",
    storeId: user?.user?.store?.id || "",
    image: "",
    isActive: true,
    isBarcode: false,
  });

  const { data: categoryResponse } = useGetCategories(user?.user?.storeId);
  const categories = categoryResponse?.data || [];

  const { data: productResponse, isLoading } = useGetProducts(
    user?.user?.storeId,
    selectedCategory === "all" ? undefined : selectedCategory,
    undefined, // isActive not used here or show all
    debouncedSearch,
  );
  const products = productResponse?.data || [];

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return products.slice(start, end);
  }, [page, products]);

  const handleCreateSubmit = async (onClose: () => void) => {
    try {
      await createProductMutation.mutateAsync({
        ...formData,
        cost: Number(formData.cost),
        price: Number(formData.price),
        stockQty: Number(formData.stockQty),
        storeId: user?.user?.store?.id || "",
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to create product:", error);
    }
  };

  console.log("user", user);

  const handleUpdateSubmit = async (onClose: () => void) => {
    if (!selectedProduct) return;
    try {
      await updateProductMutation.mutateAsync({
        ...formData,
        cost: Number(formData.cost),
        price: Number(formData.price),
        stockQty: Number(formData.stockQty),
        id: selectedProduct.id,
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  const handleDeleteSubmit = async (onClose: () => void) => {
    if (!selectedProduct) return;
    try {
      await deleteProductMutation.mutateAsync(selectedProduct.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      barcode: "",
      name: "",
      description: "",
      cost: 0,
      price: 0,
      stockQty: 0,
      categoryId: "",
      storeId: user?.user?.store?.id || "",
      image: "",
      isActive: true,
      isBarcode: false,
    });
    setPreviewImage("");
    setSelectedProduct(null);
  };

  const handleEditOpen = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      barcode: product.barcode,
      name: product.name,
      description: product.description || "",
      cost: Number(product.cost),
      price: Number(product.price),
      stockQty: Number(product.stockQty),
      categoryId: product.categoryId,
      storeId: user?.user?.store?.id || "",
      image: product.image || "",
      isActive: product.isActive,
      isBarcode: product.isBarcode || false,
    });
    setPreviewImage(product.image || "");
    onEditOpen();
  };

  const handleDeleteOpen = (product: Product) => {
    setSelectedProduct(product);
    onDeleteOpen();
  };

  const handleUploadImage = async (file: File) => {
    try {
      // Set local preview
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      // Upload image
      const imageName = await uploadImageMutation.mutateAsync(file);
      setFormData((prev) => ({ ...prev, image: imageName }));
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadImage(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
    setPreviewImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const renderCell = useCallback((product: Product, columnKey: React.Key) => {
    switch (columnKey) {
      case "name":
        return (
          <div className="flex items-center gap-3">
            {product.image ? (
              <img
                src={getDisplayImageUrl(product.image)}
                alt={product.name}
                className="w-10 h-10 rounded-lg object-cover border border-divider shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-default-100 flex items-center justify-center border border-divider">
                <ImageIcon size={20} className="text-default-400" />
              </div>
            )}
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">{product.name}</p>
              <p className="text-bold text-tiny text-default-400">
                {product.barcode}
              </p>
            </div>
          </div>
        );
      case "price":
        return (
          <p className="text-bold text-small whitespace-nowrap">
            {formatNumber(product.price)} LAK
          </p>
        );
      case "stockQty":
        return (
          <Chip
            className="capitalize"
            color={
              product.stockQty > 10
                ? "success"
                : product.stockQty > 0
                  ? "warning"
                  : "danger"
            }
            size="sm"
            variant="flat"
          >
            {formatNumber(product.stockQty)}
          </Chip>
        );
      case "isActive":
        return (
          <Switch
            isSelected={product.isActive}
            size="sm"
            onValueChange={async (val) => {
              try {
                await updateProductMutation.mutateAsync({
                  id: product.id,
                  isActive: val,
                });
              } catch (error) {
                console.error("Failed to update product status:", error);
              }
            }}
          />
        );
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => handleEditOpen(product)}
            >
              <Edit2 size={18} className="text-default-400" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={() => handleDeleteOpen(product)}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        );
      default:
        return null;
    }
  }, []);

  const productForm = (
    <div className="flex flex-col gap-6 py-2">
      <div className="flex flex-col gap-2">
        <label className="text-small font-medium text-default-700">
          ຮູບພາບສິນຄ້າ
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
              <p className="text-small text-default-500">ກຳລັງອັບໂຫຼດ...</p>
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
                  ຄລິກ ຫຼື ລາກຮູບມາວາງໃສ່ນີ້
                </p>
                <p className="text-tiny text-default-400">
                  ຮອງຮັບ PNG, JPG ຂະໜາດບໍ່ເກີນ 5MB
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
          label="ຊື່ສິນຄ້າ"
          placeholder="ປ້ອນຊື່ສິນຄ້າ"
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
          label="ປະເພດບາໂຄດ"
          placeholder="ເລືອກປະເພດບาໂຄດ"
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
          <SelectItem key={"yes"}>ມີบາໂຄດ</SelectItem>
          <SelectItem key={"no"}>ບໍ່ມີບາໂຄດ</SelectItem>
        </Select>
        <Input
          label="ບາໂຄດ"
          placeholder="ປ້ອນບາໂຄດ"
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
          label="ໝວດໝູ່"
          placeholder="ເລືອກໝວດໝູ່"
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
          label="ຕົ້ນທຶນ"
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
          label="ລາຄາຂາຍ"
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
          label="ຈຳນວນໃນສາງ"
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

      <div className="col-span-1 md:col-span-2">
        <Textarea
          label="ລາຍລະອຽດ"
          placeholder="ປ້ອນລາຍລະອຽດສິນຄ້າ (ຖ້າມີ)"
          variant="bordered"
          labelPlacement="outside"
          value={formData.description}
          onValueChange={(val) =>
            setFormData((prev) => ({ ...prev, description: val }))
          }
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Package size={28} />
            ຈັດການສິນຄ້າ
          </h1>
          <p className="text-default-500">
            ຄວບຄຸມ ແລະ ຈັດການລາຍການສິນຄ້າທັງໝົດໃນຮ້ານຂອງທ່ານ
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={20} />}
          onPress={onCreateOpen}
          className="font-bold h-12 px-6 shadow-lg shadow-primary/30"
        >
          ເພີ່ມສິນຄ້າໃໝ່
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <Input
            isClearable
            className="w-full sm:max-w-md"
            placeholder="ຄົ້ນຫາຕາມຊື່ ຫຼື ບາໂຄດ..."
            startContent={<Search className="text-default-400" size={18} />}
            value={filterValue}
            onValueChange={setFilterValue}
            variant="bordered"
          />
          <Select
            placeholder="ເລືອກປະເພດ"
            className="w-full md:w-[200px]"
            selectedKeys={selectedCategory ? [selectedCategory] : ["all"]}
            onSelectionChange={(keys) => {
              setSelectedCategory(Array.from(keys)[0] as string);
              setPage(1);
            }}
            variant="bordered"
            startContent={<Filter size={18} className="text-default-400" />}
          >
            <SelectItem key="all">ທັງໝົດ</SelectItem>
            {categories.map((cat: Category) => (
              <SelectItem key={cat.id}>{cat.name}</SelectItem>
            ))}
          </Select>
        </div>
        <div className="text-default-400 text-sm">
          ທັງໝົດ {products.length} ລາຍການ
        </div>
      </div>

      <Table
        aria-label="Products management table"
        className="mt-4"
        classNames={{
          wrapper: "shadow-sm border border-divider rounded-xl overflow-hidden",
          th: "bg-default-50 text-default-600 font-bold h-12",
        }}
        bottomContent={
          products.length > rowsPerPage ? (
            <div className="flex w-full justify-center p-4">
              <Pagination
                isCompact
                showControls
                color="primary"
                page={page}
                total={Math.ceil(products.length / rowsPerPage)}
                onChange={setPage}
              />
            </div>
          ) : null
        }
      >
        <TableHeader>
          <TableColumn key="name" className="h-12 text-small">
            ຊື່ສິນຄ້າ
          </TableColumn>
          <TableColumn key="price" className="h-12 text-small">
            ລາຄາ
          </TableColumn>
          <TableColumn key="stockQty" className="h-12 text-small">
            ຈຳນວນໃນສາງ
          </TableColumn>
          <TableColumn key="isActive" className="h-12 text-small">
            ສະຖານະ
          </TableColumn>
          <TableColumn key="actions" align="end" className="h-12 text-small">
            ຈັດການ
          </TableColumn>
        </TableHeader>
        <TableBody
          items={items}
          loadingContent={<Spinner label="ກຳລັງໂຫຼດຂໍ້ມູນ..." />}
          isLoading={isLoading}
          emptyContent={
            !isLoading && (
              <EmptyState
                message="ບໍ່ພົບຂໍ້ມູນສິນຄ້າ"
                description="ລອງຄົ້ນຫາດ້ວຍຄຳສັບອື່ນ ຫຼື ປ່ຽນໝວດໝູ່"
              />
            )
          }
        >
          {(item) => (
            <TableRow
              key={item.id}
              className="cursor-pointer hover:bg-default-50 transition-colors h-16"
            >
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* Create Product Modal */}
      <Modal
        isOpen={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) resetForm();
          onCreateOpenChange();
        }}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-xl font-bold text-primary">
                ເພີ່ມສິນຄ້າໃໝ່
              </ModalHeader>
              <ModalBody>{productForm}</ModalBody>
              <ModalFooter>
                <Button variant="flat" color="danger" onPress={onClose}>
                  ຍົກເລີກ
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleCreateSubmit(onClose)}
                  isLoading={
                    createProductMutation.isPending ||
                    uploadImageMutation.isPending
                  }
                  isDisabled={
                    !formData.name ||
                    !formData.categoryId ||
                    formData.price <= 0
                  }
                >
                  ບັນທຶກສິນຄ້າ
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditOpen}
        onOpenChange={(open) => {
          if (!open) resetForm();
          onEditOpenChange();
        }}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-xl font-bold text-primary">
                ແກ້ໄຂສິນຄ້າ
              </ModalHeader>
              <ModalBody>{productForm}</ModalBody>
              <ModalFooter>
                <Button variant="flat" color="danger" onPress={onClose}>
                  ຍົກເລີກ
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleUpdateSubmit(onClose)}
                  isLoading={
                    updateProductMutation.isPending ||
                    uploadImageMutation.isPending
                  }
                  isDisabled={
                    !formData.name ||
                    !formData.categoryId ||
                    formData.price <= 0
                  }
                >
                  ອັບເດດສິນຄ້າ
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                ຢືນຢັນການລຶບ
              </ModalHeader>
              <ModalBody>
                <p>
                  ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບສິນຄ້າ{" "}
                  <strong>{selectedProduct?.name}</strong>?
                  ການກະທຳນີ້ບໍ່ສາມາດກັບຄືນໄດ້.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  ຍົກເລີກ
                </Button>
                <Button
                  color="danger"
                  onPress={() => handleDeleteSubmit(onClose)}
                  isLoading={deleteProductMutation.isPending}
                >
                  ລຶບສິນຄ້າ
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
