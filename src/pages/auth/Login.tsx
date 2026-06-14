import React from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Eye, EyeOff, RotateCw, User, Lock } from "lucide-react";
import { Input } from "@heroui/react";
import { useAuth } from "@/routes/AuthContext";
import { showErrorToast } from "@/config/error-messages";
import { trackButtonClick, trackFormSubmit, trackLogin, trackPageView } from "@/lib/analytics";

export default function Login() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [identifier, setIdentifier] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");

  const { login } = useAuth();
  const navigate = useNavigate();

  // Track page view with Google Analytics
  React.useEffect(() => {
    trackPageView("/login", "POS Login Page");
  }, []);

  const toggleVisibility = () => setIsVisible(!isVisible);

  // Handle form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    trackButtonClick("login-button", "POS Login Button");

    try {
      const userData = {
        identifier: identifier,
        password: password,
      };

      trackLogin("identifier", identifier);
      trackFormSubmit("pos-login", true);

      const authData = await login(userData);

      const user = authData?.user as any;
      const userRole = user?.role || user?.userType;

      // Route by user type. Portals not built yet fall back to the placeholder.
      // All police roles share the same portal (data differs by role).
      const PORTAL_BY_TYPE: Record<string, string> = {
        CITIZEN: "/home",
        POLICE_DEPARTMENT: "/police/home",
        DISTRICT_POLICE: "/police/home",
        VILLAGE_CHIEF: "/police/home",
      };
      const targetPath = PORTAL_BY_TYPE[userRole] || "/coming-soon";

      navigate(targetPath);
    } catch (err: any) {
      showErrorToast(err, "", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="flex items-center px-6 py-4 bg-white border-b border-gray-100 shadow-sm h-20 z-10">
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
            <span className="text-lg md:text-xl font-bold text-[#075e3d] leading-tight font-sans">
              ກະຊວງປ້ອງກັນຄວາມສະຫງົບ
            </span>
            <span className="text-xs md:text-sm font-semibold text-gray-500 tracking-wide font-sans">
              Ministry of Public Security
            </span>
          </div>
        </div>
      </header>

      {/* Main Area with Background Image */}
      <div
        className="flex-1 w-full flex items-center justify-center p-6 relative bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: "url('/assets/images/02.png')",
        }}
      >
        {/* Background overlay with subtle blur to obscure baked-in UI components while keeping the park visible */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] z-0" />

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-lg bg-[#075e3d]/95 backdrop-blur-md text-white rounded-[2rem] p-8 md:p-12 shadow-2xl flex flex-col space-y-6 transition-transform duration-500 hover:scale-[1.01]">

          {/* Avatar Area */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-white/20">
              <User className="text-[#075e3d] w-14 h-14" />
            </div>
            <span className="text-xl font-bold tracking-wide">ລັອກອິນ</span>
          </div>

          {/* Form */}
          <form className="flex flex-col space-y-4" onSubmit={onSubmit}>
            {/* Phone/Email Input */}
            <Input
              isRequired
              classNames={{
                inputWrapper:
                  "bg-white shadow-inner h-12 px-5 border border-white/10 data-[hover=true]:bg-white group-data-[focus=true]:bg-white",
                input:
                  "text-gray-800 placeholder:text-gray-400 text-sm font-sans font-medium",
              }}
              name="identifier"
              placeholder="ເບີໂທ/Email....."
              radius="lg"
              size="lg"
              startContent={
                <Phone className="text-gray-400 shrink-0" size={18} />
              }
              type="text"
              value={identifier}
              onValueChange={setIdentifier}
            />

            {/* Password Input */}
            <Input
              isRequired
              classNames={{
                inputWrapper:
                  "bg-white shadow-inner h-12 px-5 border border-white/10 data-[hover=true]:bg-white group-data-[focus=true]:bg-white",
                input:
                  "text-gray-800 placeholder:text-gray-400 text-sm font-sans font-medium",
              }}
              endContent={
                <button
                  className="focus:outline-none text-gray-400 hover:text-gray-600 transition-colors"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              name="password"
              placeholder="ລະຫັດຜ່ານ....."
              radius="lg"
              size="lg"
              startContent={
                <Lock className="text-gray-400 shrink-0" size={18} />
              }
              type={isVisible ? "text" : "password"}
              value={password}
              onValueChange={setPassword}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 flex items-center justify-center space-x-2 bg-[#4ADE80] hover:bg-[#22C55E] active:scale-95 text-gray-900 font-bold rounded-full text-base transition-all duration-300 cursor-pointer shadow-md"
            >
              <RotateCw className={`w-5 h-5 shrink-0 ${isLoading ? 'animate-spin' : ''}`} />
              <span>ລັອກອິນ</span>
            </button>
          </form>

          {/* Action links */}
          <div className="flex flex-col items-center space-y-4 pt-2">
            <button
              onClick={() => navigate("/register")}
              className="text-base font-bold text-sky-300 hover:text-sky-200 transition-colors cursor-pointer"
            >
              ລົງທະບຽນເຂົ້າໃຊ້ງານ
            </button>

            {/* Hotline Link */}
            <div className="w-full flex justify-start pt-4">
              <a
                href="tel:1191"
                className="flex items-center justify-center px-5 py-2.5 bg-[#C8102E] text-white font-bold rounded-full text-sm shadow-md hover:bg-red-700 hover:shadow-lg active:scale-95 transition-all duration-300"
              >
                ສາຍດ່ວນ 1191
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
