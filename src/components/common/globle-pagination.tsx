import { Pagination } from "@heroui/react";

interface GlobalPaginationProps {
  showing?: number;
  results?: number;
  totalItems: number;
  totalPages: number;
  initialPage?: number;
  page?: number;
  onChange?: (page: number) => void;
}

export default function GlobalPagination({
  showing,
  results,
  totalItems,
  totalPages,
  initialPage = 1,
  page,
  onChange,
}: GlobalPaginationProps) {
  return (
    <div className={"flex flex-col sm:flex-row justify-between items-center p-4 gap-4"}>
      {(showing !== undefined && results !== undefined) && (
        <p className="text-sm text-gray-500 font-medium order-2 sm:order-1">
          ສະແດງ {showing}-{results} ຈາກ {totalItems} ລາຍການ
        </p>
      )}
      {!showing && <div className="hidden sm:block"></div>}
      <div className="order-1 sm:order-2">
        <Pagination
          size="sm"
          radius="lg"
          showControls
          initialPage={initialPage}
          total={totalPages}
          page={page}
          onChange={onChange}
          classNames={{
            cursor: "bg-primary text-white font-bold",
          }}
        />
      </div>
    </div>
  )
}
