import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export interface AIConfig {
    provider: string;
    model: string;
    apiKey?: string | undefined;
    baseUrl?: string | undefined;
}

export class AIService {
    private static instance: AIService;

    private constructor() { }

    public static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }

    async generateResponse(systemPrompt: string, userMessage: string, config: AIConfig): Promise<string> {
        console.log(`[AI] Generando respuesta con ${config.provider} (${config.model})...`);
        try {
            switch (config.provider) {
                case 'ollama':
                    return await this.callOllama(systemPrompt, userMessage, config);
                case 'groq':
                    return await this.callGroq(systemPrompt, userMessage, config);
                case 'openai':
                    return await this.callOpenAI(systemPrompt, userMessage, config);
                default:
                    return await this.callOllama(systemPrompt, userMessage, config); // Fallback
            }
        } catch (error) {
            console.error(`[AI Error]`, error);
            return "Lo siento, tuve un problema procesando tu mensaje. ¿Podrías repetirlo en unos momentos?";
        }
    }

    private async callOllama(system: string, user: string, config: AIConfig) {
        const url = config.baseUrl || 'http://localhost:11434/api/generate';
        const { data } = await axios.post(url, {
            model: config.model || 'qwen2.5:3b',
            system: system,
            prompt: user,
            stream: false
        });
        return data.response;
    }

    private async callGroq(system: string, user: string, config: AIConfig) {
        const apiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY;
        const { data } = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: config.model || process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
            messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
            max_tokens: 400,
            temperature: 0.3,
        }, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        return data.choices[0].message.content;
    }

    private async callOpenAI(system: string, user: string, config: AIConfig) {
        const { data } = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: config.model,
            messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
        }, {
            headers: { 'Authorization': `Bearer ${process.env.AI_API_KEY}` }
        });
        return data.choices[0].message.content;
    }
}
