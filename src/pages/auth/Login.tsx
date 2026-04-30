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
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { checkQuestionnaireCompletion } from "@/services/questionnaire/useQuestionnaire";

import version from "../../../package.json";

import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons";
import { useAuth } from "@/routes/AuthContext";
//import { auth,/* googleProvider , facebookProvider */ } from "@/config/firebase";
//import { signInWithPopup } from "firebase/auth";
//import { FcGoogle } from "react-icons/fc";
// import { FaFacebook } from "react-icons/fa";

// Version number

import oneDoorLogo from "/assets/logo.png";

import LanguageSwitch from "@/components/common/language-switch";
import { showErrorToast } from "@/config/error-messages";
// import { toast } from "react-hot-toast";
// import { API_ENDPOINTS } from "@/config/api";

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
  const [identifier, setIdentifier] = React.useState<string>("");

  const { login,/*  updateAuthState */ } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Social Login Logic
  // const handleSocialLogin = async (provider: any) => {
  //   setIsLoading(true);
  //   try {
  //     const result = await signInWithPopup(auth, provider);
  //     const user = result.user;
  //     const idToken = await user.getIdToken();
      
  //     // Update visual state (optional but nice)
  //     setIdentifier(user.email || user.providerData?.[0]?.email || "");

  //     // Call our Social Login API (the new path)
  //     const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${API_ENDPOINTS.AUTH.FIREBASE_SYNC}`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": `Bearer ${idToken}`
  //       },
  //       body: JSON.stringify({
  //         uid: user.uid,
  //         email: user.email,
  //         displayName: user.displayName,
  //         photoURL: user.photoURL,
  //         provider: result.providerId
  //       })
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || "Failed to login with Social Account");
  //     }

  //     const authData = await response.json();
      
  //     // Successfully logged in! 
  //     // Update global auth state
  //     updateAuthState(authData.data);
      
  //     toast.success(t("common.success") || "Login Successful");
      
  //     const userRole = authData.data.user?.role;
  //     const permissions = authData.data.user?.employee?.permission?.permissions;

  //     // Handle conditional navigation (same as manual login)
  //     if (userRole === "EMPLOYEE" && permissions) {
  //       if (permissions["table"]?.includes("view")) {
  //         navigate("/tables");
  //       } else if (permissions["order"]?.includes("view")) {
  //         navigate("/order");
  //       } else if (permissions["product"]?.includes("view")) {
  //         navigate("/product-order");
  //       } else if (permissions["dashboard"]?.includes("view")) {
  //         navigate("/dashboard");
  //       } else {
  //         navigate("/settings/profile");
  //       }
  //     } else {
  //       // Check if questionnaire is completed
  //       try {
  //         if (authData.data.user?.storeId) {
  //           const completionStatus = await checkQuestionnaireCompletion({
  //             storeId: authData.data.user.storeId
  //           });

  //           if (!completionStatus.isCompleted) {
  //             navigate("/questionnaire");
  //             return;
  //           }
  //         }
  //       } catch (error) {
  //         console.error("Error checking questionnaire status:", error);
  //       }

  //       // Default navigation for STORE_ADMIN or others
  //       navigate("/tables");
  //     }
  //   } catch (error: any) {
  //     console.error("Social Login Error:", error);
  //     toast.error(error.message || "Social Login Failed");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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
      const { identifier = "", password = "" } = data as {
        identifier: string;
        password: string;
      };

      const userData = {
        identifier: identifier,
        password: password,
      };

      trackLogin("identifier", identifier);
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
        // Check if questionnaire is completed
        try {
          if (authData?.user?.storeId) {
            const completionStatus = await checkQuestionnaireCompletion({
              storeId: authData.user.storeId
            });

            console.log('completionStatus', completionStatus)
            if (!completionStatus.completed) {
              navigate("/questionnaire");
              return;
            }
          }
        } catch (error) {
          console.error("Failed to check questionnaire status:", error);
        }
        
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
              alt="Dee POS Logo"
              className="w-40 sm:w-56"
              src={oneDoorLogo}
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight drop-shadow-lg uppercase italic">
              Dee POS
            </h1>
            <p className="text-xl sm:text-2xl font-light opacity-90 max-w-lg mx-auto">
              {t("auth.welcomeMessage")}
              <span className="block text-sm mt-2 opacity-70">
                {t("auth.subtitle")}
              </span>
            </p>
          </div>

          <div className="pt-8 grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-2xl font-bold">100%</p>
              <p className="text-xs opacity-70">{t("auth.security")}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-2xl font-bold">Fast</p>
              <p className="text-xs opacity-70">{t("auth.fastTransactions")}</p>
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
              <Form className="flex flex-col gap-6" onSubmit={onSubmit}>
                <Input
                  className="w-full"
                  classNames={{
                    label: "font-semibold text-gray-700 dark:text-gray-300",
                    inputWrapper:
                      "h-14 border-2 border-default-200 hover:border-primary transition-colors",
                  }}
                  label={t("auth.emailOrUsername")}
                  labelPlacement="outside"
                  name="identifier"
                  placeholder={t("auth.emailOrUsernamePlaceholder")}
                  size="lg"
                  startContent={<Mail className="text-default-400" size={20} />}
                  type="text"
                  value={identifier}
                  onValueChange={setIdentifier}
                  validate={(value) => {
                    if (!value) return t("auth.missingCredentials");

                    return true;
                  }}
                  variant="bordered"
                />

                <Input
                  className="w-full"
                  classNames={{
                    label: "font-semibold text-gray-700 dark:text-gray-300",
                    inputWrapper:
                      "h-14 border-2 border-default-200 hover:border-primary transition-colors",
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
                  label={t("auth.password")}
                  labelPlacement="outside"
                  name="password"
                  placeholder={t("auth.passwordPlaceholder")}
                  size="lg"
                  startContent={<Lock className="text-default-400" size={20} />}
                  type={isVisible ? "text" : "password"}
                  validate={(value) => {
                    if (!value) return t("auth.missingCredentials");

                    return true;
                  }}
                  variant="bordered"
                />

                {/* <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                    <input
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                      type="checkbox"
                    />
                    <span>{t("auth.rememberMe")}</span>
                  </label>
                  <Button
                    className="font-semibold p-0 h-auto"
                    color="primary"
                    size="sm"
                    variant="light"
                  >
                    {t("auth.forgotPassword")}?
                  </Button>
                </div> */}

                <Button
                  className="w-full h-14 font-bold text-lg shadow-lg shadow-primary/30"
                  color="primary"
                  isLoading={isLoading}
                  size="lg"
                  type="submit"
                >
                  {isLoading ? t("auth.loggingIn") : t("auth.loginButton")}
                </Button>
              </Form>

              <div className="flex items-center gap-4 my-6">
                <Divider className="flex-1" />
                <span className="text-xs text-gray-400 uppercase tracking-widest">{t("auth.orContinueWith")}</span>
                <Divider className="flex-1" />
              </div>

              {/* <div className="grid grid-cols-1 gap-4">
                <Button
                  className="h-12 border-2 border-default-200 hover:border-primary transition-colors bg-white dark:bg-white/5"
                  startContent={<FcGoogle size={20} />}
                  variant="bordered"
                  type="button"
                  onPress={() => handleSocialLogin(googleProvider)}
                >
                  Google
                </Button>
                <Button
                  className="h-12 border-2 border-default-200 hover:border-primary transition-colors bg-[#1877F2] text-white"
                  startContent={<FaFacebook size={20} />}
                  type="button"
                  onPress={() => handleSocialLogin(facebookProvider)}
                >
                  Facebook
                </Button>
              </div> */}
            </CardBody>
          </Card>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              {t("auth.noAccount")}{" "}
              <Button
                className="p-0 h-auto font-bold"
                color="primary"
                variant="light"
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
