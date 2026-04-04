import React from "react";
import { useTranslation } from "react-i18next";

// Components
import {
  Button,
  Form,
  Image,
  Input,
  Card,
  CardBody,
  Divider,
} from "@heroui/react";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/routes";

// Version number
import version from "../../../package.json";
import oneDoorLogo from "/assets/logo.png";
import LanguageSwitch from "@/components/common/language-switch";
import { showErrorToast } from "@/config/error-messages";

const bgLineName = "/line-nam-bg.png";
import {
  trackButtonClick,
  trackFormSubmit,
  trackLogin,
  trackPageView,
} from "@/lib/analytics";
import { Lock, User } from "lucide-react";

export default function Login() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const { login } = useAuth();
  const { t } = useTranslation();
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
      const data = Object.fromEntries(
        new FormData(e.currentTarget as HTMLFormElement),
      );
      const { username = "", password = "" } = data as {
        username: string;
        password: string;
      };

      const userData = {
        userName: username,
        password: password,
      };

      trackLogin("username", username);
      trackFormSubmit("pos-login", true);

      const authData = await login(userData);

      const userRole = authData?.user?.role;
      const permissions = authData?.user?.employee?.permission?.permissions;

      // Conditional Navigation based on ROLE & PERMISSION
      if (userRole === "EMPLOYEE" && permissions) {
        if (permissions["table"]?.includes("view")) {
          navigate("/tables");
        } else if (permissions["order"]?.includes("view")) {
          navigate("/order");
        } else if (permissions["product"]?.includes("view")) {
          navigate("/product-order");
        } else if (permissions["dashboard"]?.includes("view")) {
          navigate("/dashboard");
        } else {
          navigate("/settings/profile"); // Fallback fallback if no module permissions match
        }
      } else {
        navigate("/tables"); // Default for Admin/Store Owner
      }
    } catch (err: any) {
      showErrorToast(err, "", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-background text-foreground">
      {/* Brand Section (LHS/Top) */}
      <div
        className="w-full lg:w-[60%] relative flex flex-col items-center justify-center p-8 overflow-hidden bg-primary"
        style={{
          backgroundImage: `url(${bgLineName})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-primary/80 backdrop-blur-[2px] z-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-transparent to-black/30 z-0" />

        <div className="relative z-10 flex flex-col items-center text-center text-white space-y-6">
          <div className="p-4 bg-white rounded-[2.5rem] shadow-2xl animate-float">
            <Image
              src={oneDoorLogo}
              alt="Dee POS Logo"
              className="w-40 sm:w-56"
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight drop-shadow-lg uppercase italic">
              Dee POS
            </h1>
            <p className="text-xl sm:text-2xl font-light opacity-90 max-w-lg mx-auto">
              ລະບົບຈັດການການຂາຍອັດສະລິຍະ
              <span className="block text-sm mt-2 opacity-70">
                Smart POS Management System
              </span>
            </p>
          </div>

          <div className="pt-8 grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-2xl font-bold">100%</p>
              <p className="text-xs opacity-70">Security</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-2xl font-bold">Fast</p>
              <p className="text-xs opacity-70">Transactions</p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl" />
      </div>

      {/* Login Section (RHS/Bottom) */}
      <div className="relative w-full lg:w-[40%] flex items-center justify-center p-6 md:p-12 bg-gray-50 dark:bg-gray-950">
        <div className="absolute top-6 right-6">
          <LanguageSwitch />
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("auth.login")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t("auth.loginSubtitle")}
            </p>
          </div>

          <Card className="border-none bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-2xl">
            <CardBody className="p-8">
              <Form onSubmit={onSubmit} className="flex flex-col gap-6">
                <Input
                  type="text"
                  label={t("auth.username")}
                  labelPlacement="outside"
                  name="username"
                  placeholder={t("auth.usernameePlaceholder")}
                  variant="bordered"
                  className="w-full"
                  size="lg"
                  startContent={<User className="text-default-400" size={20} />}
                  classNames={{
                    label: "font-semibold text-gray-700 dark:text-gray-300",
                    inputWrapper:
                      "h-14 border-2 border-default-200 hover:border-primary transition-colors",
                  }}
                  validate={(value) => {
                    if (!value) return t("auth.missingCredentials");
                    return true;
                  }}
                />

                <Input
                  label={t("auth.password")}
                  labelPlacement="outside"
                  name="password"
                  placeholder={t("auth.passwordPlaceholder")}
                  variant="bordered"
                  className="w-full"
                  size="lg"
                  startContent={<Lock className="text-default-400" size={20} />}
                  classNames={{
                    label: "font-semibold text-gray-700 dark:text-gray-300",
                    inputWrapper:
                      "h-14 border-2 border-default-200 hover:border-primary transition-colors",
                  }}
                  validate={(value) => {
                    if (!value) return t("auth.missingCredentials");
                    return true;
                  }}
                  endContent={
                    <button
                      className="focus:outline-none cursor-pointer"
                      type="button"
                      onClick={toggleVisibility}
                    >
                      {isVisible ? (
                        <EyeSlashFilledIcon className="text-2xl text-default-400" />
                      ) : (
                        <EyeFilledIcon className="text-2xl text-default-400" />
                      )}
                    </button>
                  }
                  type={isVisible ? "text" : "password"}
                />

                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span>Remember me</span>
                  </label>
                  <Button
                    variant="light"
                    size="sm"
                    color="primary"
                    className="font-semibold p-0 h-auto"
                  >
                    {t("auth.forgotPassword")}?
                  </Button>
                </div>

                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  className="w-full h-14 font-bold text-lg shadow-lg shadow-primary/30"
                  isLoading={isLoading}
                >
                  {isLoading ? t("auth.loggingIn") : t("auth.loginButton")}
                </Button>
              </Form>
            </CardBody>
          </Card>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Button
                variant="light"
                color="primary"
                className="p-0 h-auto font-bold"
                onClick={() => navigate("/register")}
              >
                {t("auth.register")}
              </Button>
            </p>
            <Divider className="my-8" />
            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-[0.2em]">
              Dee POS System &bull; Version {version.version}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
