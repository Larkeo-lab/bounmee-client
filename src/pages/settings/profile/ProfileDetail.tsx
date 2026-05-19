import { useTranslation } from "react-i18next";
import { Card, CardBody, Button, Image, Spinner, Chip } from "@heroui/react";
import { Store as StoreIcon, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/routes/AuthContext";
import { useGetStoreDetail } from "@/services/store/useStore";
import { getDisplayImageUrl } from "@/lib/utils";
import { getRemainingDays } from "@/utils/getRemainingDays";

export default function ProfileDetail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isNotAdmin = user?.user?.role !== "STORE_ADMIN";
  const { t } = useTranslation();

  const { data: storeResponse, isLoading } = useGetStoreDetail(
    user?.user?.store?.id,
  );
  const store = storeResponse?.data;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("lo-LA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const adminUser = store?.users?.find((u: any) => u.role === "STORE_ADMIN");

  return (
    <div className="m-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <StoreIcon size={28} />
            {t("settings.storeProfile.title")}
          </h1>
          <p className="text-default-500">
            {t("settings.storeProfile.subtitle")}
          </p>
        </div>
        {!isNotAdmin && (
          <Button
            color="primary"
            variant="solid"
            className="font-bold px-6"
            startContent={<Edit size={16} />}
            onPress={() => navigate("/settings/profile/edit")}
          >
            {t("settings.storeProfile.editStore")}
          </Button>
        )}
      </div>

      <Card className="shadow-sm border border-divider">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column: Logo Only */}
            <div className="flex flex-col items-center gap-4 w-full md:w-64 shrink-0">
              <label className="text-sm font-semibold text-default-700 w-full text-center">
                {t("settings.common.image")}
              </label>
              <div className="w-48 h-48 rounded-2xl border border-divider overflow-hidden bg-default-50 flex items-center justify-center shadow-xs">
                {store?.logoUrl ? (
                  <Image
                    alt="Store Logo"
                    className="w-full h-full object-cover"
                    src={getDisplayImageUrl(store.logoUrl)}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-default-300">
                    <StoreIcon size={48} />
                    <span className="text-xs text-default-400">
                      {t("settings.storeProfile.noLogo")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Store Details & Package Info (Contiguous List) */}
            <div className="flex-1 space-y-6">
              <h3 className="text-lg font-bold text-default-800">
                {t("settings.storeProfile.storeInfo")}
              </h3>
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center py-1.5 border-b border-divider/40 gap-1 sm:gap-4">
                  <span className="w-36 text-sm text-default-400 font-semibold shrink-0">
                    {t("auth.storeName")}:
                  </span>
                  <span className="text-sm font-bold text-default-800">
                    {store?.name || "-"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center py-1.5 border-b border-divider/40 gap-1 sm:gap-4">
                  <span className="w-36 text-sm text-default-400 font-semibold shrink-0">
                    {t("auth.phone")}:
                  </span>
                  <span className="text-sm text-default-800">
                    {adminUser?.phone || "-"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center py-1.5 border-b border-divider/40 gap-1 sm:gap-4">
                  <span className="w-36 text-sm text-default-400 font-semibold shrink-0">
                    {t("auth.email")}:
                  </span>
                  <span className="text-sm text-default-800">
                    {adminUser?.email || "-"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center py-1.5 border-b border-divider/40 gap-1 sm:gap-4">
                  <span className="w-36 text-sm text-default-400 font-semibold shrink-0">
                    {t("auth.province")}:
                  </span>
                  <span className="text-sm text-default-800">
                    {store?.province?.nameLo || store?.province?.nameEn || "-"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center py-1.5 border-b border-divider/40 gap-1 sm:gap-4">
                  <span className="w-36 text-sm text-default-400 font-semibold shrink-0">
                    {t("auth.district")}:
                  </span>
                  <span className="text-sm text-default-800">
                    {store?.district?.nameLo || store?.district?.nameEn || "-"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start py-1.5 border-b border-divider/40 gap-1 sm:gap-4">
                  <span className="w-36 text-sm text-default-400 font-semibold shrink-0 pt-0.5">
                    {t("auth.address")}:
                  </span>
                  <span className="text-sm text-default-800 whitespace-pre-line leading-relaxed">
                    {store?.address || "-"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center py-1.5 border-b border-divider/40 gap-1 sm:gap-4">
                  <span className="w-36 text-sm text-default-400 font-semibold shrink-0">
                    {t("settings.storeProfile.startDate")}:
                  </span>
                  <span className="text-sm font-bold text-default-800">
                    {formatDate(store?.startDate)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center py-1.5 border-b border-divider/40 gap-1 sm:gap-4">
                  <span className="w-36 text-sm text-default-400 font-semibold shrink-0">
                    {t("settings.storeProfile.endDate")}:
                  </span>
                  <span className="text-sm font-bold text-danger">
                    {formatDate(store?.endDate)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center py-1.5 border-b border-divider/40 gap-1 sm:gap-4">
                  <span className="w-36 text-sm text-default-400 font-semibold shrink-0">
                    {t("settings.storeProfile.remainingDays")}:
                  </span>
                  <span className="text-sm font-extrabold text-primary">
                    {store?.endDate
                      ? `${getRemainingDays(store.endDate)} ${t("settings.storeProfile.days")}`
                      : "-"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center py-1.5 gap-1 sm:gap-4">
                  <span className="w-36 text-sm text-default-400 font-semibold shrink-0">
                    {t("settings.storeProfile.packageType")}:
                  </span>
                  {store?.bussinessType ? (
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        store.bussinessType === "TRY"
                          ? "warning"
                          : store.bussinessType === "YEARLY"
                            ? "success"
                            : "primary"
                      }
                      className="font-bold"
                    >
                      {t(`settings.storeProfile.package${store.bussinessType}`)}
                    </Chip>
                  ) : (
                    <span className="text-sm text-default-800">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
