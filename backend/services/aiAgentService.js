import 'dotenv/config'; // <-- FIX: Forces the .env file to load immediately
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers"; // <-- FIX: Updated path

// 1. Define the exact JSON structure we want back from Gemini for final evaluation
const parser = StructuredOutputParser.fromNamesAndDescriptions({
  overallScore: "A float between 0.0 and 1.0 representing the overall correctness and efficiency of the code.",
  conceptMastery: "Integer from 0 to 100 representing understanding of the core concepts.",
  syntaxAccuracy: "Integer from 0 to 100 representing code syntax correctness.",
  testCasesPassed: "Integer representing how many of the provided test cases the code would pass.",
  totalTestCases: "Integer representing the total number of provided test cases.",
  weakPoints: "An array of 1 to 3 specific strings listing topics the student struggled with. Leave empty if perfect.",
  feedback: "A short, encouraging 2-sentence feedback for the student."
});

// 1.5 Define JSON structure for local test case execution
import { z } from "zod";
const localTestParser = StructuredOutputParser.fromZodSchema(
  z.array(
    z.object({
      input: z.string().describe("The test case input"),
      expectedOutput: z.string().describe("The expected output"),
      actualOutput: z.string().describe("What the student's code actually outputted, or an error message"),
      passed: z.boolean().describe("True if actualOutput matches expectedOutput")
    })
  )
);

// 2. Setup the AI Model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
  maxOutputTokens: 2048,
});

// 3. Create the Prompt Template
const promptTemplate = new PromptTemplate({
  template: `You are an expert computer science tutor evaluating a student's submission for an adaptive learning platform.
  
  Question Title: {questionTitle}
  Question Description: {questionDescription}
  
  Test Cases (JSON array of objects with 'input' and 'expectedOutput'):
  {testCases}
  
  Student's Code Submission:
  {studentCode}
  
  Evaluate the code strictly and fairly. Dry-run the student's code against the provided Test Cases. Determine how many test cases the code would pass successfully.
  
  {format_instructions}`,
  inputVariables: ["questionTitle", "questionDescription", "testCases", "studentCode"],
  partialVariables: { format_instructions: parser.getFormatInstructions() }
});

// 4. The main function to call from your controller
export const evaluateSubmissionCode = async (questionTitle, questionDescription, testCases, studentCode) => {
  try {
    const formattedPrompt = await promptTemplate.format({
      questionTitle,
      questionDescription,
      testCases: JSON.stringify(testCases, null, 2),
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

// 5. Run Local Tests Function
const localTestPromptTemplate = new PromptTemplate({
  template: `You are an execution engine. Dry-run the student's code strictly against the provided Test Cases.
  
  Student's Code:
  {studentCode}
  
  Test Cases (JSON array):
  {testCases}
  
  Determine exactly what the code would output for each input. If there is a syntax error, state the error in 'actualOutput'.
  
  {format_instructions}`,
  inputVariables: ["studentCode", "testCases"],
  partialVariables: { format_instructions: localTestParser.getFormatInstructions() }
});

export const runLocalTests = async (testCases, studentCode) => {
  try {
    const formattedPrompt = await localTestPromptTemplate.format({
      testCases: JSON.stringify(testCases, null, 2),
      studentCode
    });
    
    const response = await model.invoke(formattedPrompt);
    const parsedOutput = await localTestParser.parse(response.content);
    
    return parsedOutput;
  } catch (error) {
    console.error("AI Local Test Error:", error);
    throw new Error("Failed to run local tests using AI.");
  }
};