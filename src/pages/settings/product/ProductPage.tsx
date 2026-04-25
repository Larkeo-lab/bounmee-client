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
} from "@heroui/react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Package,
  Image as ImageIcon,
} from "lucide-react";
import {
  useState,
  useMemo,
  useEffect,
} from "react";
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
import CreateProduct from "./CreateProduct";
import EditProduct from "./EditProduct";

export default function ProductPage() {
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
    onClose: onPendingClose,
    onOpenChange: onPendingOpenChange,
  } = useDisclosure();

  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

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
    if (user?.user?.store?.status === "PENDING") {
      onPendingOpen();
    } else {
      onCreateOpen();
    }
  };

  return (
    <div className="space-y-6 m-4">
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
          onPress={handleAddProductOpen}
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
          <TableColumn key="no" className="h-12 text-small">
            ລຳດັບ
          </TableColumn>
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
          {items.map((item, index) => (
            <TableRow
              key={item.id}
              className="cursor-pointer hover:bg-default-50 transition-colors h-16"
            >
              <TableCell>
                <p className="text-bold text-small text-default-400">
                  {(page - 1) * rowsPerPage + index + 1}
                </p>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  {item.image ? (
                    <img
                      src={getDisplayImageUrl(item.image)}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover border border-divider shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-default-100 flex items-center justify-center border border-divider">
                      <ImageIcon size={20} className="text-default-400" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <p className="text-bold text-small capitalize">
                      {item.name}
                    </p>
                    <p className="text-bold text-tiny text-default-400">
                      {item.barcode}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
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
              <TableCell>
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
                      console.error("Failed to update product status:", error);
                    }
                  }}
                />
              </TableCell>
              <TableCell>
                <div className="relative flex justify-end items-center gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => handleEditOpen(item)}
                  >
                    <Edit2 size={18} className="text-default-400" />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
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
      {/* Create Product Modal */}
      <CreateProduct
        isOpen={isCreateOpen}
        onOpenChange={onCreateOpenChange}
        onClose={onCreateClose}
        storeId={user?.user?.storeId || ""}
        categories={categories}
      />

      {/* Edit Product Modal */}
      <EditProduct
        isOpen={isEditOpen}
        onOpenChange={onEditOpenChange}
        onClose={onEditClose}
        product={selectedProduct}
        storeId={user?.user?.storeId || ""}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        title="ຢືນຢັນການລຶບ"
        message={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບສິນຄ້າ ${selectedProduct?.name}? ການກະທຳນີ້ບໍ່ສາມາດກັບຄືນໄດ້.`}
        confirmText="ລຶບສິນຄ້າ"
        onConfirm={() => handleDeleteSubmit(onDeleteClose)}
        icon={<Trash2 size={24} />}
        color="danger"
      />

      {/* Pending Status Modal */}
      <ConfirmModal
        isOpen={isPendingOpen}
        onOpenChange={onPendingOpenChange}
        title="ບໍ່ສາມາດເພີ່ມໄດ້"
        message="ທ່ານຍັງບໍ່ໄດ້ຍ້ອມຮັບຈາກເຈົ້າຂອງກະລູນາຕິດຕໍ່ຫາເບີ 2099999999"
        confirmText="ຕົກລົງ"
        onConfirm={onPendingClose}
        color="warning"
      />
    </div>
  );
}
