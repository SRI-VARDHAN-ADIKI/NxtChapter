import axios from 'axios';

const JDOODLE_API_URL = 'https://api.jdoodle.com/v1/execute';

const getLanguageConfig = (language) => {
  switch (language) {
    case 'javascript': return { language: 'nodejs', versionIndex: '4' };
    case 'python': return { language: 'python3', versionIndex: '4' };
    case 'java': return { language: 'java', versionIndex: '4' };
    case 'cpp': return { language: 'cpp', versionIndex: '5' };
    case 'c': return { language: 'c', versionIndex: '5' };
    default: return { language: 'nodejs', versionIndex: '4' };
  }
};

/**
 * Executes student code against a set of test cases using JDoodle API.
 * 
 * @param {string} code - The student's code.
 * @param {string} language - The programming language ('javascript', 'python', 'cpp', etc)
 * @param {Array} testCases - Array of test case objects { input, expectedOutput, isHidden }
 * @returns {Array} - Array of results
 */
export const executeInSandbox = async (code, language, testCases) => {
  const langConfig = getLanguageConfig(language);

  // Use Promise.all to run all test cases in parallel for speed
  const promises = testCases.map(async (tc) => {
    try {
      // All languages now read from standard input (stdin)
      // This allows students to write full programs starting from a blank slate.
      let script = code;
      let stdin = tc.input;

      // 2. Call JDoodle API
      const response = await axios.post(JDOODLE_API_URL, {
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script: script,
        language: langConfig.language,
        versionIndex: langConfig.versionIndex,
        stdin: stdin
      });

      const output = (response.data.output || "").trim();
      const cpuTime = response.data.cpuTime;
      const memory = response.data.memory;

      // JDoodle returns errors in the output string often
      let actualOutputString = output;
      
      // 3. Compare actual vs expected
      let passed = false;
      try {
        // Try JSON parsing first for strict comparison of objects/arrays
        const expected = JSON.parse(tc.expectedOutput);
        const actual = JSON.parse(output);
        passed = JSON.stringify(expected) === JSON.stringify(actual);
      } catch (e) {
        // Fallback to string comparison (stripping whitespace)
        passed = output.replace(/\s+/g, '') === tc.expectedOutput.replace(/\s+/g, '');
      }

      return {
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: actualOutputString,
        passed,
        isHidden: tc.isHidden,
        cpuTime,
        memory
      };
    } catch (error) {
      console.error('JDoodle API Error:', error.message);
      return {
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: 'Execution Error: ' + (error.response?.data?.output || error.message),
        passed: false,
        isHidden: tc.isHidden
      };
    }
  });

  return await Promise.all(promises);
};

