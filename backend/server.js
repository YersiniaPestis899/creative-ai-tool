import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Routes
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, type } = req.body;
    
    const message = await anthropic.messages.create({
      model: "anthropic.claude-3-5-sonnet-20241022-v2:0",
      max_tokens: 200000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    res.json({ 
      success: true, 
      data: message.content[0].text 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});