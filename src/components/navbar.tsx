import ProfileDropdown from "./profile-dropdown";

interface NavbarProps {
  activeTab: "home" | "news" | "menu";
  setActiveTab: (tab: "home" | "news" | "menu") => void;
  onBack: () => void;
  onSettings: () => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  return (
    <nav className="bg-[#075e3d] text-white h-14 flex items-center justify-between px-6 shadow-md relative z-10">
      {/* Left: Spacer */}
      <div />

      {/* Center: Tabs */}
      <div className="flex items-center space-x-8 md:space-x-12 h-full">
        <button
          onClick={() => setActiveTab("home")}
          className={`text-base font-bold relative h-full flex items-center px-1 transition-all cursor-pointer ${
            activeTab === "home"
              ? "text-white"
              : "text-white/70 hover:text-white"
          }`}
        >
          ໜ້າຫຼັກ
          {activeTab === "home" && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("menu")}
          className={`text-base font-bold relative h-full flex items-center px-1 transition-all cursor-pointer ${
            activeTab === "menu"
              ? "text-white"
              : "text-white/70 hover:text-white"
          }`}
        >
          ເມນູ
          {activeTab === "menu" && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("news")}
          className={`text-base font-bold relative h-full flex items-center px-1 transition-all cursor-pointer ${
            activeTab === "news"
              ? "text-white"
              : "text-white/70 hover:text-white"
          }`}
        >
          ຂ່າວສານ
          {activeTab === "news" && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Right: Profile Dropdown & Settings */}
      <div className="flex items-center space-x-3">
        <ProfileDropdown />
      </div>
    </nav>
  );
}
