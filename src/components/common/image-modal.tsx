import { Modal, ModalContent, ModalBody, useDisclosure } from "@heroui/react";
import { Image as HeroImage } from "@heroui/react";
import { X } from "lucide-react";

interface ImageModalProps {
    src: string;
    alt?: string;
    trigger?: React.ReactNode;
    className?: string;
    imageClassName?: string;
}

export default function ImageModal({
    src,
    alt = "Image",
    trigger,
    className,
    imageClassName,
}: ImageModalProps) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <>
            <div onClick={onOpen} className={`cursor-pointer ${className || ""}`}>
                {trigger || (
                    <HeroImage
                        src={src}
                        alt={alt}
                        className={`object-contain ${imageClassName || "w-full h-full max-h-[300px]"}`}
                        radius="lg"
                    />
                )}
            </div>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="4xl"
                placement="center"
                backdrop="blur"
                classNames={{
                    base: "bg-transparent shadow-none",
                    closeButton: "hidden",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <ModalBody className="p-0 relative flex items-center justify-center min-h-[50vh]">
                            <button
                                onClick={onClose}
                                className="absolute -top-12 right-0 lg:-right-12 z-50 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md transition-colors"
                                aria-label="Close"
                            >
                                <X size={24} />
                            </button>
                            <img
                                src={src}
                                alt={alt}
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            />
                        </ModalBody>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
