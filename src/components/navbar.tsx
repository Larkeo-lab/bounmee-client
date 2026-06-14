import {
  Settings,
  UserCog,
  History,
  Activity,
  CheckCircle2,
} from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";

import ProfileDropdown from "./profile-dropdown";

interface NavbarProps {
    activeTab: "home" | "news" | "menu";
    setActiveTab: (tab: "home" | "news" | "menu") => void;
    onBack: () => void;
    onSettings: () => void;
}

export default function Navbar({ activeTab, setActiveTab, onSettings }: NavbarProps) {
    const navigate = useNavigate();

    return (
        <nav className="bg-[#075e3d] text-white h-14 flex items-center justify-between px-6 shadow-md relative z-10">
            {/* Left: Spacer */}
            <div />

            {/* Center: Tabs */}
            <div className="flex items-center space-x-8 md:space-x-12 h-full">
                <button
                    onClick={() => setActiveTab("home")}
                    className={`text-base font-bold relative h-full flex items-center px-1 transition-all cursor-pointer ${activeTab === "home" ? "text-white" : "text-white/70 hover:text-white"
                        }`}
                >
                    ໜ້າຫຼັກ
                    {activeTab === "home" && (
                        <span className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 rounded-t-full" />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("news")}
                    className={`text-base font-bold relative h-full flex items-center px-1 transition-all cursor-pointer ${activeTab === "news" ? "text-white" : "text-white/70 hover:text-white"
                        }`}
                >
                    ຂ່າວສານ
                    {activeTab === "news" && (
                        <span className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 rounded-t-full" />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("menu")}
                    className={`text-base font-bold relative h-full flex items-center px-1 transition-all cursor-pointer ${activeTab === "menu" ? "text-white" : "text-white/70 hover:text-white"
                        }`}
                >
                    ເມນູ
                    {activeTab === "menu" && (
                        <span className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 rounded-t-full" />
                    )}
                </button>
            </div>

            {/* Right: Profile Dropdown & Settings */}
            <div className="flex items-center space-x-3">
                <ProfileDropdown />

                <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                        <button
                            className="p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-95 cursor-pointer"
                            title="ການຕັ້ງຄ່າ"
                        >
                            <Settings size={20} className="text-white" />
                        </button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Settings Menu" variant="flat" className="p-2">
                        <DropdownItem
                            key="profile"
                            startContent={<UserCog size={18} />}
                            className="font-bold py-2.5"
                            onPress={onSettings}
                        >
                            ແກ້ໄຂໂປຣໄຟລ
                        </DropdownItem>
                        <DropdownItem
                            key="history"
                            startContent={<History size={18} />}
                            className="font-bold py-2.5 data-[hover=true]:bg-[#075e3d] data-[hover=true]:text-white"
                            onPress={() => navigate("/report/history")}
                        >
                            ປະຫວັດແຈ້ງຄວາມ
                        </DropdownItem>
                        <DropdownItem
                            key="progress"
                            startContent={<Activity size={18} />}
                            className="font-bold py-2.5 data-[hover=true]:bg-[#075e3d] data-[hover=true]:text-white"
                            onPress={() => navigate("/report/progress")}
                        >
                            ຄວາມຄືບໜ້າແຈ້ງຄວາມ
                        </DropdownItem>
                        <DropdownItem
                            key="resolved"
                            startContent={<CheckCircle2 size={18} />}
                            className="font-bold py-2.5 data-[hover=true]:bg-[#075e3d] data-[hover=true]:text-white"
                            onPress={() => navigate("/report/resolved")}
                        >
                            ແຈ້ງຄວາມແກ້ໄຂແລ້ວ
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        </nav>
    );
}
