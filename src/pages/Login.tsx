import React from "react";
import { useTranslation } from "react-i18next";

// Components
import { Button, Form, Image, Input } from "@heroui/react";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons";
import { useAuth } from "@/routes";

// Version number
import version from "../../package.json";
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

export default function Login() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const { login } = useAuth();
  const { t } = useTranslation();

  // Track page view with Google Analytics
  React.useEffect(() => {
    trackPageView("/admin/login", "Admin Login Page");
  }, []);

  const toggleVisibility = () => setIsVisible(!isVisible);

  // Handle form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    trackButtonClick("admin-login-button", "Admin Login Button");

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
      trackFormSubmit("admin-login", true);

      await login(userData);
    } catch (err: any) {
      showErrorToast(err, "", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <React.Fragment>
      <div className="flex flex-col lg:flex-row w-full min-h-screen">
        {/* Login Form Section */}
        <div className="relative w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 lg:p-16 bg-gray-50 dark:bg-gray-900">
          <div className="absolute top-4 right-4">
            <LanguageSwitch />
          </div>
          <div className="w-full max-w-sm md:max-w-md lg:max-w-lg p-6 md:p-14">
            <div className="text-center mb-8 text-primary">
              <h2 className="text-3xl font-bold">{t("auth.welcomeMessage")}</h2>
              <p className="text-sm sm:text-base lg:text-lg font-semibold">
                {t("auth.loginSubtitle")}
              </p>
            </div>

            <Form
              onSubmit={onSubmit}
              className="flex flex-col space-y-4 p-4 w-full"
            >
              <Input
                type="text"
                label={t("auth.username")}
                labelPlacement="outside"
                name="username"
                placeholder={t("auth.usernameePlaceholder")}
                variant="bordered"
                className="w-full"
                size="lg"
                validate={(value) => {
                  if (!value) {
                    return t("auth.invalidCredentials");
                  }
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
                validate={(value) => {
                  if (!value) {
                    return t("auth.invalidCredentials");
                  }
                  return true;
                }}
                endContent={
                  <button
                    className="focus:outline-none cursor-pointer"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                type={isVisible ? "text" : "password"}
              />

              <Button
                type="submit"
                color="primary"
                size="md"
                className="w-full mt-4 h-12"
                isLoading={isLoading}
              >
                {isLoading ? t("auth.loggingIn") : t("auth.loginButton")}
              </Button>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-xs mt-2">
                {t("auth.lastUpdated")}: {version.version}
              </p>
            </div>
          </div>
        </div>

        {/* Brand Section */}
        <div
          style={{
            backgroundImage: `url(${bgLineName})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="w-full relative bg-primary text-white lg:w-1/2 flex items-center justify-center p-8 lg:p-12"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/50 to-transparent z-0 h-1/2" />

          <div className="flex flex-col justify-center items-center max-w-md">
            <Image
              src={oneDoorLogo}
              alt="Smart ODSC"
              className=" w-56 mb-4 rounded-full"
            />
            <h1 className="text-3xl text-center sm:text2xl lg:text-4xl font-extrabold">
              ລະບົບ ການບໍລິການຜ່ານປະຕູດຽວ
            </h1>
            <p className=" opacity-80 mt-1">ກະຊວງ ພາຍໃນ</p>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
