import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody, Spinner } from "@heroui/react";
import { ArrowLeft, Receipt } from "lucide-react";
import dayjs from "dayjs";

import { OrderDetail } from "../order/OrderDetail";

import { useAuth } from "@/routes/AuthContext";
import { useGetOrder } from "@/services/order/useOrder";
import EmptyState from "@/components/common/empty-state";

export default function DebtHistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: order, isLoading, isError } = useGetOrder(id || "");

  const IS_GENERAL_STORE = user?.user?.store?.type === "GENERAL_STORE";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Spinner size="lg" />
        <p className="text-default-500 font-medium">{t("order.loading")}</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-6">
        <Button
          variant="light"
          startContent={<ArrowLeft size={18} />}
          onPress={() => navigate(-1)}
          className="mb-4"
        >
          {t("common.back")}
        </Button>
        <EmptyState message={t("order.notFound")} />
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-4">
      <div className="flex items-center gap-4 border-b border-divider pb-4">
        <Button
          isIconOnly
          variant="flat"
          radius="full"
          onPress={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-primary flex items-center gap-2">
            <Receipt size={24} />
            {t("debt.detailTitle")}
          </h1>
          <p className="text-xs text-default-500 font-medium">
            {t("order.billNo")} {order.orderNumber} • {dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}
          </p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardBody className="p-0 overflow-visible">
            {/* Reuse OrderDetail but we need to pass props. 
                Since OrderDetail is a Modal, we can either:
                1. Modify OrderDetail to be usable as a component
                2. Use the same layout here.
                
                For now, I'll just show the Modal immediately or copy the logic.
                Actually, OrderDetail is a Modal, so it might look weird if we just render it.
                But wait, I can just render the content of OrderDetail.
            */}
            <div className="max-w-4xl mx-auto w-full">
                {/* We'll use the modal's internal structure but without the modal wrapper if possible.
                    Actually, let's just use the OrderDetail modal for now and navigate back when closed.
                */}
                <OrderDetail 
                    isOpen={true} 
                    onOpenChange={(open) => { if(!open) navigate(-1); }}
                    selectedOrder={order}
                    IS_GENERAL_STORE={IS_GENERAL_STORE}
                />
            </div>
        </CardBody>
      </Card>
    </div>
  );
}
