import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Home as HomeIcon } from "lucide-react";
import { Card, CardBody, Button } from "@heroui/react";
import Navbar from "@/components/navbar";

export default function PageNotFound() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<"home" | "news" | "menu">("home");

  const handleBack = () => {
    navigate(-1);
  };

  const handleSettings = () => {
    navigate("/settings/profile");
  };

  const handleGoHome = () => {
    navigate("/home");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 font-sans">
      {/* 1. Header (Ministry Title & Logo) — same as Home.tsx */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm h-20 z-10">
        <div className="flex items-center space-x-3">
          <img
            src="/assets/logo.png"
            alt="Ministry Logo"
            className="h-12 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.src = "/logo.png";
            }}
          />
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-bold text-[#075e3d] leading-tight">
              ກະຊວງປ້ອງກັນຄວາມສະຫງົບ
            </span>
            <span className="text-xs md:text-sm font-semibold text-gray-500 tracking-wide">
              Ministry of Public Security
            </span>
          </div>
        </div>
      </header>

      {/* 2. Shared Navbar — same as Home.tsx */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBack={handleBack}
        onSettings={handleSettings}
      />

      {/* 3. Main Content Area — same gray workspace as Home.tsx */}
      <main className="flex-1 bg-[#d9d9d9] flex flex-col p-6 md:p-10 justify-center items-center">

        {/* 404 Hero Card */}
        <Card className="max-w-md w-full shadow-2xl rounded-[2rem] border border-gray-100 py-6 px-4 bg-white/95 backdrop-blur-md">
          <CardBody className="flex flex-col items-center text-center p-6 space-y-6">

            {/* Warning Icon */}
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-inner">
              <AlertTriangle size={42} className="animate-bounce" />
            </div>

            {/* Error Code & Message */}
            <div className="space-y-2">
              <h1 className="text-5xl font-extrabold text-red-500 tracking-wide font-sans">
                404
              </h1>
              <h2 className="text-xl font-bold text-gray-800 font-sans">
                ບໍ່ພົບໜ້າທີ່ທ່ານຕ້ອງການ
              </h2>
              <p className="text-sm text-gray-500 font-bold leading-relaxed font-sans px-4">
                ຂໍອະໄພ, ບໍ່ພົບໜ້າທີ່ທ່ານກຳລັງຊອກຫາ ຫຼື ເສັ້ນທາງນີ້ອາດຖືກຍ້າຍ ຫຼື ລຶບອອກຈາກລະບົບແລ້ວ.
              </p>
            </div>

            {/* Divider */}
            <div className="w-full border-t border-gray-100" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={handleBack}
                variant="bordered"
                className="flex-1 font-bold rounded-full py-2.5 text-sm border-gray-300 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer font-sans"
              >
                ກັບຄືນ
              </Button>
              <Button
                onClick={handleGoHome}
                className="flex-1 font-bold rounded-full py-2.5 text-sm bg-[#075e3d] hover:bg-[#064e32] text-white shadow-md transition-all cursor-pointer font-sans"
                startContent={<HomeIcon size={16} />}
              >
                ກັບຄືນໜ້າຫຼັກ
              </Button>
            </div>

          </CardBody>
        </Card>

        {/* Bottom Quote — same as Home.tsx */}
        <div className="text-center max-w-xl mx-auto py-6 space-y-1 mt-6">
          <p className="text-sm md:text-base font-bold text-gray-700 leading-relaxed">
            ຄວາມຄິດເຫັນຂອງທຸກທ່ານມີຄ່າທານພັດທະນາປັບປຸງການເຮັດ
          </p>
          <p className="text-sm md:text-base font-bold text-gray-700 leading-relaxed">
            ວຽກໃຫ້ດີຂຶ້ນ ໃຫ້ເຊື່ອໝັ້ນ ແລະ ໄວ້ວາງໃຈໃນການເຮັດວຽກ
          </p>
          <p className="text-sm md:text-base font-bold text-gray-700 leading-relaxed">
            ເພາະພວກເຮົາມາຈາກປະຊາຊົນເພື່ອປະຊາຊົນ
          </p>
        </div>

      </main>

      {/* 4. Footer — same as Home.tsx */}
      <footer className="bg-[#075e3d] h-12 w-full shadow-inner" />
    </div>
  );
}
