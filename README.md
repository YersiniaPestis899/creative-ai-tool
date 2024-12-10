# AI Creative Collaboration Tool

A powerful AI-powered creative writing and collaboration tool built with AWS Bedrock (Claude 3.5 Sonnet) and React.

## Features

- Story generation using AWS Bedrock Claude 3.5 Sonnet
- Modern UI with React and Tailwind CSS
- Serverless architecture with Vercel deployment

## Setup

1. Clone the repository:
\`\`\`bash
git clone https://github.com/[your-username]/creative-ai-tool.git
cd creative-ai-tool
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Set up your environment variables in \`.env\`:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- API_URL

## Development

Run the development server:
\`\`\`bash
npm run dev
\`\`\`

## Deployment

This project is configured for deployment on Vercel. Connect your GitHub repository to Vercel and configure the necessary environment variables in the Vercel dashboard.

## License

MIT