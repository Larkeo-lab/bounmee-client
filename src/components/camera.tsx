import { Modal, ModalContent, Button } from "@heroui/react";
import { X, RefreshCw, Check, Scan, Camera, ShieldCheck } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Html5Qrcode } from "html5-qrcode";

// Polyfill for older browsers that don't have navigator.mediaDevices
function ensureMediaDevices() {
  if (navigator.mediaDevices === undefined) {
    (navigator as any).mediaDevices = {};
  }
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = (
      constraints: MediaStreamConstraints,
    ) => {
      const getUserMedia =
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia ||
        (navigator as any).msGetUserMedia;
      if (!getUserMedia) {
        return Promise.reject(
          new Error("getUserMedia is not supported in this browser."),
        );
      }
      return new Promise<MediaStream>((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }
}

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture?: (file: File) => void;
  onScan?: (data: string) => void;
  cameraType?: "IMAGE" | "BARCODE";
}
//
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
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [permissionStatus, setPermissionStatus] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");

  // Check if permission was already granted (skip permission screen)
  const checkExistingPermission = async () => {
    ensureMediaDevices();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionStatus("idle");
      return;
    }

    if (navigator.permissions) {
      try {
        const result = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });
        if (result.state === "granted") {
          // Already granted — skip permission screen, open camera directly
          setPermissionStatus("granted");
          return;
        }
      } catch {
        // Permissions API not supported for camera in some browsers
      }
    }

    // Not granted yet — show permission screen
    setPermissionStatus("idle");
  };

  const requestCameraPermission = async () => {
    setPermissionStatus("requesting");
    setHasError(false);
    setErrorMessage("");

    // Apply polyfill for older browsers
    ensureMediaDevices();

    // After polyfill — still not available means not in a secure context
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const isSecure =
        window.isSecureContext ||
        location.protocol === "https:" ||
        location.hostname === "localhost";
      setPermissionStatus("denied");
      setHasError(true);
      setErrorMessage(
        !isSecure
          ? t("camera.requireHttps") ||
              "ກ້ອງຕ້ອງໃຊ້ HTTPS ຫຼື localhost ເທົ່ານັ້ນ. ກະລຸນາເຂົ້າຜ່ານ https:// ຫຼື localhost."
          : t("camera.unsupported") ||
              "ບຣາວເຊີນີ້ບໍ່ຮອງຮັບກ້ອງ. ກະລຸນາໃຊ້ Chrome ຫຼື Safari.",
      );
      return;
    }

    // Directly call getUserMedia to trigger the browser/OS permission prompt
    try {
      const testStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      // Permission granted — stop test stream immediately
      testStream.getTracks().forEach((track) => track.stop());
      setPermissionStatus("granted");
    } catch (error: any) {
      console.error("Permission request failed:", error);
      setPermissionStatus("denied");
      setHasError(true);
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        setErrorMessage(
          t("camera.permissionDenied") ||
            "Camera permission has been denied. Please allow camera access in your browser/device settings and try again.",
        );
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        setErrorMessage(
          t("camera.notFound") || "No camera device found on this device.",
        );
      } else if (error.name === "NotReadableError") {
        setErrorMessage(
          t("camera.inUse") ||
            "Camera is already in use by another application.",
        );
      } else if (error.name === "OverconstrainedError") {
        setErrorMessage(
          t("camera.overconstrained") ||
            "No suitable camera found for the requested settings.",
        );
      } else {
        setErrorMessage(
          error.message ||
            t("camera.errorDesc") ||
            "Could not access camera. Please check your settings.",
        );
      }
    }
  };

  const startCamera = async (facingMode: "user" | "environment") => {
    setHasError(false);
    setErrorMessage("");

    if (cameraType === "BARCODE") {
      // Wait for #reader to appear in the DOM then start scanner
      waitForReaderAndStart(facingMode);
      return;
    }

    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 3840 },
          height: { ideal: 2160 },
          advanced: [
            { focusMode: "continuous" } as any,
            { exposureMode: "continuous" } as any,
            { whiteBalanceMode: "continuous" } as any,
          ],
        },
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Apply real-time focus/exposure settings if supported
      const videoTrack = newStream.getVideoTracks()[0];
      if (videoTrack) {
        try {
          const capabilities = videoTrack.getCapabilities?.() as any;
          const advancedSettings: any = {};
          if (capabilities?.focusMode?.includes("continuous")) {
            advancedSettings.focusMode = "continuous";
          }
          if (capabilities?.exposureMode?.includes("continuous")) {
            advancedSettings.exposureMode = "continuous";
          }
          if (capabilities?.whiteBalanceMode?.includes("continuous")) {
            advancedSettings.whiteBalanceMode = "continuous";
          }
          if (Object.keys(advancedSettings).length > 0) {
            await (videoTrack as any).applyConstraints({
              advanced: [advancedSettings],
            });
          }
        } catch {
          // Device doesn't support advanced settings — ignore
        }
      }

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      setHasError(true);
      if (error.name === "NotAllowedError") {
        setErrorMessage(
          t("camera.permissionDenied") ||
            "Camera permission has been denied. Please allow camera access in your browser settings.",
        );
      } else if (error.name === "NotFoundError") {
        setErrorMessage(
          t("camera.notFound") || "No camera device found on this device.",
        );
      } else {
        setErrorMessage(
          error.message || t("camera.errorDesc") || "Could not access camera",
        );
      }
    }
  };

  // Wait until #reader element is in the DOM with real dimensions
  const waitForReaderAndStart = (
    facingMode: "user" | "environment",
    retries = 10,
  ) => {
    const check = () => {
      const el = document.getElementById("reader");
      if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
        startScanner(facingMode);
      } else if (retries > 0) {
        setTimeout(() => waitForReaderAndStart(facingMode, retries - 1), 300);
      } else {
        setHasError(true);
        setErrorMessage(
          t("camera.scannerNotFound") || "Scanner element not found",
        );
      }
    };
    setTimeout(check, 300);
  };

  const playScanSound = () => {
    try {
      const audio = new Audio("/assets/void/scan_barcode.mp3");
      audio.volume = 0.7;
      audio.play().catch(() => {
        // Autoplay blocked — ignore silently
      });
    } catch {
      // Audio not supported — ignore
    }
  };


  const startScanner = async (facingMode: "user" | "environment") => {
    // Improved iOS/Safari detection (including modern iPads)
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    // Stop any existing scanners before starting a new one

    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch {
        // ignore cleanup errors
      }
      scannerRef.current = null;
    }

    // Use Html5Qrcode for both iOS and Android (more robust than Quagga for modern Safari)
    // We disable BarcodeDetector on iOS as it is often the cause of scanning issues in Safari
    scannerRef.current = new Html5Qrcode("reader");

    try {
      setIsScanning(true);
      setHasError(false);

      await scannerRef.current.start(
        { facingMode: facingMode },
        {
          fps: isIOS ? 10 : 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.7);
            return { width: qrboxSize, height: qrboxSize };
          },
          videoConstraints: {
            facingMode: facingMode,
            width: { ideal: isIOS ? 1280 : 1920 },
            height: { ideal: isIOS ? 720 : 1080 },
          },
          // Fix for iOS Safari: disable buggy native detector
          useBarCodeDetectorIfSupported: false,
        } as any,
        (decodedText: string) => {
          if (onScan) {
            playScanSound();
            onScan(decodedText);
            handleClose();
          }
        },
        () => {},
      );
    } catch (err: any) {
      console.error("Scanner start error:", err);
      setIsScanning(false);
      setHasError(true);
      setErrorMessage(
        err.message ||
          t("camera.scannerStartError") ||
          "Failed to start scanner",
      );
    }
  };

  const handleClose = async () => {

    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      }
    } catch (e) {
      console.error("Error stopping scanner:", e);
    }
    scannerRef.current = null;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setCapturedImage(null);
    setIsScanning(false);
    setHasError(false);
    setPermissionStatus("idle");
    onClose();
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: false });
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        // Handle mirrored front camera
        if (isFrontCamera) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Reset transform
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
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
      checkExistingPermission();
    } else {
      handleClose();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  // When permission becomes "granted", start the camera/scanner
  useEffect(() => {
    if (isOpen && permissionStatus === "granted") {
      startCamera(isFrontCamera ? "user" : "environment");
    }
  }, [permissionStatus]);

  useEffect(() => {
    if (isOpen && videoRef.current && stream && cameraType === "IMAGE") {
      videoRef.current.srcObject = stream;
    }
  }, [isOpen, stream, cameraType]);

  useEffect(() => {
    return () => {
      const cleanup = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
          try {
            await scannerRef.current.stop();
          } catch (e) {
            console.error("Cleanup stop error:", e);
          }
        }
      };
      cleanup();
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
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: "easeOut",
              },
            },
            exit: {
              y: 20,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: "easeIn",
              },
            },
          },
        }}
      >
        <ModalContent>
          <div className="relative flex flex-col items-center gap-4">
            <div className="relative w-full max-w-lg aspect-[3/4] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
              {permissionStatus !== "granted" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-gray-900">
                  {hasError ? (
                    <>
                      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                        <X className="text-red-500" size={32} />
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        {t("camera.errorTitle") || "Camera Error"}
                      </h3>
                      <p className="text-sm text-gray-400 mb-6">
                        {errorMessage ||
                          t("camera.errorDesc") ||
                          "Could not access camera. Please check permissions."}
                      </p>
                      <Button
                        color="primary"
                        variant="flat"
                        startContent={<RefreshCw size={18} />}
                        onClick={requestCameraPermission}
                      >
                        {t("common.retry") || "Retry"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-5">
                        <Camera className="text-primary" size={36} />
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        {t("camera.permissionTitle") ||
                          "Camera Access Required"}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">
                        {t("camera.permissionDesc") ||
                          "This app needs access to your camera to take photos or scan barcodes."}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                        <ShieldCheck size={14} />
                        <span>
                          {t("camera.privacyNote") ||
                            "Your camera data is not stored or shared."}
                        </span>
                      </div>
                      <Button
                        color="primary"
                        size="lg"
                        className="font-bold px-10"
                        radius="full"
                        startContent={<Camera size={20} />}
                        isLoading={permissionStatus === "requesting"}
                        onClick={requestCameraPermission}
                      >
                        {t("camera.allowCamera") || "Allow Camera"}
                      </Button>
                    </>
                  )}
                </div>
              ) : cameraType === "IMAGE" ? (
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
                    muted
                    style={{ imageRendering: "auto" }}
                    className={`w-full h-full object-cover ${isFrontCamera ? "scale-x-[-1]" : ""}`}
                  />
                )
              ) : (
                <div id="reader" className="w-full h-full" />
              )}

              {/* Scan Overlay for Barcode Mode */}
              {cameraType === "BARCODE" &&
                !capturedImage &&
                isScanning &&
                !hasError && (
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

              <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                <Button
                  isIconOnly
                  className="bg-black/40 backdrop-blur-md text-white hover:bg-black/60 border border-white/10"
                  radius="full"
                  onClick={handleClose}
                >
                  <X size={20} />
                </Button>
                {!capturedImage &&
                  !hasError &&
                  permissionStatus === "granted" && (
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

            {cameraType === "IMAGE" &&
              !hasError &&
              permissionStatus === "granted" && (
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

            {cameraType === "BARCODE" &&
              !hasError &&
              permissionStatus === "granted" && (
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
