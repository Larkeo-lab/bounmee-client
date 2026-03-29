import { PackageSearch } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  message?: string;
  description?: string;
  icon?: ReactNode;
}

export default function EmptyState({
  message = "ບໍ່ພົບຂໍ້ມູນ",
  description = "ລອງຄົ້ນຫາດ້ວຍຄຳສັບອື່ນ ຫຼື ກວດສອບຂໍ້ມູນອີກຄັ້ງ",
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-default-400 gap-4 animate-in fade-in duration-500">
      {icon || <PackageSearch size={64} strokeWidth={1} />}
      <div className="text-center">
        <p className="text-xl font-bold">{message}</p>
        <p className="text-sm">{description}</p>
      </div>
    </div>
  );
}
