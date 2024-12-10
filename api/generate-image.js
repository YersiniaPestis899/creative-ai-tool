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
        prompt,
        mode: "text-to-image",
        aspect_ratio: "1:1",
        output_format: "jpeg"
      })
    };

    console.log('Sending request to Bedrock:', input);
    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    
    // Parse the response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log('Received response from Bedrock:', {
      success: responseBody.artifacts !== undefined,
      hasImage: responseBody.artifacts && responseBody.artifacts.length > 0,
      firstArtifact: responseBody.artifacts && responseBody.artifacts[0]
    });

    // SD3のレスポンスから正しくbase64データを取得
    const base64Image = responseBody.artifacts[0]?.base64;
    
    if (!base64Image) {
      throw new Error('No image data in response');
    }

    // Base64データを直接返す（data:image/jpeg;base64, プレフィックスなし）
    res.status(200).json({ 
      success: true, 
      data: base64Image
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