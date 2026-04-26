import {
  Table,
  TableBody,
  TableHeader,
  TableColumn,
  Spinner,
} from "@heroui/react";

import { CustomTableProps } from "@/types";

const GlobalTableCustom: React.FC<
  CustomTableProps & { isHoverable?: boolean }
> = ({
  children,
  header,
  headerClassName,
  onHeaderClick,
  renderSortIcon,
  isLoading,
  emptyContent,
  isHoverable,
}) => {
  return (
    <Table className="w-full" shadow="none" {...({ isHoverable } as any)}>
      <TableHeader
        className={
          headerClassName || "bg-[#d8e2ff] hover:bg-[#D8E2FF] whitespace-nowrap"
        }
      >
        {header.map((item: string | JSX.Element, index: number) => {
          const headerText = typeof item === "string" ? item : "";
          const isClickable =
            onHeaderClick && headerText !== "จัดการ" && index !== 0;

          return (
            <TableColumn
              key={item as string}
              className={`font-bold text-sm text-[#202224] whitespace-nowrap ${
                index === 0
                  ? "rounded-tl-md min-w-[50px]"
                  : index === header.length - 1
                    ? "rounded-tr-md text-right min-w-[120px]"
                    : "min-w-[100px]"
              } ${
                isClickable
                  ? "cursor-pointer hover:bg-[#c5d4ff] select-none"
                  : ""
              }`}
              onClick={() => isClickable && onHeaderClick(headerText)}
            >
              <div className={`flex items-center justify-center`}>
                {item}
                {isClickable && renderSortIcon && renderSortIcon(headerText)}
              </div>
            </TableColumn>
          );
        })}
      </TableHeader>
      <TableBody
        emptyContent={emptyContent || "ບໍ່ພົບຂໍ້ມູນ"}
        isLoading={isLoading}
        loadingContent={<Spinner label="ກຳລັງໂຫລດ..." />}
      >
        {isLoading
          ? []
          : Array.isArray(children)
            ? (children as any)
            : [children]}
      </TableBody>
    </Table>
  );
};

export default GlobalTableCustom;
