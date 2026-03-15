const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StructuredOutputParser } = require('langchain/output_parsers');
const { RunnableSequence } = require('@langchain/core/runnables');
const { z } = require('zod');

// Initialize Gemini Chat Model
const model = new ChatGoogleGenerativeAI({
    modelName: 'gemini-pro',
    maxOutputTokens: 2048,
    apiKey: process.env.GEMINI_API_KEY,
});

// --- Schema Definitions for Structured Output ---

// Quiz Evaluation Schema
const evaluationSchema = z.object({
    correct: z.boolean().describe("Whether the student's answer is correct"),
    explanation: z.string().describe("A helpful explanation of why the answer is correct or incorrect"),
    suggested_focus: z.string().optional().describe("A short topic name to focus on if incorrect")
});

// Quiz Generation Schema
const questionSchema = z.object({
    question: z.string().describe("The text of the multiple choice question"),
    options: z.array(z.string()).length(4).describe("An array of exactly 4 answer options"),
    answer: z.string().describe("The correct option string, must exactly match one of the options")
});

// --- Service Methods ---

exports.evaluateAnswer = async (question, userAnswer) => {
    const parser = StructuredOutputParser.fromZodSchema(evaluationSchema);

    const chain = RunnableSequence.from([
        PromptTemplate.fromTemplate(
            "You are an expert coding tutor. Evaluate this student answer.\nQuestion: {question}\nStudent Answer: {answer}\n\n{format_instructions}"
        ),
        model,
        parser,
    ]);

    try {
        const response = await chain.invoke({
            question: question,
            answer: userAnswer,
            format_instructions: parser.getFormatInstructions(),
        });
        return response;
    } catch (error) {
        console.error("AI Eval Error:", error);
        // Fallback if parsing fails
        return { correct: false, explanation: "AI Error evaluating response. Please try again." };
    }
};

exports.generateQuestion = async (topic, difficulty) => {
    const parser = StructuredOutputParser.fromZodSchema(questionSchema);

    const chain = RunnableSequence.from([
        PromptTemplate.fromTemplate(
            "Generate a coding multiple choice question about {topic}.\nDifficulty Level: {difficulty}/10 (1 is basic, 10 is expert).\nEnsure the question is technical and specific.\n\n{format_instructions}"
        ),
        model,
        parser,
    ]);

    try {
        const response = await chain.invoke({
            topic: topic,
            difficulty: difficulty,
            format_instructions: parser.getFormatInstructions(),
        });
        return response;
    } catch (error) {
        console.error("AI Gen Error:", error);
        throw new Error("Failed to generate valid question");
    }
};

exports.chatWithTutor = async (history, userMessage, codeContext) => {
    // Simple chat chain
    const context = codeContext ? `\nContext Code:\n${codeContext}` : "";

    const prompt = `You are a helpful coding tutor in the NxtChapter platform. 
  Answer the student's question clearly and concisely. 
  If code is provided, refer to it.
  
  ${context}
  
  Student: ${userMessage}
  Tutor:`;

    const result = await model.invoke(prompt);
    return result.content;
};
