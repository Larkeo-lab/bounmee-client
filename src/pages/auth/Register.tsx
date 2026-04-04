import React from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Form,
  Image,
  Input,
  Card,
  CardBody,
  Select,
  SelectItem,
  Divider,
} from "@heroui/react";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/routes";
import { useGetAllProvinces } from "@/services/province/useProvince";
import { useGetDistrictsByProvince } from "@/services/district/useDistrict";
import LanguageSwitch from "@/components/common/language-switch";
import { showErrorToast } from "@/config/error-messages";
import toast from "react-hot-toast";
import {
  Store,
  User as UserIcon,
  MapPin,
  Mail,
  Lock,
  Phone,
  ArrowLeft,
} from "lucide-react";
import oneDoorLogo from "/assets/logo.png";
import version from "../../../package.json";
import {
  trackButtonClick,
  trackFormSubmit,
  trackPageView,
} from "@/lib/analytics";

const bgLineName = "/line-nam-bg.png";

export default function Register() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { register: registerStore } = useAuth();

  const [isVisible, setIsVisible] = React.useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedProvince, setSelectedProvince] = React.useState<string>("");

  const { data: provinces = [], isLoading: isLoadingProvinces } =
    useGetAllProvinces();
  const { data: districts = [], isLoading: isLoadingDistricts } =
    useGetDistrictsByProvince(selectedProvince);

  React.useEffect(() => {
    trackPageView("/register", "POS Register Page");
  }, []);

  console.log('districts', districts)

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    trackButtonClick("register-button", "POS Register Button");

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const data = Object.fromEntries(formData);

      if (data.password !== data.confirmPassword) {
        throw new Error(t("auth.passwordMismatch") || "Passwords do not match");
      }

      const payload = {
        name: data.storeName,
        address: data.address,
        provinceId: data.provinceId,
        districtId: data.districtId,
        userName: data.username,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: "STORE_ADMIN",
      };

      await registerStore(payload);

      trackFormSubmit("pos-register", true);
      toast.success(t("auth.registrationSuccess"));
      navigate("/"); // Redirect to login
    } catch (err: any) {
      trackFormSubmit("pos-register", false);
      showErrorToast(err, "", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-screen bg-background text-foreground overflow-hidden">
      {/* Brand Section (LHS) - Exactly like Login.tsx */}
      <div
        className="w-full lg:w-1/2 relative flex flex-col items-center justify-center p-8 overflow-hidden bg-primary shrink-0 lg:h-full"
        style={{
          backgroundImage: `url(${bgLineName})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-primary/80 backdrop-blur-[2px] z-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-transparent to-black/30 z-0" />

        <div className="relative z-10 flex flex-col items-center text-center text-white space-y-6">
          <div className="p-4 bg-white rounded-[2.5rem] shadow-2xl animate-float">
            <Image src={oneDoorLogo} alt="Dee POS Logo" className="w-32 lg:w-48" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-7xl font-black tracking-tight drop-shadow-lg uppercase italic">
              Dee POS
            </h1>
            <p className="text-xl lg:text-2xl font-light opacity-90 max-w-lg mx-auto">
              ລະບົບຈັດການການຂາຍອັດສະລິຍະ
              <span className="block text-sm mt-2 opacity-70">
                Smart POS Management System
              </span>
            </p>
          </div>

          <div className="pt-8 grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-2xl font-bold italic">PRO</p>
              <p className="text-xs opacity-70">Enterprise Edition</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-2xl font-bold italic">FAST</p>
              <p className="text-xs opacity-70">One-Step Setup</p>
            </div>
          </div>
        </div>

        {/* Decorative elements from Login.tsx */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl text-white/5" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl text-white/5" />
      </div>

      {/* Register Section (RHS) - Compacted consistent with Login.tsx */}
      <div className="relative w-full lg:w-1/2 h-full flex flex-col items-center bg-gray-50 dark:bg-gray-950 overflow-y-auto scroll-smooth">
        {/* Top Header Bar */}
        <div className="sticky top-0 w-full z-30 flex items-center justify-between p-4 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-xl">
          <Button
            variant="light"
            startContent={<ArrowLeft size={18} />}
            onPress={() => navigate("/")}
            className="font-semibold text-primary hover:bg-primary/5 p-0 h-auto"
          >
            {t("auth.backToLogin")}
          </Button>
          <LanguageSwitch />
        </div>

        <div className="w-full px-4 md:px-12 py-4 space-y-6">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("auth.register")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t("auth.registerSubtitle")}
            </p>
          </div>

          <Card className="w-full border-none bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-2xl">
            <CardBody className="p-6 md:p-8">
              <Form onSubmit={onSubmit} className="w-full flex flex-col gap-6">
                {/* Store Info */}
                <div className="w-full space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold border-b border-divider pb-1">
                    <Store size={18} />
                    <span className="text-sm uppercase tracking-wider">{t("sidebar.groups.management")}</span>
                  </div>

                  <Input
                    name="storeName"
                    label={t("auth.storeName")}
                    labelPlacement="outside"
                    placeholder={t("auth.storeNamePlaceholder")}
                    variant="bordered"
                    size="lg"
                    isRequired
                    className="w-full"
                    classNames={{
                      label: "font-semibold text-gray-700 dark:text-gray-300",
                      inputWrapper: "w-full h-14 border-2 border-default-200 hover:border-primary transition-colors",
                    }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      name="provinceId"
                      label={t("auth.province")}
                      labelPlacement="outside"
                      placeholder={t("auth.province")}
                      variant="bordered"
                      size="lg"
                      isLoading={isLoadingProvinces}
                      isRequired
                      classNames={{
                        label: "font-semibold text-gray-700 dark:text-gray-300",
                        trigger: "h-14 border-2 border-default-200 hover:border-primary transition-colors",
                      }}
                      onSelectionChange={(keys) => {
                        const provinceId = Array.from(keys)[0] as string;
                        const province = provinces.find((p: any) => p.id === provinceId);
                        if (province) setSelectedProvince(province.code);
                      }}
                    >
                      {provinces.map((prov: any) => (
                        <SelectItem key={prov.id} textValue={prov.nameLo}>
                          {i18n.language === "en" ? prov.nameEn : prov.nameLo}
                        </SelectItem>
                      ))}
                    </Select>

                    <Select
                      name="districtId"
                      label={t("auth.district")}
                      labelPlacement="outside"
                      placeholder={t("auth.district")}
                      variant="bordered"
                      size="lg"
                      isLoading={isLoadingDistricts}
                      isRequired
                      isDisabled={!selectedProvince}
                      classNames={{
                        label: "font-semibold text-gray-700 dark:text-gray-300",
                        trigger: "h-14 border-2 border-default-200 hover:border-primary transition-colors",
                      }}
                    >
                      {districts.map((dist: any) => (
                        <SelectItem key={dist.id} textValue={dist.nameLo}>
                          {i18n.language === "en" ? dist.nameEn : dist.nameLo}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <Input
                    name="address"
                    label={t("auth.address")}
                    labelPlacement="outside"
                    placeholder={t("auth.addressPlaceholder")}
                    variant="bordered"
                    size="lg"
                    className="w-full"
                    startContent={<MapPin className="text-default-400" size={20} />}
                    classNames={{
                      label: "font-semibold text-gray-700 dark:text-gray-300",
                      inputWrapper: "w-full h-14 border-2 border-default-200 hover:border-primary transition-colors",
                    }}
                  />
                </div>

                {/* Account Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary font-bold border-b border-divider pb-1">
                    <UserIcon size={18} />
                    <span className="text-sm uppercase tracking-wider">{t("navigation.profile")}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="username"
                      label={t("auth.username")}
                      labelPlacement="outside"
                      placeholder={t("auth.usernameePlaceholder")}
                      variant="bordered"
                      size="lg"
                      isRequired
                      startContent={<UserIcon className="text-default-400" size={20} />}
                      classNames={{
                        label: "font-semibold text-gray-700 dark:text-gray-300",
                        inputWrapper: "h-14 border-2 border-default-200 hover:border-primary transition-colors",
                      }}
                    />
                    <Input
                      name="phone"
                      label={t("auth.phone")}
                      labelPlacement="outside"
                      placeholder={t("auth.phonePlaceholder")}
                      variant="bordered"
                      size="lg"
                      isRequired
                      startContent={<Phone className="text-default-400" size={20} />}
                      classNames={{
                        label: "font-semibold text-gray-700 dark:text-gray-300",
                        inputWrapper: "h-14 border-2 border-default-200 hover:border-primary transition-colors",
                      }}
                    />
                  </div>

                  <Input
                    name="email"
                    type="email"
                    label={t("auth.email")}
                    labelPlacement="outside"
                    placeholder="example@gmail.com"
                    variant="bordered"
                    size="lg"
                    isRequired
                    className="w-full"
                    startContent={<Mail className="text-default-400" size={20} />}
                    classNames={{
                      label: "font-semibold text-gray-700 dark:text-gray-300",
                      inputWrapper: "w-full h-14 border-2 border-default-200 hover:border-primary transition-colors",
                    }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="password"
                      label={t("auth.password")}
                      labelPlacement="outside"
                      placeholder={t("auth.passwordPlaceholder")}
                      variant="bordered"
                      size="lg"
                      isRequired
                      startContent={<Lock className="text-default-400" size={20} />}
                      endContent={
                        <button type="button" onClick={toggleVisibility}>
                          {isVisible ? (
                            <EyeSlashFilledIcon className="text-2xl text-default-400" />
                          ) : (
                            <EyeFilledIcon className="text-2xl text-default-400" />
                          )}
                        </button>
                      }
                      type={isVisible ? "text" : "password"}
                      classNames={{
                        label: "font-semibold text-gray-700 dark:text-gray-300",
                        inputWrapper: "h-14 border-2 border-default-200 hover:border-primary transition-colors",
                      }}
                    />
                    <Input
                      name="confirmPassword"
                      label={t("auth.confirmPassword")}
                      labelPlacement="outside"
                      placeholder={t("auth.passwordPlaceholder")}
                      variant="bordered"
                      size="lg"
                      isRequired
                      startContent={<Lock className="text-default-400" size={20} />}
                      endContent={
                        <button type="button" onClick={toggleConfirmVisibility}>
                          {isConfirmVisible ? (
                            <EyeSlashFilledIcon className="text-2xl text-default-400" />
                          ) : (
                            <EyeFilledIcon className="text-2xl text-default-400" />
                          )}
                        </button>
                      }
                      type={isConfirmVisible ? "text" : "password"}
                      classNames={{
                        label: "font-semibold text-gray-700 dark:text-gray-300",
                        inputWrapper: "h-14 border-2 border-default-200 hover:border-primary transition-colors",
                      }}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  className="w-full h-14 font-bold text-lg shadow-lg shadow-primary/30 mt-2"
                  isLoading={isLoading}
                >
                  {isLoading ? t("auth.registering") : t("auth.registerButton")}
                </Button>
              </Form>
            </CardBody>
          </Card>

          <footer className="text-center space-y-4 pt-2">
            <Divider className="my-4" />
            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-[0.2em]">
              Dee POS System &bull; Version {version.version}
            </p>
          </footer>
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
