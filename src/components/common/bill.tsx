import { useState, useRef, useMemo } from "react";
import {
  Modal,
  ModalContent,
  Card,
  CardBody,
  Chip,
  Button,
} from "@heroui/react";
import { CheckCircle2, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import { formatNumber } from "@/utils/numberFormat";
import { getDisplayImageUrl } from "@/lib/utils";

interface BillModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tableData: any;
  finalOrder: any;
  paymentMethod: string | null;
  bankName: string | null;
  placedOrders: any[];
}

export default function BillModal({
  isOpen,
  onOpenChange,
  tableData,
  finalOrder,
  paymentMethod,
  bankName,
  placedOrders,
}: BillModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const billRef = useRef<HTMLDivElement>(null);

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "CASH":
        return "success";
      case "TRANSFER":
        return "primary";
      default:
        return "default";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "CASH":
        return "ເງິນສົດ";
      case "TRANSFER":
        return "ເງິນໂອນ";
      default:
        return method;
    }
  };

  const handleDownloadBill = async () => {
    if (!billRef.current) {
      toast.error("ບິນບໍ່ພົບໃນໜ້າຈໍ");
      return;
    }

    setIsDownloading(true);
    try {
      const h2cModule = await import("html2canvas");
      const html2canvas = h2cModule.default || h2cModule;

      const element = billRef.current;

      await new Promise((resolve) => setTimeout(resolve, 400));

      const canvas = await (html2canvas as any)(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc: Document) => {
          // 1. Remove ALL existing style and link tags to prevent html2canvas parsing errors
          const heads = clonedDoc.getElementsByTagName("head");
          if (heads.length > 0) {
            const head = heads[0];
            const links = Array.from(head.getElementsByTagName("link"));
            links.forEach((l) => head.removeChild(l));
            const styles = Array.from(head.getElementsByTagName("style"));
            styles.forEach((s) => head.removeChild(s));
          }

          // 2. Clear inline styles that might contain oklch/oklab
          const allElements = clonedDoc.getElementsByTagName("*");
          const colorRegex =
            /(oklch|oklab)\((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))*\)/g;
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            if (el.getAttribute && el.getAttribute("style")) {
              const style = el.getAttribute("style") || "";
              if (style.includes("oklch") || style.includes("oklab")) {
                el.setAttribute("style", style.replace(colorRegex, "#000000"));
              }
            }
          }

          // 3. Inject a comprehensive, self-contained CSS for the bill
          const styleOverride = clonedDoc.createElement("style");
          styleOverride.id = "capture-override";
          styleOverride.innerHTML = `
            * {
              -webkit-animation: none !important;
              animation: none !important;
              transition: none !important;
              box-sizing: border-box !important;
              font-family: sans-serif !important;
            }
            body { background: transparent !important; margin: 0; padding: 0; }
            .bg-white { background-color: #ffffff !important; }
            .text-primary { color: #0070f3 !important; }
            .bg-primary { background-color: #0070f3 !important; }
            .text-success { color: #17c964 !important; }
            .bg-success { background-color: #17c964 !important; }
            .bg-success\\/20 { background-color: #e8faf0 !important; }
            .bg-primary\\/5 { background-color: #f0f7ff !important; }
            .bg-primary\\/10 { background-color: #e6f1fe !important; }
            .bg-danger\\/10 { background-color: #fee7ef !important; }
            .text-default-400 { color: #a1a1aa !important; }
            .text-default-500 { color: #71717a !important; }
            .text-default-600 { color: #52525b !important; }
            .text-default-800 { color: #27272a !important; }
            .text-default-900 { color: #18181b !important; }
            .bg-default-100 { background-color: #f4f4f5 !important; }
            .bg-gray-50\\/80 { background-color: #f9fafb !important; }
            .border-divider { border-color: #e4e4e7 !important; border-style: solid !important; }
            .border-primary\\/10 { border-color: #0070f31a !important; border-style: solid !important; }
            .border-primary\\/20 { border-color: #0070f333 !important; border-style: solid !important; }
            .border-divider\\/5 { border-color: rgba(228, 228, 231, 0.05) !important; border-style: solid !important; }
            
            .grid { display: grid !important; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)) !important; }
            .col-span-1 { grid-column: span 1 / span 1 !important; }
            .col-span-2 { grid-column: span 2 / span 2 !important; }
            .col-span-3 { grid-column: span 3 / span 3 !important; }
            .col-span-5 { grid-column: span 5 / span 5 !important; }
            .flex { display: flex !important; }
            .flex-col { flex-direction: column !important; }
            .items-center { align-items: center !important; }
            .items-start { align-items: flex-start !important; }
            .justify-between { justify-content: space-between !important; }
            .text-right { text-align: right !important; }
            .text-center { text-align: center !important; }
            .text-left { text-align: left !important; }
            .p-0 { padding: 0 !important; }
            .p-3 { padding: 12px !important; }
            .p-4 { padding: 16px !important; }
            .p-5 { padding: 20px !important; }
            .p-6 { padding: 24px !important; }
            .pt-1 { padding-top: 4px !important; }
            .pt-2 { padding-top: 8px !important; }
            .pt-4 { padding-top: 16px !important; }
            .pb-2 { padding-bottom: 8px !important; }
            .pr-1 { padding-right: 4px !important; }
            .mt-2 { margin-top: 8px !important; }
            .mb-2 { margin-bottom: 8px !important; }
            .mb-4 { margin-bottom: 16px !important; }
            .mb-3 { margin-bottom: 12px !important; }
            .mb-6 { margin-bottom: 24px !important; }
            .space-y-1 > * + * { margin-top: 4px !important; }
            .space-y-2 > * + * { margin-top: 8px !important; }
            .space-y-3 > * + * { margin-top: 12px !important; }
            .space-y-4 > * + * { margin-top: 16px !important; }
            .gap-1 { gap: 4px !important; }
            .gap-2 { gap: 8px !important; }
            .gap-4 { gap: 16px !important; }
            .w-full { width: 100% !important; }
            .max-w-sm { max-width: 384px !important; }
            .h-16 { height: 64px !important; }
            .w-16 { width: 64px !important; }
            .rounded-2xl { border-radius: 16px !important; }
            .rounded-3xl { border-radius: 24px !important; }
            .rounded-full { border-radius: 9999px !important; }
            .border-b { border-bottom-width: 1px !important; }
            .border-t { border-top-width: 1px !important; }
            .border-t-2 { border-top-width: 2px !important; }
            .border-dashed { border-style: dashed !important; }
            .italic { font-style: italic !important; }
            .uppercase { text-transform: uppercase !important; }
            .font-black { font-weight: 900 !important; }
            .font-bold { font-weight: 700 !important; }
            .font-medium { font-weight: 500 !important; }
            .text-xs { font-size: 11px !important; }
            .text-sm { font-size: 14px !important; }
            .text-lg { font-size: 18px !important; }
            .text-xl { font-size: 20px !important; }
            .text-2xl { font-size: 24px !important; }
            .tracking-wider { letter-spacing: 0.05em !important; }
            .tracking-tighter { letter-spacing: -0.05em !important; }
            .object-cover { object-fit: cover !important; }
            .aspect-\\[4\\/3\\] { aspect-ratio: 4/3 !important; }
            .overflow-hidden { overflow: hidden !important; }
            .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important; }
          `;
          clonedDoc.head.appendChild(styleOverride);

          // 4. Hide problematic elements
          const elementsToHide = clonedDoc.querySelectorAll(
            ".animate-pulse, .animate-bounce, button",
          );
          elementsToHide.forEach((el: any) => (el.style.display = "none"));
        },
      });

      const dataUrl = canvas.toDataURL("image/png");

      // Mobile integration: Try Web Share API first
      if (
        navigator.share &&
        navigator.canShare &&
        typeof File !== "undefined"
      ) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `Bill-${Date.now()}.png`, {
            type: "image/png",
          });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "Bill Receipt",
            });
            toast.success("ກຳລັງເປີດການແຊຣ໌ບິນ...");
            return;
          }
        } catch (shareError) {
          console.warn("Share failed, using simple download", shareError);
        }
      }

      // Fallback: Standard browser download
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Bill-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("ດາວໂຫຼດບິນສຳເລັດ!");
    } catch (error: any) {
      console.error("Critical download failure:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`ຂໍ້ຜິດພາດ: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const totalAmount = useMemo(() => {
    return (
      finalOrder?.totalAmount ||
      placedOrders.reduce(
        (acc, item) =>
          item.status?.toUpperCase() === "CANCEL"
            ? acc
            : acc + Number(item.price) * Number(item.quantity),
        0,
      )
    );
  }, [finalOrder, placedOrders]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      hideCloseButton
      backdrop="blur"
      size="md"
      placement="top"
      className="mx-4 rounded-3xl"
      scrollBehavior="outside"
    >
      <ModalContent className="bg-transparent shadow-none border-none">
        <div className="py-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center text-success animate-bounce shadow-lg mb-4 backdrop-blur-md">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-1 mb-6">
            <h1 className="text-2xl font-black text-white uppercase drop-shadow-md">
              ຂອບໃຈຫຼາຍໆ!
            </h1>
            <p className="text-white/80 font-medium text-sm drop-shadow-sm">
              ການຊຳລະເງິນສຳເລັດແລ້ວ.
            </p>
          </div>

          <div ref={billRef} className="w-full max-w-sm">
            <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.2)] bg-white w-full overflow-hidden rounded-3xl">
              <CardBody className="p-0">
                <div className="p-6 border-b border-divider flex flex-col items-center gap-1 bg-gray-50/80">
                  {tableData?.store?.logoUrl ? (
                    <img
                      src={getDisplayImageUrl(tableData.store.logoUrl)}
                      className="w-16 h-16 rounded-2xl object-cover shadow-sm mb-2"
                      style={{ width: "64px", height: "64px" }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                      <CheckCircle2 size={32} />
                    </div>
                  )}
                  <h2 className="text-xl font-black text-primary uppercase">
                    {tableData?.store?.name}
                  </h2>
                  <p className="text-xs text-default-500 font-bold font-sans">
                    #{finalOrder?.orderNumber || `BILL-${tableData?.name}`}
                  </p>
                  <div className="mt-2 text-[10px] text-default-400 font-medium flex gap-2">
                    <span>📍 {tableData?.store?.address || "Address"}</span>
                    <span>📞 {tableData?.store?.tel || "-"}</span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="space-y-1">
                      <p className="text-[10px] text-default-400 font-bold uppercase tracking-wider">
                        ວັນທີ/ເວລາ
                      </p>
                      <p className="text-xs font-bold font-sans">
                        {finalOrder?.createdAt
                          ? new Date(finalOrder.createdAt).toLocaleString(
                              "lo-LA",
                            )
                          : new Date().toLocaleString("lo-LA")}
                      </p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] text-default-400 font-bold uppercase tracking-wider">
                        ພະນັກງານ
                      </p>
                      <p className="text-xs font-bold text-primary">
                        {finalOrder?.employee?.name || "ເຈົ້າຂອງຮ້ານ"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-default-100 rounded-2xl border border-divider">
                    <span className="text-xs font-bold text-default-600">
                      ຮູບແບບการชຳລະ:
                    </span>
                    <Chip
                      size="sm"
                      color={getPaymentMethodColor(
                        finalOrder?.paymentMethod || paymentMethod || "",
                      )}
                      variant="flat"
                      className="font-black text-[10px] uppercase"
                    >
                      {getPaymentMethodLabel(
                        finalOrder?.paymentMethod || paymentMethod || "",
                      )}
                      {finalOrder?.bank?.name
                        ? ` (${finalOrder.bank.name})`
                        : bankName
                          ? ` (${bankName})`
                          : ""}
                    </Chip>
                  </div>

                  <div className="border-t border-dashed border-divider pt-4 space-y-4">
                    <div className="grid grid-cols-12 gap-1 text-[10px] font-black text-default-400 uppercase tracking-tighter text-left border-b border-divider pb-2">
                      <div className="col-span-1">#</div>
                      <div className="col-span-5">ລາຍການ</div>
                      <div className="col-span-1 text-center">ຈຳນວນ</div>
                      <div className="col-span-2 text-right">ລາຄา</div>
                      <div className="col-span-3 text-right">ລວມ</div>
                    </div>

                    <div className="space-y-3 pr-1">
                      {(finalOrder?.items || placedOrders)
                        .filter(
                          (i: any) => i.status?.toUpperCase() !== "CANCEL",
                        )
                        .map((item: any, idx: number) => {
                          const productName = item.product?.name || item.name;
                          const qty = item.qty || item.quantity;
                          const price = item.unitPrice || item.price;
                          return (
                            <div
                              key={idx}
                              className="grid grid-cols-12 gap-1 text-[11px] font-bold border-b border-divider/5 pb-2 items-start text-left"
                            >
                              <div className="col-span-1 text-default-400 font-medium">
                                {idx + 1}
                              </div>
                              <div className="col-span-5 text-default-800 line-clamp-2 leading-tight">
                                {productName}
                              </div>
                              <div className="col-span-1 text-center text-primary font-black">
                                {qty}
                              </div>
                              <div className="col-span-2 text-right text-default-500">
                                {formatNumber(price)}
                              </div>
                              <div className="col-span-3 text-right text-default-900 font-black">
                                {formatNumber(price * qty)}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div className="pt-4 mt-2">
                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-2">
                      <div className="flex justify-between items-center text-xs text-default-500 font-bold">
                        <span>ຍອດລວມ (Total):</span>
                        <span className="font-sans">
                          {formatNumber(totalAmount)} ₭
                        </span>
                      </div>
                      {finalOrder && (
                        <>
                          <div className="flex justify-between items-center text-xs text-default-500 font-bold">
                            <span>ຮັບເງິນ (Received):</span>
                            <span className="font-sans">
                              {formatNumber(finalOrder.receivedAmount)} ₭
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-black text-primary border-t border-dashed border-primary/20 pt-2">
                            <span>ເງິນທອນ (Change):</span>
                            <span className="text-lg font-sans">
                              {formatNumber(finalOrder.change)} ₭
                            </span>
                          </div>
                        </>
                      )}
                      {!finalOrder && (
                        <div className="flex justify-between items-center text-sm font-black text-primary border-t border-dashed border-primary/20 pt-2">
                          <span>ຍອດລວມທັງໝົດ:</span>
                          <span className="text-xl font-sans">
                            {formatNumber(totalAmount)} ₭
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-primary/5 text-primary font-black text-center text-sm border-t border-dashed border-divider italic">
                  <p>Dee POS</p>⭐ ຂໍຂອບໃຈທີ່ໃຊ້ບໍລິການ! ກະລຸນາກັບມາໃໝ່ເດີ້ ⭐
                </div>
              </CardBody>
            </Card>
          </div>

          <Button
            color="primary"
            variant="shadow"
            size="lg"
            className="mt-8 w-full max-w-sm rounded-2xl font-black h-14 text-lg animate-pulse"
            startContent={!isDownloading && <Download size={24} />}
            onClick={handleDownloadBill}
            isLoading={isDownloading}
          >
            ດາວໂຫຼດບິນ (DOWNLOAD BILL)
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
