import { Hammer, LogOut } from "lucide-react";
import { Button } from "@heroui/react";

import { useAuth } from "@/routes/AuthContext";

export default function ComingSoon() {
  const { logout, user: authData } = useAuth();
  const userType = (authData as any)?.user?.userType as string | undefined;

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm h-20">
        <div className="flex items-center space-x-3">
          <img
            src="/assets/logo.png"
            alt="Ministry Logo"
            className="h-12 w-auto object-contain"
            onError={(e) => { e.currentTarget.src = "/logo.png"; }}
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

      {/* Body */}
      <main className="flex-1 bg-[#d9d9d9] flex flex-col items-center justify-center p-6 text-center gap-5">
        <div className="w-24 h-24 rounded-full bg-[#075e3d]/10 flex items-center justify-center">
          <Hammer size={44} className="text-[#075e3d]" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-extrabold text-gray-800">
            ກຳລັງພັດທະນາ
          </h1>
          <p className="text-sm font-bold text-gray-600 leading-relaxed">
            ໜ້າສຳລັບປະເພດຜູ້ໃຊ້{userType ? ` (${userType})` : ""} ກຳລັງຢູ່ໃນຂັ້ນຕອນການພັດທະນາ.<br />
            This portal is coming soon.
          </p>
        </div>
        <Button
          startContent={<LogOut size={18} />}
          onPress={logout}
          className="bg-[#075e3d] hover:bg-[#064e32] text-white font-bold rounded-2xl px-8 py-3 cursor-pointer"
        >
          ອອກຈາກລະບົບ / Logout
        </Button>
      </main>

      <footer className="bg-[#075e3d] h-12 w-full shadow-inner" />
    </div>
  );
}
