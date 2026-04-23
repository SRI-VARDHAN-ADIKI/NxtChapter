import axios from 'axios';

async function testPiston() {
  try {
    const res = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: 'python',
      version: '*',
      files: [{ content: 'print("hello")' }],
    });
    console.log('Success:', res.data.run.stdout);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) console.error(err.response.data);
  }
}

testPiston();
