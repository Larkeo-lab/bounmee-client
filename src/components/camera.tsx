import { Modal, ModalContent, Button } from "@heroui/react";
import { X, RefreshCw, Check, Scan } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Html5Qrcode } from "html5-qrcode";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture?: (file: File) => void;
  onScan?: (data: string) => void;
  cameraType?: "IMAGE" | "BARCODE";
}

export default function CameraModal({
  isOpen,
  onClose,
  onCapture,
  onScan,
  cameraType = "IMAGE",
}: CameraModalProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  console.log("cameraType", cameraType);

  const startCamera = async (facingMode: "user" | "environment") => {
    if (cameraType === "BARCODE") {
      startScanner(facingMode);
      return;
    }

    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const constraints = {
        video: { facingMode },
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const startScanner = async (facingMode: "user" | "environment") => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("reader");
    }
    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      setIsScanning(true);
      await scannerRef.current.start(
        { facingMode },
        {
          fps: 10,
          qrbox: { width: 256, height: 256 },
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          if (onScan) {
            onScan(decodedText);
            handleClose();
          }
        },
        () => {}, // ignore errors
      );
    } catch (err) {
      console.error("Scanner start error:", err);
      setIsScanning(false);
    }
  };

  const handleClose = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setCapturedImage(null);
    setIsScanning(false);
    onClose();
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
      }
    }
  };

  const saveCapturedPhoto = async () => {
    if (capturedImage) {
      try {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const file = new File([blob], `captured-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        if (onCapture) {
          onCapture(file);
        }
        handleClose();
      } catch (error) {
        console.error("Error saving captured photo:", error);
      }
    }
  };

  const switchCamera = () => {
    const newFacingMode = !isFrontCamera;
    setIsFrontCamera(newFacingMode);
    startCamera(newFacingMode ? "user" : "environment");
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(isFrontCamera ? "user" : "environment");
    } else {
      handleClose();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && videoRef.current && stream && cameraType === "IMAGE") {
      videoRef.current.srcObject = stream;
    }
  }, [isOpen, stream, cameraType]);

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <>
      <Modal
        isOpen={isOpen}
        size="xl"
        onOpenChange={(open) => !open && handleClose()}
        classNames={{
          backdrop: "bg-black/80 backdrop-blur-sm",
          base: "bg-transparent shadow-none",
          header: "hidden",
          footer: "hidden",
        }}
      >
        <ModalContent>
          <div className="relative flex flex-col items-center gap-4">
            <div className="relative w-full max-w-lg aspect-[3/4] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
              {cameraType === "IMAGE" ? (
                capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`w-full h-full object-cover ${isFrontCamera ? "scale-x-[-1]" : ""}`}
                  />
                )
              ) : (
                <div id="reader" className="w-full h-full" />
              )}

              {/* Scan Overlay for Barcode Mode */}
              {cameraType === "BARCODE" && !capturedImage && isScanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="w-64 h-64 border-2 border-primary/50 rounded-2xl relative overflow-hidden bg-primary/5">
                    {/* Corner Brackets */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />

                    {/* Animated Scan Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-b from-primary/80 to-transparent shadow-[0_0_15px_rgba(var(--heroui-primary-rgb),0.8)] animate-scan" />
                  </div>
                  <div className="absolute bottom-10 text-white text-sm font-bold bg-black/60 px-6 py-3 rounded-full backdrop-blur-md border border-white/20 shadow-xl">
                    {t("product.alignBarcode")}
                  </div>
                </div>
              )}

              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button
                  isIconOnly
                  className="bg-black/40 backdrop-blur-md text-white hover:bg-black/60 border border-white/10"
                  radius="full"
                  onClick={handleClose}
                >
                  <X size={20} />
                </Button>
                {!capturedImage && (
                  <Button
                    isIconOnly
                    className="bg-black/40 backdrop-blur-md text-white hover:bg-black/60 border border-white/10"
                    radius="full"
                    onClick={switchCamera}
                  >
                    <RefreshCw size={20} />
                  </Button>
                )}
              </div>
            </div>

            {cameraType === "IMAGE" && (
              <div className="flex items-center gap-8 p-6 bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
                {capturedImage ? (
                  <>
                    <Button
                      className="bg-white/10 text-white hover:bg-white/20 border border-white/10 px-8"
                      radius="full"
                      startContent={<RefreshCw size={20} />}
                      onClick={() => setCapturedImage(null)}
                    >
                      {t("common.retake")}
                    </Button>
                    <Button
                      className="bg-primary text-white hover:bg-primary/90 px-10 font-bold shadow-lg shadow-primary/20"
                      radius="full"
                      startContent={<Check size={20} />}
                      onClick={saveCapturedPhoto}
                    >
                      {t("common.save")}
                    </Button>
                  </>
                ) : (
                  <Button
                    isIconOnly
                    className="w-20 h-20 bg-white hover:bg-gray-100 shadow-2xl transition-transform active:scale-90"
                    radius="full"
                    onClick={capturePhoto}
                  >
                    <div className="w-16 h-16 rounded-full border-4 border-black/10 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/5" />
                    </div>
                  </Button>
                )}
              </div>
            )}

            {cameraType === "BARCODE" && (
              <div className="flex items-center gap-3 p-4 bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
                <Scan className="text-primary animate-pulse" size={24} />
                <span className="text-white font-medium">
                  {t("product.scanning") || "Scanning..."}
                </span>
              </div>
            )}
          </div>
        </ModalContent>
      </Modal>
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}
