const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');
router.use(authenticateToken);

router.post('/generate', async (req, res) => {
    try {
        const { conversation_type, messages } = req.body;
        if (!conversation_type || !messages) { return res.status(400).json({ error: 'Conversation type and messages are required' }); }
        
        let aiResponse = '';
        const lastMessage = messages[messages.length - 1];
        
        switch (conversation_type) {
            case 'lesson_plan':
                aiResponse = "Here is a suggested lesson plan:\n\n1. Lesson Objectives (10 min)\n2. Theory Session (45 min)\n3. Practical Lab (60 min)\n4. Assessment (20 min)\n5. Wrap-up (15 min)\n\nWould you like me to elaborate on any section?";
                break;
            case 'student_assessment':
                aiResponse = "Student Assessment Analysis:\n\nFor struggling students (below 50%): Schedule one-on-one mentoring\nFor average students (50-75%): Provide targeted exercises\nFor high performers (above 75%): Offer advanced challenges\n\nWould you like specific strategies for any group?";
                break;
            case 'lab_optimization':
                aiResponse = "Lab Optimization Plan:\n\n1. Rotate workstations to balance usage\n2. Schedule preventive maintenance weekly\n3. Keep spare parts inventory\n4. Assign lab captains for each session\n\nWould you like detailed procedures?";
                break;
            case 'report_writing':
                aiResponse = "Report Template:\n\n1. Executive Summary\n2. Key Metrics\n3. Challenges Faced\n4. Action Items\n5. Next Steps\n\nWould you like me to help fill in any section?";
                break;
            case 'survey_generation':
                // For a simulated AI, we just return a formatted JSON survey block based on their topic.
                // Normally we would pass `lastMessage.content` to an LLM.
                const topic = lastMessage.content || 'General';
                aiResponse = JSON.stringify({
                    title: topic + " Feedback Survey",
                    questions: [
                        "How satisfied are you with the " + topic.toLowerCase() + " module overall?",
                        "How clear were the instructions provided?",
                        "What is one thing that could be improved?",
                        "How would you rate the pacing of the material?",
                        "Any additional comments or feedback?"
                    ]
                });
                break;
            default:
                aiResponse = "I can help with lesson planning, student assessments, lab optimization, and report writing. What do you need help with?";
        }
        
        await query("INSERT INTO ai_conversations (conversation_type, user_id, centre_id, user_messages, ai_responses, generated_content) VALUES ($1, $2, $3, $4, $5, $6)", [conversation_type, req.user.id, req.user.centre_id, JSON.stringify(messages), JSON.stringify([{ role: 'assistant', content: aiResponse }]), aiResponse]);
        
        res.json({ response: aiResponse, conversation_type: conversation_type });
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
