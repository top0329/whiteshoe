require('dotenv').config();
const axios = require('axios');

const testOpenAI = async () => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_OPENAI_API_URL}`, // Make sure this points to the correct chat endpoint
      {
        model: 'gpt-4', // Specify the chat model here
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello, world!' }
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('OpenAI Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};

testOpenAI();
