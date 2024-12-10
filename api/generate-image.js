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
    const { prompt } = req.body;

    const input = {
      modelId: "stability.stable-diffusion-xl",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1.0
          }
        ],
        cfg_scale: 7,
        seed: Math.floor(Math.random() * 100000),
        steps: 50,
        width: 512,
        height: 512
      })
    };

    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    
    // Parse the response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Convert the base64 image to a data URL
    const imageBase64 = responseBody.artifacts[0].base64;
    const imageUrl = `data:image/png;base64,${imageBase64}`;
    
    res.status(200).json({ 
      success: true, 
      data: imageUrl
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.stack 
    });
  }
}