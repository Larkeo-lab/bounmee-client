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
  Chip,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Store,
  User as UserIcon,
  MapPin,
  Mail,
  Lock,
  ArrowLeft,
  Utensils,
  Coffee,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import version from "../../../package.json";
import { checkQuestionnaireCompletion } from "@/services/questionnaire/useQuestionnaire";

import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/icons";
import { useAuth } from "@/routes";
import { auth, googleProvider /*, facebookProvider */ } from "@/config/firebase";
import { signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
// import { FaFacebook } from "react-icons/fa";
import { API_ENDPOINTS } from "@/config/api";
import { useGetAllProvinces } from "@/services/province/useProvince";
import { useGetDistrictsByProvince } from "@/services/district/useDistrict";
import LanguageSwitch from "@/components/common/language-switch";
import { showErrorToast } from "@/config/error-messages";

import oneDoorLogo from "/assets/logo.png";

import {
  trackButtonClick,
  trackFormSubmit,
  trackPageView,
} from "@/lib/analytics";

const bgLineName = "/line-nam-bg.png";

type StoreType = "RESTAURANT" | "CAFE" | "GENERAL_STORE";

interface StoreTypeOption {
  value: StoreType;
  labelKey: string;
  defaultLabel: string;
  descriptionKey: string;
  defaultDesc: string;
  icon: React.ReactNode;
  gradient: string;
  border: string;
}

const STORE_TYPE_OPTIONS: StoreTypeOption[] = [
  {
    value: "RESTAURANT",
    labelKey: "auth.storeType.restaurant",
    defaultLabel: "ຮ້ານອາຫານ",
    descriptionKey: "auth.storeType.restaurantDesc",
    defaultDesc: "Restaurant & Food",
    icon: <Utensils size={32} />,
    gradient: "from-orange-500 to-red-500",
    border: "border-orange-400",
  },
  {
    value: "CAFE",
    labelKey: "auth.storeType.cafe",
    defaultLabel: "ຄາເຟ",
    descriptionKey: "auth.storeType.cafeDesc",
    defaultDesc: "Café & Beverage",
    icon: <Coffee size={32} />,
    gradient: "from-amber-500 to-yellow-600",
    border: "border-amber-400",
  },
  {
    value: "GENERAL_STORE",
    labelKey: "auth.storeType.generalStore",
    defaultLabel: "ຮ້ານຄ້າທົ່ວໄປ",
    descriptionKey: "auth.storeType.generalStoreDesc",
    defaultDesc: "General Store",
    icon: <Store size={32} />,
    gradient: "from-gray-500 to-slate-600",
    border: "border-gray-400",
  },
];

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register: registerStore, updateAuthState } = useAuth();

  // Step state: 1 = pick store type, 2 = fill form
  const [step, setStep] = React.useState<1 | 2>(1);
  const [selectedType, setSelectedType] = React.useState<StoreType | null>(
    null,
  );

  const [isVisible, setIsVisible] = React.useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedProvince, setSelectedProvince] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [firebaseData, setFirebaseData] = React.useState<{
    uid: string;
    email: string;
    photoURL?: string;
  } | null>(null);

  const { data: provinces = [], isLoading: isLoadingProvinces } =
    useGetAllProvinces();
  const { data: districts = [], isLoading: isLoadingDistricts } =
    useGetDistrictsByProvince(selectedProvince);

  React.useEffect(() => {
    trackPageView("/register", "POS Register Page");
  }, []);

  // Sync email from firebaseData to ensure it doesn't disappear
  React.useEffect(() => {
    if (firebaseData?.email) {
      setEmail(firebaseData.email);
    }
  }, [firebaseData]);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  const handleSelectType = (type: StoreType) => {
    setSelectedType(type);
  };

  const handleNextStep = () => {
    if (!selectedType) return;
    trackButtonClick(
      "register-select-type",
      `Selected store type: ${selectedType}`,
    );
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigate("/");
    }
  };


  // Social Login Logic (Pre-fill version for Registration)
  const handleSocialLogin = async (provider: any) => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Pre-fill data from Firebase
      // Try to get email from user object or providerData
      const fbEmail = user.email || user.providerData?.[0]?.email || "";
      
      setFirebaseData({
        uid: user.uid,
        email: fbEmail,
        photoURL: user.photoURL || undefined
      });
      setEmail(fbEmail);

      toast.success(t("auth.socialLinkSuccess") || "Linked with social account");
      
      // If we are at step 1 and haven't selected a type, we stay at step 1 but email is ready
      // Usually users pick type first, but if they click social first, we can jump to step 2 
      // if they have selected a type.
      if (selectedType) {
        setStep(2);
      }
    } catch (error: any) {
      console.error("Social Login Error:", error);
      toast.error(error.message || "Social Login Failed");
    } finally {
      setIsLoading(false);
    }
  };

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
        name: data.storeName as string,
        address: data.address as string,
        provinceId: data.provinceId as string,
        districtId: data.districtId as string,
        userName: data.username as string,
        email: data.email as string,
        phone: data.phone as string,
        password: data.password as string,
        role: "STORE_ADMIN",
        type: selectedType!,
        // Include firebase details if available
        firebaseUid: firebaseData?.uid,
        photoURL: firebaseData?.photoURL,
      };

      const authData = await registerStore(payload);

      trackFormSubmit("pos-register", true);
      toast.success(t("auth.registrationSuccess"));
      
      // Auto Login
      if (authData) {
        updateAuthState(authData);
        
        // Check if questionnaire is completed
        try {
          if (authData?.user?.storeId) {
            const completionStatus = await checkQuestionnaireCompletion({
              storeId: authData.user.storeId
            });

            if (!completionStatus.isCompleted) {
              navigate("/questionnaire");
              return;
            }
          }
        } catch (error) {
          console.error("Error checking questionnaire status:", error);
        }

        navigate("/tables");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      trackFormSubmit("pos-register", false);
      showErrorToast(err, "", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTypeOption = STORE_TYPE_OPTIONS.find(
    (o) => o.value === selectedType,
  );

  return (
    <div className="flex flex-col lg:flex-row w-full lg:h-screen bg-background text-foreground lg:overflow-hidden">
      {/* Brand Section (LHS) */}
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
            <Image
              alt="Dee POS Logo"
              className="w-32 lg:w-48"
              src={oneDoorLogo}
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-7xl font-black tracking-tight drop-shadow-lg uppercase italic">
              Dee POS
            </h1>
            <p className="text-xl lg:text-2xl font-light opacity-90 max-w-lg mx-auto">
              {t("auth.welcomeMessage")}
              <span className="block text-sm mt-2 opacity-70">
                {t("auth.subtitle")}
              </span>
            </p>
          </div>

          {/* Step Indicator */}
          <div className="pt-4 flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              {/* Step 1 */}
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm transition-all ${
                  step === 1
                    ? "bg-white text-primary shadow-lg scale-110"
                    : "bg-white/30 text-white"
                }`}
              >
                {step === 2 ? <CheckCircle2 size={18} /> : "1"}
              </div>
              <div
                className={`h-0.5 w-12 rounded-full transition-all ${
                  step === 2 ? "bg-white" : "bg-white/30"
                }`}
              />
              {/* Step 2 */}
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm transition-all ${
                  step === 2
                    ? "bg-white text-primary shadow-lg scale-110"
                    : "bg-white/30 text-white"
                }`}
              >
                2
              </div>
            </div>
            <p className="text-white/70 text-xs">
              {step === 1 ? t("auth.step1") : t("auth.step2")}
            </p>
          </div>

          <div className="pt-4 grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-2xl font-bold italic">PRO</p>
              <p className="text-xs opacity-70">
                {t("auth.enterpriseEdition")}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-2xl font-bold italic">FAST</p>
              <p className="text-xs opacity-70">{t("auth.oneStepSetup")}</p>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl text-white/5" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl text-white/5" />
      </div>

      {/* RHS */}
      <div className="relative w-full lg:w-1/2 lg:h-full flex flex-col items-center bg-gray-50 dark:bg-gray-950 lg:overflow-y-auto scroll-smooth">
        {/* Top Header Bar */}
        <div className="sticky top-0 w-full z-30 flex items-center justify-between p-4 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-xl">
          <Button
            className="font-semibold text-primary hover:bg-primary/5 p-0 h-auto"
            startContent={<ArrowLeft size={18} />}
            variant="light"
            onPress={handleBack}
          >
            {step === 2 ? t("common.back") : t("auth.backToLogin")}
          </Button>
          <LanguageSwitch />
        </div>

        <div className="w-full px-4 md:px-12 py-4 space-y-6">
          {/* ========== STEP 1: Choose Store Type ========== */}
          {step === 1 && (
            <>
              <div className="text-center lg:text-left space-y-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t("auth.chooseStoreType")}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {t("auth.chooseStoreTypeDesc")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {STORE_TYPE_OPTIONS.map((option) => {
                  const isSelected = selectedType === option.value;

                  return (
                    <button
                      key={option.value}
                      className={`relative w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 cursor-pointer group
                        ${
                          isSelected
                            ? `${option.border} bg-white dark:bg-gray-900 shadow-xl scale-[1.02]`
                            : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md hover:scale-[1.01]"
                        }
                      `}
                      type="button"
                      onClick={() => handleSelectType(option.value)}
                    >
                      {/* Icon circle */}
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4 bg-gradient-to-br ${option.gradient} shadow-lg transition-all ${
                          isSelected ? "scale-110" : "group-hover:scale-105"
                        }`}
                      >
                        {option.icon}
                      </div>

                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {t(option.labelKey)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {t(option.descriptionKey)}
                      </p>

                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2
                            className="text-primary fill-primary/10"
                            size={22}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <Button
                className="w-full h-14 font-bold text-lg shadow-lg shadow-primary/30"
                color="primary"
                endContent={<ArrowRight size={20} />}
                isDisabled={!selectedType}
                size="lg"
                onPress={handleNextStep}
              >
                {t("common.next")}
                {selectedTypeOption && (
                  <Chip
                    className="ml-2 bg-white/20 text-white text-xs font-semibold"
                    size="sm"
                  >
                    {t(selectedTypeOption.labelKey)}
                  </Chip>
                )}
              </Button>
            </>
          )}

          {/* ========== STEP 2: Fill Registration Form ========== */}
          {step === 2 && (
            <>
              <div className="text-center lg:text-left space-y-2">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {t("auth.register")}
                  </h2>
                  {selectedTypeOption && (
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-bold bg-gradient-to-r ${selectedTypeOption.gradient}`}
                    >
                      {React.cloneElement(
                        selectedTypeOption.icon as React.ReactElement,
                        {
                          size: 14,
                        },
                      )}
                      {t(selectedTypeOption.labelKey) ||
                        selectedTypeOption.defaultLabel}
                    </div>
                  )}
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  {t("auth.registerSubtitle")}
                </p>
              </div>

              <Card className="w-full border-none bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-2xl">
                <CardBody className="p-6 md:p-8">
                  <Form
                    className="w-full flex flex-col gap-6"
                    onSubmit={onSubmit}
                  >
                    {/* Store Info */}
                    <div className="w-full space-y-4">
                      <div className="flex items-center gap-2 text-primary font-bold border-b border-divider pb-1">
                        <Store size={18} />
                        <span className="text-sm uppercase tracking-wider">
                          {t("sidebar.groups.management")}
                        </span>
                      </div>

                      <Input
                        isRequired
                        className="w-full"
                        classNames={{
                          label:
                            "font-semibold text-gray-700 dark:text-gray-300",
                          inputWrapper:
                            "w-full h-14 border-2 border-default-200 hover:border-primary transition-colors",
                        }}
                        label={t("auth.storeName")}
                        labelPlacement="outside"
                        name="storeName"
                        placeholder={t("auth.storeNamePlaceholder")}
                        size="lg"
                        variant="bordered"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                          isRequired
                          classNames={{
                            label:
                              "font-semibold text-gray-700 dark:text-gray-300",
                            trigger:
                              "h-14 border-2 border-default-200 hover:border-primary transition-colors",
                          }}
                          isLoading={isLoadingProvinces}
                          label={t("auth.province")}
                          labelPlacement="outside"
                          name="provinceId"
                          placeholder={t("auth.province")}
                          size="lg"
                          variant="bordered"
                          onSelectionChange={(keys) => {
                            const provinceId = Array.from(keys)[0] as string;
                            const province = provinces.find(
                              (p: any) => p.id === provinceId,
                            );

                            if (province) setSelectedProvince(province.code);
                          }}
                        >
                          {provinces.map((prov: any) => (
                            <SelectItem key={prov.id} textValue={prov.nameLo}>
                              {prov.nameLo}
                            </SelectItem>
                          ))}
                        </Select>

                        <Select
                          isRequired
                          classNames={{
                            label:
                              "font-semibold text-gray-700 dark:text-gray-300",
                            trigger:
                              "h-14 border-2 border-default-200 hover:border-primary transition-colors",
                          }}
                          isDisabled={!selectedProvince}
                          isLoading={isLoadingDistricts}
                          label={t("auth.district")}
                          labelPlacement="outside"
                          name="districtId"
                          placeholder={t("auth.district")}
                          size="lg"
                          variant="bordered"
                        >
                          {districts.map((dist: any) => (
                            <SelectItem key={dist.id} textValue={dist.nameLo}>
                              {dist.nameLo}
                            </SelectItem>
                          ))}
                        </Select>
                      </div>

                      <Input
                        className="w-full"
                        classNames={{
                          label:
                            "font-semibold text-gray-700 dark:text-gray-300",
                          inputWrapper:
                            "w-full h-14 border-2 border-default-200 hover:border-primary transition-colors",
                        }}
                        label={t("auth.address")}
                        labelPlacement="outside"
                        name="address"
                        placeholder={t("auth.addressPlaceholder")}
                        size="lg"
                        startContent={
                          <MapPin className="text-default-400" size={20} />
                        }
                        variant="bordered"
                      />
                    </div>

                    {/* Account Info */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary font-bold border-b border-divider pb-1">
                        <UserIcon size={18} />
                        <span className="text-sm uppercase tracking-wider">
                          {t("navigation.profile")}
                        </span>
                      </div>

                      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            inputWrapper:
                              "h-14 border-2 border-default-200 hover:border-primary transition-colors",
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
                            inputWrapper:
                              "h-14 border-2 border-default-200 hover:border-primary transition-colors",
                          }}
                        />
                      </div> */}

                      <Input
                        isRequired
                        className="w-full"
                        classNames={{
                          label:
                            "font-semibold text-gray-700 dark:text-gray-300",
                          inputWrapper:
                            "w-full h-14 border-2 border-default-200 hover:border-primary transition-colors",
                        }}
                        label={t("auth.email")}
                        labelPlacement="outside"
                        name="email"
                        placeholder="example@gmail.com"
                        size="lg"
                        startContent={
                          <Mail className="text-default-400" size={20} />
                        }
                        type="email"
                        variant="bordered"
                        value={email}
                        onValueChange={setEmail}
                        isReadOnly={!!firebaseData}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          isRequired
                          classNames={{
                            label:
                              "font-semibold text-gray-700 dark:text-gray-300",
                            inputWrapper:
                              "h-14 border-2 border-default-200 hover:border-primary transition-colors",
                          }}
                          endContent={
                            <button type="button" onClick={toggleVisibility}>
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
                          startContent={
                            <Lock className="text-default-400" size={20} />
                          }
                          type={isVisible ? "text" : "password"}
                          variant="bordered"
                        />
                        <Input
                          isRequired
                          classNames={{
                            label:
                              "font-semibold text-gray-700 dark:text-gray-300",
                            inputWrapper:
                              "h-14 border-2 border-default-200 hover:border-primary transition-colors",
                          }}
                          endContent={
                            <button
                              type="button"
                              onClick={toggleConfirmVisibility}
                            >
                              {isConfirmVisible ? (
                                <EyeSlashFilledIcon className="text-2xl text-default-400" />
                              ) : (
                                <EyeFilledIcon className="text-2xl text-default-400" />
                              )}
                            </button>
                          }
                          label={t("auth.confirmPassword")}
                          labelPlacement="outside"
                          name="confirmPassword"
                          placeholder={t("auth.passwordPlaceholder")}
                          size="lg"
                          startContent={
                            <Lock className="text-default-400" size={20} />
                          }
                          type={isConfirmVisible ? "text" : "password"}
                          variant="bordered"
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full h-14 font-bold text-lg shadow-lg shadow-primary/30 mt-2"
                      color="primary"
                      isLoading={isLoading}
                      size="lg"
                      type="submit"
                    >
                      {isLoading
                        ? t("auth.registering")
                        : t("auth.registerButton")}
                    </Button>
                  </Form>

                  <div className="flex items-center gap-4 my-6">
                    <Divider className="flex-1" />
                    <span className="text-xs text-gray-400 uppercase tracking-widest">{t("auth.orContinueWith")}</span>
                    <Divider className="flex-1" />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <Button
                      className="h-12 border-2 border-default-200 hover:border-primary transition-colors bg-white dark:bg-white/5"
                      startContent={<FcGoogle size={20} />}
                      variant="bordered"
                      type="button"
                      onPress={() => handleSocialLogin(googleProvider)}
                    >
                      Google
                    </Button>
                    {/* <Button
                      className="h-12 border-2 border-default-200 hover:border-primary transition-colors bg-[#1877F2] text-white"
                      startContent={<FaFacebook size={20} />}
                      type="button"
                      onPress={() => handleSocialLogin(facebookProvider)}
                    >
                      Facebook
                    </Button> */}
                  </div>
                </CardBody>
              </Card>

              <footer className="text-center space-y-4 pt-2">
                <Divider className="my-4" />
                <p className="text-[10px] text-gray-400 font-mono uppercase tracking-[0.2em]">
                  Dee POS System &bull; Version {version.version}
                </p>
              </footer>
            </>
          )}
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
