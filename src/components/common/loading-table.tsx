import { Spinner } from "@heroui/react";

export default function LoadingTable({ label }: { label: string }) {
    return (
        <div className="flex justify-center items-center min-h-52">
            <Spinner classNames={{ label: "text-foreground mt-4" }} label={label + "..." || 'ກຳລັງໂຫຼດ'} variant="gradient" />
        </div>
    )
}
