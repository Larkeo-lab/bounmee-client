import { Pagination } from "@heroui/react";

interface GlobalPaginationProps {
  showing?: number;
  results?: number;
  initialPage?: number;
  total: number;
  page?: number;
  onChange?: (page: number) => void;
}

export default function GlobalPagination({
  showing,
  results,
  initialPage = 1,
  total,
  page,
  onChange,
}: GlobalPaginationProps) {
  return (
    <div className={"flex justify-between items-center p-4" + (showing && results ? "" : "flex justify-center items-center p-4")}>
      {(showing && results) && <p className="text-sm text-gray-500">ສະແດງ {showing}-{results} ຈາກ {total}</p>}
      <Pagination
        size="sm"
        showControls
        initialPage={initialPage}
        total={total}
        page={page}
        onChange={onChange}
      />
    </div>
  )
}
