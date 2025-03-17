# GitLab Merge Request Review Bot with Claude AI

A Node.js bot that automatically reviews GitLab merge requests using Claude AI. The bot provides intelligent code reviews focusing on code quality, potential bugs, security concerns, and performance implications.

## Features

- Automatic code review when merge requests are opened or updated
- Intelligent analysis using Claude AI
- Detailed feedback on:
  - Code quality and best practices
  - Potential bugs and issues
  - Security concerns
  - Performance implications
  - Suggestions for improvement
- Webhook integration with GitLab
- Easy setup and configuration

## Prerequisites

- Node.js (v14 or higher)
- GitLab account with access to create webhooks
- Claude API key
- GitLab personal access token

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd gitlab-mr-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your configuration:
```env
GITLAB_TOKEN=your_gitlab_token_here
GITLAB_API_URL=https://gitlab.com/api/v4
CLAUDE_API_KEY=your_claude_api_key_here
PORT=54421
```

## Configuration

### GitLab Webhook Setup

1. Go to your GitLab project's Settings > Webhooks
2. Add a new webhook:
   - URL: `http://your-server:54421/webhook`
   - Select "Merge request events"
   - Save the webhook

### Environment Variables

- `GITLAB_TOKEN`: Your GitLab personal access token
- `GITLAB_API_URL`: GitLab API URL (default: https://gitlab.com/api/v4)
- `CLAUDE_API_KEY`: Your Claude AI API key
- `PORT`: Port number for the webhook server (default: 54421)

## Usage

1. Start the server:
```bash
npm start
```

2. The bot will automatically review merge requests when they are:
   - Opened
   - Updated

3. Check the server status:
```bash
curl http://localhost:54421/health
```

## Review Format

The bot provides reviews in the following format:

```markdown
# AI Code Review

## Overall Assessment
[Brief overall assessment]

## Detailed Review
[Detailed points about specific files/changes]

## Recommendations
[Specific recommendations for improvement]

## Security & Performance
[Any security or performance concerns]

---
*This review was generated automatically by Claude AI. Please review the suggestions and make appropriate changes.*
```

## Development

To run the server in development mode with auto-reload:
```bash
npm run dev
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT License - feel free to use this project as you wish.