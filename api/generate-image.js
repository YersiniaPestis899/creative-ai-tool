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
        negative_prompt: "nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
        mode: "text-to-image",
        seed: Math.floor(Math.random() * 100000),
        output_format: "jpeg",
        aspect_ratio: "1:1"
      })
    };

    console.log('Sending request to Bedrock:', input);
    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    
    // Parse the response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log('Raw response from Bedrock:', responseBody);

    if (!responseBody.images || responseBody.images.length === 0) {
      throw new Error('No image generated');
    }

    // 最初の画像を返す
    res.status(200).json({ 
      success: true, 
      data: responseBody.images[0]
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