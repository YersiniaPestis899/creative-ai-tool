import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    console.log('Received image generation request:', req.body);
    const { prompt } = req.body;

    const input = {
      modelId: "stability.sd3-large-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        prompt: prompt,
        size: 1024,
        steps: 50,
        cfg_scale: 7,
        style: "anime"
      })
    };

    console.log('Sending request to Bedrock:', input);
    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    
    // Parse the response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log('Raw response from Bedrock:', responseBody);

    // 画像データを直接返す
    res.status(200).json({ 
      success: true, 
      data: responseBody.image
    });
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.stack 
    });
  }
}