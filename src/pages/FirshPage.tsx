import { useNavigate } from "react-router-dom";

export default function FirshPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="flex items-center px-6 py-4 bg-white border-b border-gray-100 shadow-sm h-20">
        <div className="flex items-center space-x-3">
          <img
            src="/assets/logo.png"
            alt="Ministry Logo"
            className="h-12 w-auto object-contain animate-fade-in"
            onError={(e) => {
              e.currentTarget.src = "/logo.png";
            }}
          />
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-bold text-[#075e3d] leading-tight font-sans">
              ກະຊວງປ້ອງກັນຄວາມສະຫງົບ
            </span>
            <span className="text-xs md:text-sm font-semibold text-gray-500 tracking-wide font-sans">
              Ministry of Public Security
            </span>
          </div>
        </div>
      </header>

      {/* Main Banner Image Container */}
      <div className="relative flex-1 min-h-[40vh] w-full overflow-hidden bg-gray-100 flex items-center justify-center">
        {/* Background Image of Officers */}
        <img
          src="/assets/images/01.jpg"
          alt="Officers Training"
          className="absolute inset-0 w-full h-full object-cover brightness-95"
        />
        {/* Centered Large Emblem Badge */}
        <div className="relative z-10 p-2 rounded-2xl bg-white/15 backdrop-blur-[2px] transition-transform duration-500 hover:scale-105">
          <img
            src="/assets/logo.png"
            alt="Large Ministry Emblem"
            className="h-36 w-36 md:h-48 md:w-48 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)] animate-pulse-slow"
          />
        </div>
      </div>

      {/* Bottom Government Green Information & Action Panel */}
      <div className="bg-[#075e3d] text-white flex flex-col justify-between p-8 md:p-12 space-y-8 min-h-[35vh]">
        {/* Centered Welcome Texts */}
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide leading-tight drop-shadow-md">
            ສະບາຍດີ
          </h1>
          <h2 className="text-xl md:text-2xl font-medium tracking-wide opacity-90 drop-shadow-sm">
            ຍິນດີຕ້ອນຮັບສູ່
          </h2>
          <p className="text-lg md:text-xl font-semibold tracking-wide underline underline-offset-8 decoration-2 hover:opacity-100 transition-opacity cursor-default drop-shadow-sm">
            ກະຊວງປ້ອງກັນຄວາມສະຫງົບແບບອອນລາຍ
          </p>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between w-full max-w-4xl mx-auto pt-4 border-t border-white/10">
          {/* Emergency Hotline Button */}
          <a
            href="tel:1191"
            className="flex items-center justify-center px-6 py-3 bg-[#C8102E] text-white font-bold rounded-full text-base md:text-lg shadow-md hover:bg-red-700 hover:shadow-lg active:scale-95 transition-all duration-300"
          >
            ສายດ່ວນ 1191
          </a>

          {/* Login Button */}
          <button
            onClick={() => navigate("/login")}
            className="flex items-center justify-center px-8 py-3 bg-[#4ADE80] text-gray-900 font-bold rounded-full text-base md:text-lg shadow-md hover:bg-[#22C55E] hover:text-white hover:shadow-lg active:scale-95 transition-all duration-300 cursor-pointer"
          >
            ລັອກອິນ
          </button>
        </div>
      </div>
    </div>
  );
}
