import Joi from 'joi';

export type CreateAICompanionRequest = {
    companionCode: string;
};

export const CreateAICompanionRequestSchema = Joi.object<CreateAICompanionRequest>({
    companionCode: Joi.string().required().messages({
        'string.base': 'Companion Code must be a string',
        'any.required': 'Companion Code is required',
    }),
});

export type CreateAICompanionResponse = {
    message: string;
};

export type SaveAICompanionMessageRequest = {
    companionCode: string;
    content: string;
    sender: 'user' | 'companion';
};

export const SaveAICompanionMessageRequestSchema = Joi.object<SaveAICompanionMessageRequest>({
    companionCode: Joi.string().required().messages({
        'string.base': 'Companion Code must be a string',
        'any.required': 'Companion Code is required',
    }),
    content: Joi.string().required().messages({
        'string.base': 'Content must be a string',
        'any.required': 'Content is required',
    }),
    sender: Joi.string().valid('user', 'companion').required().messages({
        'string.base': 'Sender must be a string',
        'any.only': 'Sender must be either "user" or "companion"',
        'any.required': 'Sender is required',
    }),
});

export type SaveAICompanionMessageResponse = {
    message: string;
};

export type GetAICompanionChatHistoryRequest = {
    companionCode: string;
};

export const GetAICompanionChatHistoryRequestSchema = Joi.object<GetAICompanionChatHistoryRequest>({
    companionCode: Joi.string().required().messages({
        'string.base': 'Companion Code must be a string',
        'any.required': 'Companion Code is required',
    }),
});

export type ChatMessage = {
    content: string;
    sender: 'user' | 'companion';
    timestamp: Date;
};

export type GetAICompanionChatHistoryResponse = ChatMessage[];
