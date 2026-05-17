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
  useDisclosure,
  Switch,
  Tabs,
  Tab,
} from "@heroui/react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Package,
  Image as ImageIcon,
  Barcode,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";

import CreateProduct from "./CreateProduct";
import EditProduct from "./EditProduct";
import UnitList from "./unit/UnitList";

import { useAuth } from "@/routes/AuthContext";
import { getDisplayImageUrl } from "@/lib/utils";
import {
  useGetProducts,
  Product,
  useUpdateProduct,
  useDeleteProduct,
} from "@/services/product/useProduct";
import { useGetCategories, Category } from "@/services/category/useCategory";
import { formatNumber } from "@/utils/numberFormat";
import EmptyState from "@/components/common/empty-state";
import ConfirmModal from "@/components/common/popup-confirm";
import PendingModal from "@/components/common/pending-modal";
import CameraModal from "@/components/camera";

export default function ProductPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
    onOpenChange: onCreateOpenChange,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
    onOpenChange: onEditOpenChange,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();
  const {
    isOpen: isPendingOpen,
    onOpen: onPendingOpen,
    onOpenChange: onPendingOpenChange,
  } = useDisclosure();
  const {
    isOpen: isRejectedOpen,
    onOpen: onRejectedOpen,
    onClose: onRejectedClose,
    onOpenChange: onRejectedOpenChange,
  } = useDisclosure();

  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [filterValue, setFilterValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState("product");
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string>("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filterValue);
      setPage(1); // Reset page on search
    }, 500);

    return () => clearTimeout(handler);
  }, [filterValue]);
  const rowsPerPage = 50;

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

  const handleDeleteSubmit = async (onClose: () => void) => {
    if (!selectedProduct) return;
    try {
      await deleteProductMutation.mutateAsync(selectedProduct.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleEditOpen = (product: Product) => {
    setSelectedProduct(product);
    onEditOpen();
  };

  const handleDeleteOpen = (product: Product) => {
    setSelectedProduct(product);
    onDeleteOpen();
  };

  const handleAddProductOpen = () => {
    // @ts-ignore
    const storeStatus = user?.user?.store?.status;
    const canAddTrial = products.length < 5;

    if (canAddTrial) {
      setScannedBarcode("");
      onCreateOpen();
      return;
    }

    if (storeStatus === "PENDING") {
      onPendingOpen();
    } else if (storeStatus === "REJECTED") {
      onRejectedOpen();
    } else {
      setScannedBarcode("");
      onCreateOpen();
    }
  };

  const handleScanBarcode = () => {
    // @ts-ignore
    const storeStatus = user?.user?.store?.status;
    const canAddTrial = products.length < 5;

    if (canAddTrial) {
      setScannedBarcode("");
      setIsBarcodeScannerOpen(true);
      return;
    }

    if (storeStatus === "PENDING") {
      onPendingOpen();
    } else if (storeStatus === "REJECTED") {
      onRejectedOpen();
    } else {
      setScannedBarcode("");
      setIsBarcodeScannerOpen(true);
    }
  };

  const handleBarcodeScanned = (barcode: string) => {
    setIsBarcodeScannerOpen(false);
    setScannedBarcode(barcode);
    onCreateOpen();
  };

  return (
    <div className="space-y-6 m-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Package size={28} />
            {t("product.title")}
          </h1>
          <p className="text-default-500">{t("product.subtitle")}</p>
        </div>
        {selectedTab === "product" && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              className="font-bold h-12 px-6 shadow-lg shadow-primary/30 flex-1 md:flex-none"
              color="primary"
              startContent={<Barcode size={20} />}
              onPress={handleScanBarcode}
            >
              {t("product.scanBarcode")}
            </Button>
            <Button
              className="font-bold h-12 px-6 shadow-lg shadow-primary/30 flex-1 md:flex-none"
              color="primary"
              startContent={<Plus size={20} />}
              onPress={handleAddProductOpen}
            >
              {t("product.addTitle")}
            </Button>
          </div>
        )}
      </div>

      <Tabs
        aria-label="Product and Unit Tabs"
        classNames={{
          tabList: "bg-content1 shadow-md w-full sm:w-auto",
          cursor: "w-full bg-primary",
          tab: "h-12 px-6",
          tabContent:
            "font-bold text-default-500 group-data-[selected=true]:text-white",
        }}
        color="primary"
        radius="full"
        selectedKey={selectedTab}
        variant="solid"
        onSelectionChange={(key) => {
          setSelectedTab(key as string);
          setPage(1);
        }}
      >
        <Tab key="product" title={t("sidebar.menu.manageProduct")} />
        <Tab key="unit" title={t("settings.product.unitTitle")} />
      </Tabs>

      {selectedTab === "product" ? (
        <>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
              <Input
                isClearable
                className="w-full sm:max-w-md"
                placeholder={t("product.searchPlaceholder")}
                startContent={<Search className="text-default-400" size={18} />}
                value={filterValue}
                variant="bordered"
                onValueChange={setFilterValue}
              />
              <Select
                className="w-full md:w-[200px]"
                placeholder={t("product.category")}
                selectedKeys={selectedCategory ? [selectedCategory] : ["all"]}
                startContent={<Filter className="text-default-400" size={18} />}
                variant="bordered"
                onSelectionChange={(keys) => {
                  setSelectedCategory(Array.from(keys)[0] as string);
                  setPage(1);
                }}
              >
                <SelectItem key="all">{t("settings.common.all")}</SelectItem>
                {categories.map((cat: Category) => (
                  <SelectItem key={cat.id}>{cat.name}</SelectItem>
                ))}
              </Select>
            </div>
            <div className="text-default-400 text-sm">
              {t("settings.common.total", { count: products.length })}
            </div>
          </div>

          <Table
            aria-label="Products management table"
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
            className="mt-4"
            classNames={{
              wrapper:
                "shadow-sm border border-divider rounded-xl overflow-hidden",
              th: "bg-default-50 text-default-600 font-bold h-12",
            }}
          >
            <TableHeader>
              <TableColumn
                key="no"
                className="h-12 text-small hidden sm:table-cell"
              >
                {t("settings.common.no")}
              </TableColumn>
              <TableColumn key="name" className="h-12 text-small">
                {t("settings.common.nameLabel")}
              </TableColumn>
              <TableColumn
                key="price"
                className="h-12 text-small hidden md:table-cell"
              >
                {t("product.cost")}
              </TableColumn>
              <TableColumn
                key="price"
                className="h-12 text-small hidden md:table-cell"
              >
                {t("product.price")}
              </TableColumn>
              <TableColumn key="stockQty" className="h-12 text-small">
                {t("product.stockQty")}
              </TableColumn>
              <TableColumn
                key="unit"
                className="h-12 text-small hidden md:table-cell"
              >
                {t("settings.product.unitTitle")}
              </TableColumn>
              <TableColumn
                key="isActive"
                className="h-12 text-small hidden sm:table-cell"
              >
                {t("settings.common.status")}
              </TableColumn>
              <TableColumn
                key="actions"
                align="end"
                className="h-12 text-small"
              >
                {t("settings.common.actions")}
              </TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={
                !isLoading && (
                  <EmptyState
                    description={t("product.emptyDesc")}
                    message={t("product.emptyTitle")}
                  />
                )
              }
              isLoading={isLoading}
              loadingContent={<Spinner label={t("settings.common.loading")} />}
            >
              {items.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-default-50 transition-colors h-16"
                >
                  <TableCell className="hidden sm:table-cell">
                    <p className="text-bold text-small text-default-400">
                      {(page - 1) * rowsPerPage + index + 1}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {item.image ? (
                        <img
                          alt={item.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover border border-divider shadow-sm"
                          src={getDisplayImageUrl(item.image)}
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-default-100 flex items-center justify-center border border-divider">
                          <ImageIcon className="text-default-400" size={16} />
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <p className="text-bold text-small capitalize truncate">
                          {item.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2">
                          <p className="text-bold text-tiny text-default-400">
                            {item.barcode}
                          </p>
                          <p className="text-bold text-tiny text-primary md:hidden">
                            {formatNumber(item.price)} LAK
                          </p>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="text-bold text-small whitespace-nowrap">
                      {formatNumber(item.cost)} LAK
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="text-bold text-small whitespace-nowrap">
                      {formatNumber(item.price)} LAK
                    </p>
                  </TableCell>
                  <TableCell>
                    <Chip
                      className="capitalize"
                      color={
                        item.stockQty > 10
                          ? "success"
                          : item.stockQty > 0
                            ? "warning"
                            : "danger"
                      }
                      size="sm"
                      variant="flat"
                    >
                      {formatNumber(item.stockQty)}
                    </Chip>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-small text-default-500">
                      {item.unit?.name || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Switch
                      isSelected={item.isActive}
                      size="sm"
                      onValueChange={async (val) => {
                        try {
                          await updateProductMutation.mutateAsync({
                            id: item.id,
                            isActive: val,
                          });
                        } catch (error) {
                          console.error(
                            "Failed to update product status:",
                            error,
                          );
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="relative flex justify-end items-center gap-1 sm:gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleEditOpen(item)}
                      >
                        <Edit2 className="text-default-400" size={18} />
                      </Button>
                      <Button
                        isIconOnly
                        color="danger"
                        size="sm"
                        variant="light"
                        onPress={() => handleDeleteOpen(item)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <UnitList storeId={user?.user?.storeId || ""} />
      )}
      {/* Create Product Modal */}
      <CreateProduct
        categories={categories}
        initialBarcode={scannedBarcode}
        isOpen={isCreateOpen}
        storeId={user?.user?.storeId || ""}
        onClose={onCreateClose}
        onOpenChange={onCreateOpenChange}
      />

      {/* Barcode Scanner */}
      <CameraModal
        cameraType="BARCODE"
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onScan={handleBarcodeScanned}
      />

      {/* Edit Product Modal */}
      <EditProduct
        categories={categories}
        isOpen={isEditOpen}
        product={selectedProduct}
        storeId={user?.user?.storeId || ""}
        onClose={onEditClose}
        onOpenChange={onEditOpenChange}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        color="danger"
        confirmText={t("settings.common.delete")}
        icon={<Trash2 size={24} />}
        isOpen={isDeleteOpen}
        message={t("product.deleteConfirmMsg", { name: selectedProduct?.name })}
        title={t("settings.common.confirmDelete")}
        onConfirm={() => handleDeleteSubmit(onDeleteClose)}
        onOpenChange={onDeleteOpenChange}
      />

      {/* Pending Status Modal */}
      <PendingModal isOpen={isPendingOpen} onOpenChange={onPendingOpenChange} />

      {/* Rejected Status Modal */}
      <ConfirmModal
        color="danger"
        confirmText={t("settings.common.ok")}
        isOpen={isRejectedOpen}
        message={t("settings.common.rejectedMsg")}
        title={t("settings.common.rejectedTitle")}
        onConfirm={onRejectedClose}
        onOpenChange={onRejectedOpenChange}
      />
    </div>
  );
}
