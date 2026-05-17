import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  RadioGroup,
  Radio,
  CheckboxGroup,
  Checkbox,
  Input,
  Textarea,
  Image,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetQuestionnaires,
  useGetQuestionnaireById,
  useSubmitResponse,
  QuestionType,
} from "@/services/questionnaire/useQuestionnaire";
import { useAuth } from "@/routes";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import oneDoorLogo from "/assets/eezypos_logo.jpg";
const bgLineName = "/line-nam-bg.png";

const QuestionnairePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: questionnaires, isLoading: isLoadingList } =
    useGetQuestionnaires();
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data: activeQuestionnaire, isLoading: isLoadingDetail } =
    useGetQuestionnaireById(activeId || "");

  const { user } = useAuth();
  const { mutateAsync: submitResponse, isPending: isSubmitting } =
    useSubmitResponse();

  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (questionnaires && questionnaires.length > 0) {
      const active = questionnaires.find((q) => q.isActive);
      if (active) setActiveId(active.id);
    }
  }, [questionnaires]);

  const isLoading = isLoadingList || (activeId && isLoadingDetail);

  if (isLoading || !activeQuestionnaire) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/70 to-primary-900 opacity-90" />
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url(${bgLineName})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Soft floating background lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse delay-1000" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="relative h-28 w-28 mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />
            <div className="absolute inset-0 rounded-full border-4 border-t-white border-r-white/40 animate-spin" />
            <div className="absolute inset-4 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
              <FileText className="text-white animate-bounce" size={32} />
            </div>
          </div>
          <p className="text-white text-2xl font-black tracking-wide animate-pulse uppercase">
            {t("questionnaire.loading") || "กำลังโหลด..."}
          </p>
        </motion.div>
      </div>
    );
  }

  const pages = activeQuestionnaire.pages || [];
  const currentPage = pages[currentPageIdx];
  const progress = ((currentPageIdx + 1) / pages.length) * 100;

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentPageIdx < pages.length - 1) {
      setDirection(1);
      setCurrentPageIdx(currentPageIdx + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const submitData = {
        questionnaireId: activeQuestionnaire.id,
        storeId: user?.user?.storeId,
        answers: Object.entries(answers).map(([qId, val]) => ({
          questionId: qId,
          value: Array.isArray(val) ? val.join(",") : String(val),
        })),
      };

      toast.promise(submitResponse(submitData), {
        loading: t("questionnaire.submitting") || "กำลังส่งข้อมูล...",
        success: () => {
          const storeType = user?.user?.store?.type;

          if (storeType === "GENERAL_STORE") {
            navigate("/saleGeneral");
          } else if (storeType === "CAFE") {
            navigate("/saleCafe");
          } else {
            navigate("/table");
          }

          return t("questionnaire.submitSuccess") || "ส่งข้อมูลสำเร็จ!";
        },
        error: t("questionnaire.submitError") || "เกิดข้อผิดพลาดในการส่งข้อมูล",
      });
    }
  };

  const handleBack = () => {
    if (currentPageIdx > 0) {
      setDirection(-1);
      setCurrentPageIdx(currentPageIdx - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const renderQuestion = (question: any) => {
    const value = answers[question.id];

    const commonProps = {
      label: (
        <span className="text-gray-800 font-extrabold text-base tracking-wide flex items-center gap-2">
          {question.label}
          {question.isRequired && (
            <span className="text-red-500 font-bold">*</span>
          )}
        </span>
      ),
      placeholder: question.placeholder,
      value: value || "",
      onValueChange: (val: any) => handleAnswerChange(question.id, val),
      isRequired: question.isRequired,
      variant: "bordered" as const,
      size: "lg" as const,
      classNames: {
        label: "text-gray-800 font-extrabold text-base tracking-wide",
        input: "text-base font-semibold text-gray-800",
        inputWrapper:
          "border-2 border-gray-100 hover:border-gray-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 bg-white/70 backdrop-blur-md rounded-2xl h-14 transition-all duration-300",
      },
    };

    switch (question.type) {
      case QuestionType.TEXT:
        return <Input {...commonProps} />;
      case QuestionType.TEXTAREA:
        return (
          <Textarea
            {...commonProps}
            minRows={3}
            classNames={{
              ...commonProps.classNames,
              inputWrapper:
                "border-2 border-gray-100 hover:border-gray-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 bg-white/70 backdrop-blur-md rounded-2xl p-4 transition-all duration-300",
            }}
          />
        );
      case QuestionType.NUMBER:
        return <Input {...commonProps} type="number" />;
      case QuestionType.RADIO:
      case QuestionType.SELECT:
        return (
          <RadioGroup
            label={
              <span className="text-gray-800 font-extrabold text-base tracking-wide flex items-center gap-2">
                {question.label}
                {question.isRequired && (
                  <span className="text-red-500 font-bold">*</span>
                )}
              </span>
            }
            value={value}
            onValueChange={(val) => handleAnswerChange(question.id, val)}
            isRequired={question.isRequired}
            classNames={{
              label:
                "text-gray-800 font-extrabold text-base tracking-wide mb-2",
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {question.options?.map((opt: any) => {
                const isSelected = value === opt.value;
                return (
                  <motion.div
                    key={opt.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 bg-white"
                    }`}
                    onClick={() => handleAnswerChange(question.id, opt.value)}
                  >
                    <Radio value={opt.value} size="lg" className="mr-2">
                      <span
                        className={`text-sm font-bold ${
                          isSelected ? "text-primary" : "text-gray-700"
                        }`}
                      >
                        {opt.label}
                      </span>
                    </Radio>
                  </motion.div>
                );
              })}
            </div>
          </RadioGroup>
        );
      case QuestionType.CHECKBOX:
        return (
          <CheckboxGroup
            label={
              <span className="text-gray-800 font-extrabold text-base tracking-wide flex items-center gap-2">
                {question.label}
                {question.isRequired && (
                  <span className="text-red-500 font-bold">*</span>
                )}
              </span>
            }
            value={value || []}
            onValueChange={(val) => handleAnswerChange(question.id, val)}
            isRequired={question.isRequired}
            classNames={{
              label:
                "text-gray-800 font-extrabold text-base tracking-wide mb-2",
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {question.options?.map((opt: any) => {
                const isSelected = (value || []).includes(opt.value);
                return (
                  <motion.div
                    key={opt.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 bg-white"
                    }`}
                    onClick={() => {
                      const current = value || [];
                      const next = current.includes(opt.value)
                        ? current.filter((v: any) => v !== opt.value)
                        : [...current, opt.value];
                      handleAnswerChange(question.id, next);
                    }}
                  >
                    <Checkbox value={opt.value} size="lg" className="mr-2">
                      <span
                        className={`text-sm font-bold ${
                          isSelected ? "text-primary" : "text-gray-700"
                        }`}
                      >
                        {opt.label}
                      </span>
                    </Checkbox>
                  </motion.div>
                );
              })}
            </div>
          </CheckboxGroup>
        );
      case QuestionType.DATE:
        return (
          <Input
            {...commonProps}
            type="date"
            classNames={{
              ...commonProps.classNames,
              input:
                "text-base font-semibold text-gray-800 placeholder-transparent",
            }}
          />
        );
      default:
        return null;
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col selection:bg-primary/20 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] opacity-70 pointer-events-none" />

      {/* Header section */}
      <div className="h-[35vh] bg-primary relative flex items-center justify-center px-6 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: `url(${bgLineName})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/50 via-primary to-primary-900/95" />

        {/* Dynamic header elements */}
        <div className="absolute -top-10 left-10 w-44 h-44 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 right-10 w-64 h-64 bg-black/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-white max-w-4xl w-full text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="p-3 bg-white/10 backdrop-blur-2xl rounded-3xl mb-5 shadow-2xl border border-white/20 ring-1 ring-white/10"
          >
            <Image
              src={oneDoorLogo}
              className="w-40 h-40 rounded-2xl object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="space-y-3"
          >
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight  drop-shadow-sm">
              {activeQuestionnaire.title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Main card viewport */}
      <div className="flex-1 -mt-20 px-4 pb-28 relative z-20">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-[0_24px_70px_rgba(0,0,0,0.06)] border border-white bg-white/95 backdrop-blur-md rounded-[2.5rem]">
            <CardBody className="p-0">
              {/* Progress Section */}
              <div className="p-8 pb-6 space-y-5">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {t("questionnaire.completionStatus") || "ความคืบหน้า"}
                    </p>
                    <h3 className="text-3xl font-black text-primary flex items-baseline">
                      {Math.round(progress)}
                      <span className="text-sm ml-1 font-bold text-slate-400">
                        %
                      </span>
                    </h3>
                  </div>
                  <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {t("questionnaire.phase") || "ส่วนที่"}
                    </p>
                    <p className="text-sm font-extrabold text-slate-700">
                      {currentPageIdx + 1}{" "}
                      <span className="text-xs font-medium text-slate-400">
                        {t("questionnaire.of") || "จาก"}
                      </span>{" "}
                      {pages.length}
                    </p>
                  </div>
                </div>

                {/* Custom glowing progress bar */}
                <div className="relative h-3 bg-slate-100 rounded-full overflow-visible">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-primary rounded-full shadow-md shadow-primary/20"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-3 border-primary rounded-full shadow-md animate-ping pointer-events-none" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-3 border-primary rounded-full shadow-md pointer-events-none" />
                  </motion.div>
                </div>
              </div>

              <div className="h-[2px] bg-gradient-to-r from-transparent via-slate-100 to-transparent w-full" />

              <div className="p-8 space-y-8">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentPageIdx}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                    className="space-y-8"
                  >
                    <div className="space-y-2 border-l-4 border-primary pl-4">
                      <h2 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
                        {currentPage?.title}
                      </h2>
                      {currentPage?.description && (
                        <p className="text-slate-500 text-base font-semibold leading-relaxed">
                          {currentPage?.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-8">
                      {currentPage?.questions?.map((q: any, idx: number) => (
                        <motion.div
                          key={q.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.08, duration: 0.3 }}
                          className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 hover:border-slate-200/80 hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300"
                        >
                          {renderQuestion(q)}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </CardBody>
          </Card>

          {/* Action button deck */}
          <div className="mt-8 flex items-center justify-between gap-4 px-2">
            {currentPageIdx > 0 ? (
              <Button
                variant="flat"
                onPress={handleBack}
                startContent={
                  <ChevronLeft
                    size={18}
                    className="transition-transform group-hover:-translate-x-1"
                  />
                }
                size="lg"
                className="group font-bold text-slate-600 bg-white hover:bg-slate-100 transition-all h-14 px-6 rounded-2xl border border-slate-200 shadow-sm"
              >
                {t("common.back") || "ย้อนกลับ"}
              </Button>
            ) : (
              <div />
            )}

            <div className="flex-1 max-w-[320px] flex items-center gap-3">
              {currentPageIdx < pages.length - 1 && (
                <Button
                  variant="light"
                  onPress={handleNext}
                  size="lg"
                  className="flex-1 h-14 font-extrabold text-slate-400 hover:text-slate-600 transition-colors rounded-2xl"
                >
                  {t("common.skip") || "ข้าม"}
                </Button>
              )}
              <Button
                color="primary"
                onPress={handleNext}
                isLoading={isSubmitting}
                endContent={
                  currentPageIdx === pages.length - 1 ? (
                    <ClipboardCheck size={20} className="animate-pulse" />
                  ) : (
                    <ChevronRight size={20} />
                  )
                }
                size="lg"
                className="flex-[2] h-14 font-black text-base rounded-2xl shadow-lg shadow-primary/20 hover:opacity-95 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                {currentPageIdx === pages.length - 1
                  ? t("questionnaire.completed") || "เสร็จสิ้น"
                  : t("common.next") || "ถัดไป"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating high-end deck step dots */}
      <div className="fixed bottom-6 left-0 w-full flex justify-center gap-2.5 z-40 pointer-events-auto">
        <div className="flex items-center gap-2 px-5 py-3.5 bg-white/70 backdrop-blur-xl rounded-full border border-white shadow-xl shadow-slate-200/50">
          {pages.map((_: any, i: number) => {
            const isActive = i === currentPageIdx;
            const isCompleted = i < currentPageIdx;
            return (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  width: isActive ? 24 : 10,
                  height: 10,
                  backgroundColor: isActive
                    ? "var(--primary, #028dfd)"
                    : isCompleted
                      ? "var(--primary-400, #3fa6ff)"
                      : "rgba(0,0,0,0.12)",
                }}
                className="rounded-full cursor-pointer transition-all shadow-inner"
                onClick={() => {
                  setDirection(i > currentPageIdx ? 1 : -1);
                  setCurrentPageIdx(i);
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionnairePage;
