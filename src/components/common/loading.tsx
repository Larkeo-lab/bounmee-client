import { Spinner } from "@heroui/react";

export default function LoadingGlobal({ label }: { label: string }) {
    return (
        <div className=" absolute inset-1 left-0 top-0 z-30 backdrop-blur-xs flex items-center justify-center h-screen">
            <Spinner size="lg" color="primary" label={label} />
        </div>
    )
}