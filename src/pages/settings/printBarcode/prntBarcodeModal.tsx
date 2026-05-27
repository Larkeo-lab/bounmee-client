import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  RadioGroup,
  Radio,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
} from "@heroui/react";
import { Printer } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Barcode from "react-barcode";

import { Product } from "@/services/product/useProduct";
import { formatNumber } from "@/utils/numberFormat";

interface PrintBarcodeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  selectedProducts: Product[];
}

const PrintBarcodeModal = ({
  isOpen,
  onOpenChange,
  onClose,
  selectedProducts,
}: PrintBarcodeModalProps) => {
  const { t } = useTranslation();
  const [barcodeSize, setBarcodeSize] = useState("1");
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    selectedProducts.forEach((p) => {
      initial[p.id] = 1;
    });
    return initial;
  });

  const handleQuantityChange = (productId: string, value: string) => {
    const num = parseInt(value) || 1;
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(1, num) }));
  };

  const handlePrint = () => {
    const printData = selectedProducts.map((p) => ({
      ...p,
      quantity: quantities[p.id] || 1,
    }));
    console.log("Print barcodes:", { barcodeSize, products: printData });
    // TODO: implement actual barcode printing
  };

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="3xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-primary">
            {t("printBarcode.title")}
          </h2>
        </ModalHeader>
        <ModalBody>
          {/* Barcode Size Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-default-700">
              {t("printBarcode.selectSize")}
            </h3>
            <RadioGroup
              orientation="horizontal"
              value={barcodeSize}
              onValueChange={setBarcodeSize}
            >
              <Radio value="1">{t("printBarcode.size1")}</Radio>
              <Radio value="2">{t("printBarcode.size2")}</Radio>
              <Radio value="3">{t("printBarcode.size3")}</Radio>
            </RadioGroup>
          </div>

          {/* Selected Products Table */}
          <div className="space-y-3 mt-4">
            <h3 className="font-semibold text-default-700">
              {t("printBarcode.selectedProducts")}
            </h3>
            <Table
              aria-label="Selected products for barcode"
              classNames={{
                wrapper:
                  "shadow-sm border border-divider rounded-xl overflow-hidden",
                th: "bg-default-50 text-default-600 font-bold h-12",
              }}
            >
              <TableHeader>
                <TableColumn key="no" className="h-12 text-small w-12">
                  #
                </TableColumn>
                <TableColumn key="name" className="h-12 text-small">
                  {t("settings.common.nameLabel")}
                </TableColumn>
                <TableColumn key="barcode" className="h-12 text-small">
                  {t("printBarcode.barcodeCode")}
                </TableColumn>
                <TableColumn key="category" className="h-12 text-small">
                  {t("product.category")}
                </TableColumn>
                <TableColumn key="qty" className="h-12 text-small w-28">
                  {t("printBarcode.quantity")}
                </TableColumn>
              </TableHeader>
              <TableBody>
                {selectedProducts.map((item, index) => (
                  <TableRow key={item.id} className="h-14">
                    <TableCell>
                      <p className="text-small text-default-400">{index + 1}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-small font-medium capitalize">
                        {item.name}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-small text-default-500">
                        {item.barcode}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-small text-default-500">
                        {item.category?.name || "-"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Input
                        className="w-20"
                        min={1}
                        size="sm"
                        type="number"
                        value={String(quantities[item.id] || 1)}
                        variant="bordered"
                        onValueChange={(val) =>
                          handleQuantityChange(item.id, val)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Barcode Preview */}
          <div className="space-y-3 mt-4">
            <h3 className="font-semibold text-default-700">
              {t("printBarcode.preview")}
            </h3>
            <div className="border border-divider rounded-xl p-6 bg-default-50 min-h-[150px]">
              <div
                className={`grid gap-4 w-full ${
                  barcodeSize === "1"
                    ? "grid-cols-1 max-w-xs mx-auto"
                    : barcodeSize === "2"
                      ? "grid-cols-2 max-w-lg mx-auto"
                      : "grid-cols-3"
                }`}
              >
                {selectedProducts.flatMap((item) =>
                  Array.from({ length: quantities[item.id] || 1 }, (_, i) => (
                    <div
                      key={`${item.id}-${i}`}
                      className="border border-default-200 rounded-lg p-3 flex flex-col items-center gap-1 bg-white shadow-sm"
                    >
                      <p className="text-xs font-semibold text-center truncate w-full">
                        {item.name}
                      </p>
                      <Barcode
                        value={item.barcode || "0000000000"}
                        format="CODE128"
                        width={1.2}
                        height={40}
                        fontSize={12}
                        margin={4}
                        displayValue={true}
                      />
                      <p className="text-xs font-bold text-primary">
                        {formatNumber(item.price)} LAK
                      </p>
                    </div>
                  )),
                )}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            {t("settings.common.cancel")}
          </Button>
          <Button
            color="primary"
            startContent={<Printer size={18} />}
            onPress={handlePrint}
          >
            {t("printBarcode.print")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PrintBarcodeModal;
