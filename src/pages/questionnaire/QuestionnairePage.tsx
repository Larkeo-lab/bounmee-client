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
import { ChevronLeft, ChevronRight, ClipboardCheck, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetQuestionnaires, useGetQuestionnaireById, useSubmitResponse, QuestionType } from "@/services/questionnaire/useQuestionnaire";
import { useAuth } from "@/routes";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import oneDoorLogo from "/assets/logo.png";
const bgLineName = "/line-nam-bg.png";

const QuestionnairePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: questionnaires, isLoading: isLoadingList } = useGetQuestionnaires();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const { data: activeQuestionnaire, isLoading: isLoadingDetail } = useGetQuestionnaireById(activeId || "");
  
  const { user } = useAuth();
  const { mutateAsync: submitResponse, isPending: isSubmitting } = useSubmitResponse();
  
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (questionnaires && questionnaires.length > 0) {
      const active = questionnaires.find(q => q.isActive);
      if (active) setActiveId(active.id);
    }
  }, [questionnaires]);

  const isLoading = isLoadingList || (activeId && isLoadingDetail);

  if (isLoading || !activeQuestionnaire) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-600 to-black/20" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="relative h-24 w-24 mb-6">
             <div className="absolute inset-0 rounded-full border-4 border-white/20" />
             <div className="absolute inset-0 rounded-full border-4 border-t-white animate-spin" />
          </div>
          <p className="text-white text-xl font-medium tracking-wide animate-pulse">
            {t("questionnaire.loading")}
          </p>
        </motion.div>
      </div>
    );
  }

  const pages = activeQuestionnaire.pages || [];
  const currentPage = pages[currentPageIdx];
  const progress = ((currentPageIdx + 1) / pages.length) * 100;

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentPageIdx < pages.length - 1) {
      setDirection(1);
      setCurrentPageIdx(currentPageIdx + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const submitData = {
        questionnaireId: activeQuestionnaire.id,
        storeId: user?.user?.storeId,
        answers: Object.entries(answers).map(([qId, val]) => ({
          questionId: qId,
          value: Array.isArray(val) ? val.join(",") : String(val)
        }))
      };
      
      toast.promise(
        submitResponse(submitData),
        {
          loading: t("questionnaire.submitting"),
          success: () => {
            const storeType = user?.user?.store?.type;

            if (storeType === "GENERAL_STORE") {
              navigate("/saleGeneral");
            } else if (storeType === "CAFE") {
              navigate("/saleCafe");
            } else {
              navigate("/table");
            }

            return t("questionnaire.submitSuccess");
          },
          error: t("questionnaire.submitError"),
        }
      );
    }
  };

  const handleBack = () => {
    if (currentPageIdx > 0) {
      setDirection(-1);
      setCurrentPageIdx(currentPageIdx - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate("/login");
    }
  };

  const renderQuestion = (question: any) => {
    const value = answers[question.id];

    const commonProps = {
      label: question.label,
      placeholder: question.placeholder,
      value: value || "",
      onValueChange: (val: any) => handleAnswerChange(question.id, val),
      isRequired: question.isRequired,
      variant: "bordered" as const,
      size: "lg" as const,
      classNames: {
        label: "text-lg font-semibold text-gray-700",
        input: "text-base",
        inputWrapper: "border-2 border-gray-200 group-data-[focus=true]:border-primary transition-all duration-300",
      }
    };

    switch (question.type) {
      case QuestionType.TEXT:
        return <Input {...commonProps} />;
      case QuestionType.TEXTAREA:
        return <Textarea {...commonProps} minRows={3} />;
      case QuestionType.NUMBER:
        return <Input {...commonProps} type="number" />;
      case QuestionType.RADIO:
      case QuestionType.SELECT:
        return (
          <RadioGroup
            label={question.label}
            value={value}
            onValueChange={(val) => handleAnswerChange(question.id, val)}
            isRequired={question.isRequired}
            classNames={{
              label: "text-lg font-semibold text-gray-700 mb-2",
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {question.options?.map((opt: any) => (
                <div 
                  key={opt.id}
                  className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    value === opt.value 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleAnswerChange(question.id, opt.value)}
                >
                  <Radio value={opt.value} size="lg">{opt.label}</Radio>
                </div>
              ))}
            </div>
          </RadioGroup>
        );
      case QuestionType.CHECKBOX:
        return (
          <CheckboxGroup
            label={question.label}
            value={value || []}
            onValueChange={(val) => handleAnswerChange(question.id, val)}
            isRequired={question.isRequired}
            classNames={{
              label: "text-lg font-semibold text-gray-700 mb-2",
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {question.options?.map((opt: any) => (
                <div 
                  key={opt.id}
                  className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    (value || []).includes(opt.value)
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    const current = value || [];
                    const next = current.includes(opt.value)
                      ? current.filter((v: any) => v !== opt.value)
                      : [...current, opt.value];
                    handleAnswerChange(question.id, next);
                  }}
                >
                  <Checkbox value={opt.value} size="lg">{opt.label}</Checkbox>
                </div>
              ))}
            </div>
          </CheckboxGroup>
        );
      case QuestionType.DATE:
        return <Input {...commonProps} type="date" />;
      default:
        return null;
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-primary/20">
      {/* Header with improved aesthetics */}
      <div 
        className="h-[30vh] bg-primary relative flex items-center justify-center px-6 overflow-hidden"
      >
        <div 
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: `url(${bgLineName})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary to-primary-900" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-black/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative z-10 flex flex-col items-center text-white max-w-4xl w-full">
           <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="p-4 bg-white/10 backdrop-blur-xl rounded-[2rem] mb-6 shadow-2xl border border-white/20 ring-1 ring-white/30"
           >
             <Image src={oneDoorLogo} className="w-14" />
           </motion.div>
           <motion.div
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.1 }}
             className="text-center space-y-2"
           >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles size={16} className="text-yellow-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary-200">{t("questionnaire.subtitle")}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none italic">
                {activeQuestionnaire.title}
              </h1>
           </motion.div>
        </div>
      </div>

      <div className="flex-1 -mt-16 px-4 pb-24 relative z-20">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-none overflow-visible rounded-[2.5rem]">
            <CardBody className="p-0">
               {/* Progress Section */}
               <div className="p-8 pb-4 space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("questionnaire.completionStatus")}</p>
                      <h3 className="text-2xl font-black text-primary">
                        {Math.round(progress)}<span className="text-sm ml-0.5">%</span>
                      </h3>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t("questionnaire.phase")}</p>
                       <p className="text-base font-bold text-gray-600">{currentPageIdx + 1} {t("questionnaire.of")} {pages.length}</p>
                    </div>
                  </div>
                  <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                  </div>
               </div>
               
               <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent w-full" />

               <div className="p-8 space-y-10">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={currentPageIdx}
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="space-y-10"
                    >
                      <div className="space-y-2">
                        <h2 className="text-3xl font-black text-gray-900 leading-tight">
                          {currentPage?.title}
                        </h2>
                        {currentPage?.description && (
                          <p className="text-gray-500 text-lg leading-relaxed">
                            {currentPage?.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-10">
                        {currentPage?.questions?.map((q: any, idx: number) => (
                          <motion.div 
                            key={q.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group"
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

          <div className="mt-8 flex items-center justify-between gap-6 px-2">
            <Button
              variant="light"
              onPress={handleBack}
              startContent={<ChevronLeft size={20} />}
              size="lg"
              className="font-bold text-gray-400 hover:text-primary transition-colors h-14 px-6 rounded-2xl border-2 border-transparent hover:border-primary/20"
            >
              {currentPageIdx === 0 ? t("auth.backToLogin") : t("common.back")}
            </Button>
            
            <div className="flex-1 max-w-[200px]">
              <Button
                color="primary"
                onPress={handleNext}
                isLoading={isSubmitting}
                endContent={currentPageIdx === pages.length - 1 ? <ClipboardCheck size={20} /> : <ChevronRight size={20} />}
                size="lg"
                className="w-full h-14 font-black text-lg rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {currentPageIdx === pages.length - 1 ? t("questionnaire.completed") : t("common.next")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Premium Step Indicator */}
      <div className="fixed bottom-0 left-0 w-full p-8 flex justify-center gap-3 z-50">
         {pages.map((_: any, i: number) => (
           <motion.div 
             key={i} 
             initial={false}
             animate={{ 
               width: i === currentPageIdx ? 40 : 10,
               backgroundColor: i === currentPageIdx ? 'var(--primary, #0070f3)' : 'rgba(0,0,0,0.1)'
             }}
             className="h-2 rounded-full cursor-pointer shadow-sm"
             onClick={() => {
               setDirection(i > currentPageIdx ? 1 : -1);
               setCurrentPageIdx(i);
             }}
           />
         ))}
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .bg-primary-900 { background-color: #004d9a; }
        .bg-primary-600 { background-color: #0070f3; }
        .text-primary-200 { color: #bfdbfe; }
      `}</style>
    </div>
  );
};

export default QuestionnairePage;
