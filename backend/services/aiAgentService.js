import 'dotenv/config'; // <-- FIX: Forces the .env file to load immediately
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers"; // <-- FIX: Updated path

// 1. Define the exact JSON structure we want back from Gemini
const parser = StructuredOutputParser.fromNamesAndDescriptions({
  overallScore: "A float between 0.0 and 1.0 representing the overall correctness and efficiency of the code.",
  conceptMastery: "Integer from 0 to 100 representing understanding of the core concepts.",
  syntaxAccuracy: "Integer from 0 to 100 representing code syntax correctness.",
  weakPoints: "An array of 1 to 3 specific strings listing topics the student struggled with. Leave empty if perfect.",
  feedback: "A short, encouraging 2-sentence feedback for the student."
});

// 2. Setup the AI Model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash", // <-- FIX: Updated property name
  apiKey: process.env.GEMINI_API_KEY, // <-- FIX: Explicitly telling it which key to use
  maxOutputTokens: 2048,
});

// 3. Create the Prompt Template
const promptTemplate = new PromptTemplate({
  template: `You are an expert computer science tutor evaluating a student's submission for an adaptive learning platform.
  
  Question Title: {questionTitle}
  Question Description: {questionDescription}
  
  Student's Code Submission:
  {studentCode}
  
  Evaluate the code strictly and fairly. 
  
  {format_instructions}`,
  inputVariables: ["questionTitle", "questionDescription", "studentCode"],
  partialVariables: { format_instructions: parser.getFormatInstructions() }
});

// 4. The main function to call from your controller
export const evaluateSubmissionCode = async (questionTitle, questionDescription, studentCode) => {
  try {
    const formattedPrompt = await promptTemplate.format({
      questionTitle,
      questionDescription,
      studentCode
    });
    
    const response = await model.invoke(formattedPrompt);
    const parsedOutput = await parser.parse(response.content);
    
    return parsedOutput;
  } catch (error) {
    console.error("AI Evaluation Error:", error);
    throw new Error("Failed to evaluate code using AI.");
  }
};