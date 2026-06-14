import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Scale,
  Smartphone,
  ChevronRight
} from "lucide-react";
import { Card, CardBody, Button, Image } from "@heroui/react";
import Navbar from "@/components/navbar";
import News from "@/pages/news/News";

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<"home" | "news" | "menu">("home");

  const handleBack = () => {
    navigate(-1);
  };

  const handleSettings = () => {
    navigate("/settings/profile");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 font-sans">
      {/* 1. Header (Ministry Title & Logo) */}
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

      {/* 2. Sub-header / Navbar (Green Bar) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBack={handleBack}
        onSettings={handleSettings}
      />

      {/* 3. Main Content Area */}
      <main className="flex-1 bg-[#d9d9d9] flex flex-col p-6 md:p-10 justify-between">
        
        {/* Tab 1: MENU (Mockup Match) */}
        {activeTab === "menu" && (
          <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 justify-items-center mb-8">
              
              {/* Button 1: ຕ້ອງການແຈ້ງຄວາມ */}
              <Button
                onClick={() => navigate("/report/create")}
                className="w-full max-w-md bg-[#075e3d] hover:bg-[#064e32] active:scale-[0.98] text-white flex items-center p-5 rounded-2xl shadow-lg transition-all cursor-pointer group h-auto justify-start"
              >
                {/* White Square Icon container */}
                <div className="bg-white rounded-xl w-16 h-16 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                  <div className="relative">
                    <Smartphone size={32} className="text-gray-800" />
                    {/* Pulsing red warning notification badge */}
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white animate-pulse">
                      !
                    </span>
                  </div>
                </div>
                {/* Text content */}
                <span className="ml-5 text-xl font-bold tracking-wide text-left flex-1 font-sans">
                  ຕ້ອງການແຈ້ງຄວາມ
                </span>
                <ChevronRight size={24} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </Button>

              {/* Button 2: ສຶກສາກົດໝາຍ */}
              <Button
                onClick={() => navigate("/law-education")}
                className="w-full max-w-md bg-[#075e3d] hover:bg-[#064e32] active:scale-[0.98] text-white flex items-center p-5 rounded-2xl shadow-lg transition-all cursor-pointer group h-auto justify-start"
              >
                {/* White Square Icon container */}
                <div className="bg-white rounded-xl w-16 h-16 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                  <Scale size={32} className="text-[#075e3d]" />
                </div>
                {/* Text content */}
                <span className="ml-5 text-xl font-bold tracking-wide text-left flex-1 font-sans">
                  ສຶກສາກົດໝາຍ
                </span>
                <ChevronRight size={24} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </Button>

            </div>

            {/* Button 3: ສຶກສາກົດຈະລາຈອນ (Centered Below) */}
            <div className="flex justify-center mb-10">
              <Button
                onClick={() => navigate("/traffic-rules")}
                className="w-full max-w-md bg-[#075e3d] hover:bg-[#064e32] active:scale-[0.98] text-white flex items-center p-5 rounded-2xl shadow-lg transition-all cursor-pointer group h-auto justify-start"
              >
                {/* White Square Icon container */}
                <div className="bg-white rounded-xl w-16 h-16 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                  {/* Styled traffic light icon mimicking mockup */}
                  <div className="flex flex-col space-y-0.5 items-center bg-gray-800 p-1.5 rounded-md w-7 h-10 justify-center">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                </div>
                {/* Text content */}
                <span className="ml-5 text-xl font-bold tracking-wide text-left flex-1 font-sans">
                  ສຶກສາກົດຈະລາຈອນ
                </span>
                <ChevronRight size={24} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: HOME (Introduction of the Portal - styled with HeroUI) */}
        {activeTab === "home" && (
          <div className="flex-1 max-w-4xl mx-auto w-full space-y-8 animate-fade-in">
            {/* Main Welcome Hero Banner - using HeroUI Card */}
            <Card className="bg-[#075e3d] border-none shadow-xl rounded-3xl text-white relative overflow-hidden">
              <CardBody className="p-8 flex flex-col md:flex-row items-center justify-between z-10">
                <div className="space-y-4 max-w-xl">
                  <span className="bg-white/20 text-white font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                    ລະບົບບໍລິການພົນລະເມືອງອອນລາຍ
                  </span>
                  <h3 className="text-3xl font-extrabold tracking-wide leading-tight">
                    ຍິນດີຕ້ອນຮັບສູ່ ລະບົບ Bounmee
                  </h3>
                  <p className="text-sm md:text-base text-white/90 leading-relaxed font-medium">
                    ລະບົບ Bounmee ແມ່ນເວັບໄຊທ໌ບໍລິການປະຊາຊົນແບບອອນລາຍ ພາຍໃຕ້ການຄຸ້ມຄອງຂອງ ກະຊວງປ້ອງກັນຄວາມສະຫງົບ (Ministry of Public Security). ພັດທະນາຂຶ້ນເພື່ອເປັນຊ່ອງທາງໃຫ້ພົນລະເມືອງເຂົ້າເຖິງການບໍລິການຂອງລັດໄດ້ຢ່າງສະດວກ, ວ່ອງໄວ ແລະ ປອດໄພ.
                  </p>
                </div>
                {/* Decorative logo background opacity pattern using HeroUI Image */}
                <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center pointer-events-none pr-8">
                  <Image 
                    src="/assets/logo.png" 
                    alt="Decorative Logo" 
                    className="w-64 h-64 object-contain"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Core Services Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-gray-700 uppercase tracking-wider">
                ການບໍລິການຫຼັກຂອງພວກເຮົາ (Our Core Services)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Card 1: Online Reporting */}
                <Card className="shadow-sm border border-gray-100 rounded-2xl hover:shadow-md transition-shadow">
                  <CardBody className="p-6 flex flex-col space-y-4">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                      <Smartphone size={24} />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h5 className="font-bold text-base text-gray-800">ແຈ້ງຄວາມອອນລາຍ</h5>
                      <p className="text-xs text-gray-500 font-bold leading-relaxed">
                        ທ່ານສາມາດແຈ້ງເຫດດ່ວນເຫດຮ້າຍ ຫຼື ຄະດີຄວາມຕ່າງໆ ພ້ອມອັບໂຫຼດຫຼັກຖານໄດ້ທັນທີຜ່ານລະບົບ ໂດຍບໍ່ຕ້ອງເດີນທາງໄປສະຖານີຕຳຫຼວດ.
                      </p>
                    </div>
                  </CardBody>
                </Card>

                {/* Card 2: Study Law */}
                <Card className="shadow-sm border border-gray-100 rounded-2xl hover:shadow-md transition-shadow">
                  <CardBody className="p-6 flex flex-col space-y-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                      <Scale size={24} />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h5 className="font-bold text-base text-gray-800">ສຶກສາກົດໝາຍ</h5>
                      <p className="text-xs text-gray-500 font-bold leading-relaxed">
                        ສຶກສາຂໍ້ມູນກົດໝາຍທີ່ສຳຄັນຂອງ ສປປ ລາວ ເພື່ອສ້າງຄວາມເຂົ້າໃຈໃນສິດ ແລະ ພັນທະຂອງພົນລະເມືອງ ເຮັດໃຫ້ສັງຄົມມີຄວາມສະຫງົບ.
                      </p>
                    </div>
                  </CardBody>
                </Card>

                {/* Card 3: Traffic Rules */}
                <Card className="shadow-sm border border-gray-100 rounded-2xl hover:shadow-md transition-shadow">
                  <CardBody className="p-6 flex flex-col space-y-4">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                      {/* Traffic light icon */}
                      <div className="flex flex-col space-y-0.5 items-center bg-gray-800 p-1 rounded-sm w-4.5 h-6 justify-center">
                        <div className="w-1 h-1 rounded-full bg-red-500" />
                        <div className="w-1 h-1 rounded-full bg-yellow-500" />
                        <div className="w-1 h-1 rounded-full bg-green-500" />
                      </div>
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <h5 className="font-bold text-base text-gray-800">ກົດຈະລາຈອນ</h5>
                      <p className="text-xs text-gray-500 font-bold leading-relaxed">
                        ຄູ່ມືຮຽນຮູ້ກົດລະບຽບຈະລາຈອນ, ປ້າຍເຕືອນ, ເຄື່ອງໝາຍຕ່າງໆ ເພື່ອຄວາມປອດໄພໃນການສັນຈອນ ແລະ ຫຼຸດຜ່ອນອຸປະຕິເຫດບົນທ້ອງຖະໜົນ.
                      </p>
                    </div>
                  </CardBody>
                </Card>

              </div>
            </div>

            {/* How It Works Step-by-Step */}
            <Card className="shadow-sm border border-gray-100 rounded-3xl">
              <CardBody className="p-6 space-y-6">
                <h4 className="text-lg font-bold text-gray-700 uppercase tracking-wider">
                  ຂັ້ນຕອນການນຳໃຊ້ລະບົບ (How to use the system)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
                  
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center space-y-2.5 relative">
                    <div className="w-10 h-10 rounded-full bg-[#075e3d]/10 text-[#075e3d] font-black text-sm flex items-center justify-center border-2 border-[#075e3d]">
                      1
                    </div>
                    <h5 className="font-bold text-sm text-gray-800">ເຂົ້າສູ່ລະບົບ</h5>
                    <p className="text-[11px] text-gray-500 font-bold max-w-[200px]">
                      ລົງທະບຽນ ແລະ ເຂົ້າສູ່ລະບົບດ້ວຍຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານທີ່ປອດໄພ.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center space-y-2.5 relative">
                    <div className="w-10 h-10 rounded-full bg-[#075e3d]/10 text-[#075e3d] font-black text-sm flex items-center justify-center border-2 border-[#075e3d]">
                      2
                    </div>
                    <h5 className="font-bold text-sm text-gray-800">ເລືອກບໍລິການ</h5>
                    <p className="text-[11px] text-gray-500 font-bold max-w-[200px]">
                      ເລືອກເມນູແຈ້ງຄວາມ ຫຼື ເເລືອກສຶກສາບົດຮຽນກົດໝາຍ/ກົດຈະລາຈອນ.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center space-y-2.5 relative">
                    <div className="w-10 h-10 rounded-full bg-[#075e3d]/10 text-[#075e3d] font-black text-sm flex items-center justify-center border-2 border-[#075e3d]">
                      3
                    </div>
                    <h5 className="font-bold text-sm text-gray-800">ຕິດຕາມຜົນ</h5>
                    <p className="text-[11px] text-gray-500 font-bold max-w-[200px]">
                      ຕິດຕາມສະຖານະຂອງການແຈ້ງເຫດ ຫຼື ປະຫວັດຂອງທ່ານໄດ້ຕະຫຼອດ 24 ຊົ່ວໂມງ.
                    </p>
                  </div>

                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Tab 3: NEWS (Ministry Announcements) */}
        {activeTab === "news" && <News />}

        {/* 4. Bottom Lao Patriotic Quote (Mockup Match) — hidden on News tab */}
        {activeTab !== "news" && (
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
        )}

      </main>

      {/* 5. Footer (Solid Green Bar) */}
      <footer className="bg-[#075e3d] h-12 w-full shadow-inner" />
    </div>
  );
}