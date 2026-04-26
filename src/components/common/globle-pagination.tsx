import { Pagination } from "@heroui/react";

import { cn } from "@/lib/utils";

interface GlobalPaginationProps {
  showing?: number;
  results?: number;
  totalItems: number;
  totalPages: number;
  initialPage?: number;
  page?: number;
  onChange?: (page: number) => void;
  compact?: boolean;
}

export default function GlobalPagination({
  showing,
  results,
  totalItems,
  totalPages,
  initialPage = 1,
  page,
  onChange,
  compact = false,
}: GlobalPaginationProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row justify-between items-center gap-4",
        compact ? "p-0" : "p-4",
      )}
    >
      {!compact && showing !== undefined && results !== undefined && (
        <p className="text-sm text-gray-500 font-medium order-2 sm:order-1">
          ສະແດງ {showing}-{results} ຈາກ {totalItems} ລາຍການ
        </p>
      )}
      {!showing && !compact && <div className="hidden sm:block" />}
      <div
        className={cn(
          "order-1 sm:order-2",
          compact && "w-full flex justify-center",
        )}
      >
        <Pagination
          showControls
          classNames={{
            cursor: "bg-primary text-white font-bold",
          }}
          initialPage={initialPage}
          page={page}
          radius="lg"
          size="sm"
          total={totalPages}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
