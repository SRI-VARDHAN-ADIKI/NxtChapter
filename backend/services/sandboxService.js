import vm from 'vm';

/**
 * Executes student code against a set of test cases using Node's native VM module.
 * This provides deterministic, lightning-fast, real execution instead of AI hallucination.
 * 
 * @param {string} code - The student's JavaScript code.
 * @param {string} language - The programming language (ignored, defaults to javascript)
 * @param {Array} testCases - Array of test case objects { input, expectedOutput, isHidden }
 * @returns {Array} - Array of results { input, expectedOutput, actualOutput, passed, isHidden }
 */
export const executeInSandbox = async (code, language, testCases) => {
  const results = [];

  for (const tc of testCases) {
    try {
      const sandbox = {
        console: { log: () => {} },
      };
      vm.createContext(sandbox);

      const executableCode = `
        ${code}
        solve(${tc.input});
      `;

      const rawResult = vm.runInContext(executableCode, sandbox, { timeout: 2000 });
      let actualOutputString = rawResult !== undefined ? JSON.stringify(rawResult) : "undefined";
      
      let passed = false;
      try {
        passed = JSON.stringify(JSON.parse(tc.expectedOutput)) === JSON.stringify(rawResult);
      } catch (e) {
        passed = actualOutputString.replace(/\s+/g, '') === tc.expectedOutput.replace(/\s+/g, '');
      }

      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: actualOutputString,
        passed,
        isHidden: tc.isHidden
      });
    } catch (error) {
      let errorMessage = error.toString();
      if (error.message.includes('timeout')) errorMessage = 'Execution Timeout (Infinite Loop Detected)';
      else if (error.message.includes('solve is not defined')) errorMessage = 'ReferenceError: You must define a function named `solve`.';

      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: errorMessage,
        passed: false,
        isHidden: tc.isHidden
      });
    }
  }

  return results;
};
