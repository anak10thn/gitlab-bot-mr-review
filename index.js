require('dotenv').config();
const express = require('express');
const axios = require('axios');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(express.json());

const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
const GITLAB_API_URL = process.env.GITLAB_API_URL || 'https://gitlab.com/api/v4';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

const anthropic = new Anthropic({
    apiKey: CLAUDE_API_KEY,
});

// Configure axios for GitLab API
const gitlabApi = axios.create({
    baseURL: GITLAB_API_URL,
    headers: {
        'PRIVATE-TOKEN': GITLAB_TOKEN
    }
});

async function getFileChanges(projectId, mrIid) {
    try {
        const response = await gitlabApi.get(`/projects/${projectId}/merge_requests/${mrIid}/changes`);
        return response.data.changes;
    } catch (error) {
        console.error('Error getting file changes:', error.message);
        return [];
    }
}

async function analyzeWithClaude(changes) {
    const changesDescription = changes.map(change => {
        return `File: ${change.new_path}
Before:
${change.diff}
`;
    }).join('\n\n');

    const prompt = `You are a code reviewer. Please review the following code changes and provide feedback. Focus on:
1. Code quality and best practices
2. Potential bugs or issues
3. Security concerns
4. Performance implications
5. Suggestions for improvement

Here are the changes:

${changesDescription}

Please provide your review in the following format:
## Overall Assessment
[Brief overall assessment]

## Detailed Review
[Detailed points about specific files/changes]

## Recommendations
[Specific recommendations for improvement]

## Security & Performance
[Any security or performance concerns]`;

    try {
        const response = await anthropic.messages.create({
            model: 'claude-3-7-sonnet-20250219',
            messages: [{
                role: 'user',
                content: prompt
            }]
        });

        return response.content[0].text;
    } catch (error) {
        console.error('Error analyzing with Claude:', error.message);
        return 'Error: Unable to complete code review with Claude.';
    }
}

async function reviewMergeRequest(projectId, mrIid) {
    try {
        // Get MR details
        const mrResponse = await gitlabApi.get(`/projects/${projectId}/merge_requests/${mrIid}`);
        const mr = mrResponse.data;

        // Get file changes
        const changes = await getFileChanges(projectId, mrIid);
        
        // Analyze changes with Claude
        const review = await analyzeWithClaude(changes);

        // Post review as a comment
        await gitlabApi.post(`/projects/${projectId}/merge_requests/${mrIid}/notes`, {
            body: `# AI Code Review

${review}

---
*This review was generated automatically by MAYAR AI. Please review the suggestions and make appropriate changes.*`
        });

        return { success: true, review };
    } catch (error) {
        console.error('Error reviewing merge request:', error.message);
        throw error;
    }
}

// Webhook endpoint for merge request events
app.post('/webhook', async (req, res) => {
    try {
        const event = req.body;
        
        // Handle merge request events
        if (event.object_kind === 'merge_request') {
            const projectId = event.project.id;
            const mrIid = event.object_attributes.iid;
            
            // Review MR when it's opened or updated
            if (['open', 'update'].includes(event.object_attributes.action)) {
                await reviewMergeRequest(projectId, mrIid);
            }
        }

        // if(event.object_kind === 'note' && event.object_attributes.note.includes('@mayar.bot')){
        //     const projectId = event.project.id;
        //     const mrIid = event.object_attributes.iid;
        //     console.log("Yesss reviewww.....",projectId, mrIid)
        //     await reviewMergeRequest(projectId, mrIid);
        // }

        res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
        console.error('Webhook processing error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

const PORT = process.env.PORT || 54421;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});