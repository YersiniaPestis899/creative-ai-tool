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
      modelId: "stability.sd3-large-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        prompt: prompt,
        mode: "text-to-image",
        aspect_ratio: "1:1",
        output_format: "jpeg"
      })
    };

    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    
    // Parse the response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Convert the base64 image to a data URL
    const imageBase64 = responseBody.image;
    const imageUrl = `data:image/jpeg;base64,${imageBase64}`;
    
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