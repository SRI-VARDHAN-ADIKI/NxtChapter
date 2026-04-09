async function verifyQuizEndpoint() {
  try {
    // 1. Login to get a token
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@nxtchapter.com', password: 'admin123' })
    });
    const { token } = await loginRes.json();
    console.log('Login successful');

    const topicId = "69d7cfaef14ed82f292e729b";

    console.log(`Testing Quiz for topic: ${topicId}`);
    const quizRes = await fetch('http://localhost:5000/api/quiz/start', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ topicId })
    });

    const data = await quizRes.json();
    if (data.error) throw new Error(data.error);

    console.log('--- QUIZ GENERATED SUCCESSFULLY ---');
    console.log('Question:', data.question.questionText);
    data.question.options.forEach((opt, i) => console.log(`  ${i+1}. ${opt}`));
  } catch (err) {
    console.error('Verify Error:', err.message);
  }
}

verifyQuizEndpoint();
