import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export enum QuestionType {
  TEXT = "TEXT",
  TEXTAREA = "TEXTAREA",
  NUMBER = "NUMBER",
  SELECT = "SELECT",
  RADIO = "RADIO",
  CHECKBOX = "CHECKBOX",
  DATE = "DATE",
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  order: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  placeholder?: string;
  isRequired: boolean;
  order: number;
  options?: QuestionOption[];
}

export interface QuestionnairePage {
  id: string;
  title?: string;
  description?: string;
  order: number;
  questions: Question[];
}

export interface Questionnaire {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  pages?: QuestionnairePage[];
}

export interface SubmitAnswer {
  questionId: string;
  value?: string;
}

export interface SubmitResponseInput {
  questionnaireId: string;
  storeId?: string;
  answers: SubmitAnswer[];
}

export const getQuestionnaires = async (): Promise<Questionnaire[]> => {
  const response = await axiosInstance.get(API_ENDPOINTS.QUESTIONNAIRE.LIST);
  return response.data.data;
};

export const getQuestionnaireById = async (id: string): Promise<Questionnaire> => {
  const response = await axiosInstance.get(API_ENDPOINTS.QUESTIONNAIRE.DETAIL(id));
  return response.data.data;
};

export const submitQuestionnaireResponse = async (data: SubmitResponseInput) => {
  const response = await axiosInstance.post(API_ENDPOINTS.QUESTIONNAIRE.SUBMIT, data);
  return response.data.data;
};

export const checkQuestionnaireCompletion = async (data: { storeId: string }) => {
  const response = await axiosInstance.post(`${API_ENDPOINTS.QUESTIONNAIRE.LIST}/check-completion`, data);
  return response.data.data;
};

export const useGetQuestionnaires = () => {
  return useQuery({
    queryKey: ["questionnaires"],
    queryFn: getQuestionnaires,
  });
};

export const useGetQuestionnaireById = (id: string) => {
  return useQuery({
    queryKey: ["questionnaire", id],
    queryFn: () => getQuestionnaireById(id),
    enabled: !!id,
  });
};

export const useSubmitResponse = () => {
  return useMutation({
    mutationFn: submitQuestionnaireResponse,
  });
};
