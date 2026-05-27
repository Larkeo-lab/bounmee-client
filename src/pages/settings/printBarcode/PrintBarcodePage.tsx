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
  Checkbox,
  useDisclosure,
} from "@heroui/react";
import {
  Search,
  Filter,
  Package,
  Image as ImageIcon,
  Printer,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/routes/AuthContext";
import { getDisplayImageUrl } from "@/lib/utils";
import { useGetProducts, Product } from "@/services/product/useProduct";
import { useGetCategories, Category } from "@/services/category/useCategory";
import { formatNumber } from "@/utils/numberFormat";
import EmptyState from "@/components/common/empty-state";
import PrintBarcodeModal from "./prntBarcodeModal";

const PrintBarcodePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [filterValue, setFilterValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(),
  );
  const {
    isOpen: isBarcodeModalOpen,
    onOpen: onBarcodeModalOpen,
    onClose: onBarcodeModalClose,
    onOpenChange: onBarcodeModalOpenChange,
  } = useDisclosure();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filterValue);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [filterValue]);

  const rowsPerPage = 50;

  const { data: categoryResponse } = useGetCategories(user?.user?.storeId);
  const categories = categoryResponse?.data || [];

  const { data: productResponse, isLoading } = useGetProducts(
    user?.user?.storeId,
    selectedCategory === "all" ? undefined : selectedCategory,
    undefined,
    debouncedSearch,
  );
  const products = (productResponse?.data || []).filter(
    (p: Product) => p.barcode,
  );

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return products.slice(start, end);
  }, [page, products]);

  const handleSelectAll = () => {
    if (selectedProducts.size === items.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(items.map((item) => item.id)));
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleGenerateBarcode = () => {
    onBarcodeModalOpen();
  };

  const selectedProductList = useMemo(
    () =>
      products.filter((p: Product) => selectedProducts.has(p.id)),
    [products, selectedProducts],
  );

  return (
    <div className="space-y-6 m-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Package size={28} />
            {t("printBarcode.title")}
          </h1>
          <p className="text-default-500">{t("printBarcode.subtitle")}</p>
        </div>
        <Button
          className="font-bold h-12 px-6 shadow-lg shadow-primary/30"
          color="primary"
          isDisabled={selectedProducts.size === 0}
          startContent={<Printer size={20} />}
          onPress={handleGenerateBarcode}
        >
          {t("printBarcode.generate")} ({selectedProducts.size})
        </Button>
      </div>

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
        aria-label="Products barcode table"
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
          wrapper: "shadow-sm border border-divider rounded-xl overflow-hidden",
          th: "bg-default-50 text-default-600 font-bold h-12",
        }}
      >
        <TableHeader>
          <TableColumn key="select" className="h-12 text-small w-12">
            <Checkbox
              isSelected={
                items.length > 0 && selectedProducts.size === items.length
              }
              isIndeterminate={
                selectedProducts.size > 0 &&
                selectedProducts.size < items.length
              }
              onValueChange={handleSelectAll}
            />
          </TableColumn>
          <TableColumn
            key="no"
            className="h-12 text-small hidden sm:table-cell text-primary"
          >
            {t("settings.common.no")}
          </TableColumn>
          <TableColumn key="name" className="h-12 text-small text-primary">
            {t("settings.common.nameLabel")}
          </TableColumn>
          <TableColumn
            key="cost"
            className="h-12 text-small hidden md:table-cell text-primary"
          >
            {t("product.cost")}
          </TableColumn>
          <TableColumn
            key="price"
            className="h-12 text-small hidden md:table-cell text-primary"
          >
            {t("product.price")}
          </TableColumn>
          <TableColumn key="stockQty" className="h-12 text-small text-primary">
            {t("product.stockQty")}
          </TableColumn>
          <TableColumn
            key="unit"
            className="h-12 text-small hidden md:table-cell text-primary"
          >
            {t("settings.product.unitTitle")}
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
              className={`cursor-pointer transition-colors h-16 ${
                selectedProducts.has(item.id)
                  ? "!bg-primary-100 hover:!bg-primary-200"
                  : "hover:bg-default-50"
              }`}
              onClick={() => handleSelectProduct(item.id)}
            >
              <TableCell>
                <Checkbox
                  isSelected={selectedProducts.has(item.id)}
                  onValueChange={() => handleSelectProduct(item.id)}
                />
              </TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PrintBarcodeModal
        isOpen={isBarcodeModalOpen}
        selectedProducts={selectedProductList}
        onClose={onBarcodeModalClose}
        onOpenChange={onBarcodeModalOpenChange}
      />
    </div>
  );
};

export default PrintBarcodePage;
