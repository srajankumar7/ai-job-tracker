const { ChatAnthropic } = require('@langchain/anthropic');
const { StateGraph, END, START } = require('@langchain/langgraph');
const { HumanMessage, AIMessage } = require('@langchain/core/messages');

class LangGraphAssistant {
  constructor() {
    this.model = new ChatAnthropic({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      modelName: 'claude-3-5-sonnet-20241022',
      temperature: 0.3,
    });

    this.conversationHistory = new Map(); // Store conversation per user
    this.graph = this.buildGraph();
  }

  buildGraph() {
    // Define the state structure
    const graphState = {
      messages: {
        value: (x, y) => x.concat(y),
        default: () => [],
      },
      intent: {
        value: (x, y) => y ?? x,
        default: () => null,
      },
      filterUpdate: {
        value: (x, y) => y ?? x,
        default: () => null,
      },
      searchCriteria: {
        value: (x, y) => y ?? x,
        default: () => null,
      },
      response: {
        value: (x, y) => y ?? x,
        default: () => null,
      },
    };

    // Create the graph
    const workflow = new StateGraph({ channels: graphState });

    // Add nodes
    workflow.addNode('detectIntent', this.detectIntent.bind(this));
    workflow.addNode('handleSearch', this.handleSearch.bind(this));
    workflow.addNode('handleFilter', this.handleFilter.bind(this));
    workflow.addNode('handleHelp', this.handleHelp.bind(this));
    workflow.addNode('handleGeneral', this.handleGeneral.bind(this));

    // Define edges with routing
    workflow.addEdge(START, 'detectIntent');
    
    workflow.addConditionalEdges(
      'detectIntent',
      this.routeIntent.bind(this),
      {
        search: 'handleSearch',
        filter: 'handleFilter',
        help: 'handleHelp',
        general: 'handleGeneral',
      }
    );

    workflow.addEdge('handleSearch', END);
    workflow.addEdge('handleFilter', END);
    workflow.addEdge('handleHelp', END);
    workflow.addEdge('handleGeneral', END);

    return workflow.compile();
  }

  async detectIntent(state) {
    const lastMessage = state.messages[state.messages.length - 1];
    const userMessage = lastMessage.content;

    const intentPrompt = `
Analyze this user message and classify the intent:

User Message: "${userMessage}"

Intent Categories:
1. "search" - User wants to search for jobs (e.g., "find React jobs", "show ML engineer roles")
2. "filter" - User wants to update UI filters (e.g., "only remote", "show full-time", "last week", "high match")
3. "help" - User needs help with the platform (e.g., "how to upload resume", "where are my applications")
4. "general" - General conversation or unclear intent

Return ONLY the intent category as a single word: search, filter, help, or general
`;

    try {
      const response = await this.model.invoke([new HumanMessage(intentPrompt)]);
      const intent = response.content.toLowerCase().trim();
      
      return {
        ...state,
        intent: ['search', 'filter', 'help', 'general'].includes(intent) ? intent : 'general',
      };
    } catch (error) {
      console.error('Intent detection error:', error);
      return { ...state, intent: 'general' };
    }
  }

  routeIntent(state) {
    return state.intent || 'general';
  }

  async handleSearch(state) {
    const lastMessage = state.messages[state.messages.length - 1];
    const userMessage = lastMessage.content;

    const searchPrompt = `
Extract job search criteria from this message:

User Message: "${userMessage}"

Extract:
- role: job title or role (e.g., "react developer", "ML engineer")
- skills: required skills as array (e.g., ["React", "Node.js"])
- location: city or region (if mentioned)
- workMode: "remote", "hybrid", or "on-site" (if mentioned)
- jobType: "full-time", "part-time", "contract", or "internship" (if mentioned)

Return ONLY a valid JSON object:
{
  "role": "string or null",
  "skills": ["skill1", "skill2"] or [],
  "location": "string or null",
  "workMode": "string or null",
  "jobType": "string or null",
  "what": "search query for job API",
  "where": "location for job API",
  "naturalQuery": "A natural language summary of what the user wants"
}
`;

    try {
      const response = await this.model.invoke([new HumanMessage(searchPrompt)]);
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const criteria = JSON.parse(jsonMatch[0]);
        
        // Build searchCriteria for API
        const searchCriteria = {};
        if (criteria.what) searchCriteria.what = criteria.what;
        if (criteria.where) searchCriteria.where = criteria.where;
        
        return {
          ...state,
          searchCriteria: Object.keys(searchCriteria).length > 0 ? searchCriteria : null,
          response: `I'll search for ${criteria.naturalQuery || 'relevant jobs'}. Let me find the best matches for you.`,
        };
      }
    } catch (error) {
      console.error('Search extraction error:', error);
    }

    return {
      ...state,
      response: "I'll help you search for jobs. Can you tell me more about what you're looking for?",
    };
  }

  async handleFilter(state) {
    const lastMessage = state.messages[state.messages.length - 1];
    const userMessage = lastMessage.content;

    const filterPrompt = `
Extract UI filter updates from this message:

User Message: "${userMessage}"

Available Filters:
- jobType: "full-time", "part-time", "contract", "internship" (single value)
- workMode: "remote", "hybrid", "on-site" (single value)
- location: city/region string
- seniority: "senior", "junior", "mid-level", "lead", "entry-level"
- skills: array of skills ["React", "Node.js"]
- minMatchScore: number (0-100)
- company: company name string
- clearAll: true if user wants to reset all filters

Examples:
- "show only remote jobs" → {"workMode": "remote"}
- "full-time roles" → {"jobType": "full-time"}
- "high match scores only" → {"minMatchScore": 70}
- "senior React jobs in Bangalore" → {"seniority": "senior", "skills": ["React"], "location": "Bangalore"}
- "clear all filters" → {"clearAll": true}

Return ONLY a valid JSON object with the filters to update:
`;

    try {
      const response = await this.model.invoke([new HumanMessage(filterPrompt)]);
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const filterUpdate = JSON.parse(jsonMatch[0]);
        
        let responseText = "I've updated the filters";
        if (filterUpdate.clearAll) {
          responseText = "I've cleared all filters. Showing all jobs now.";
        } else {
          const updates = [];
          if (filterUpdate.workMode) updates.push(filterUpdate.workMode);
          if (filterUpdate.jobType) updates.push(filterUpdate.jobType);
          if (filterUpdate.seniority) updates.push(filterUpdate.seniority);
          if (filterUpdate.minMatchScore) updates.push(`match score above ${filterUpdate.minMatchScore}%`);
          if (filterUpdate.location) updates.push(`in ${filterUpdate.location}`);
          if (filterUpdate.skills) updates.push(filterUpdate.skills.join(', '));
          
          if (updates.length > 0) {
            responseText = `I've filtered to show ${updates.join(', ')} jobs.`;
          }
        }
        
        return {
          ...state,
          filterUpdate,
          response: responseText,
        };
      }
    } catch (error) {
      console.error('Filter extraction error:', error);
    }

    return {
      ...state,
      response: "I can help you filter jobs. Try saying 'show only remote jobs' or 'full-time roles'.",
    };
  }

  async handleHelp(state) {
    const lastMessage = state.messages[state.messages.length - 1];
    const userMessage = lastMessage.content.toLowerCase();

    let helpResponse = '';

    if (userMessage.includes('resume') || userMessage.includes('upload')) {
      helpResponse = "To upload your resume, click on 'Update Resume' in the header. You can upload PDF files.";
    } else if (userMessage.includes('application') || userMessage.includes('applied')) {
      helpResponse = "To see your applications, click on 'My Applications' in the header. You can track all jobs you've applied to there.";
    } else if (userMessage.includes('match') || userMessage.includes('score')) {
      helpResponse = "Match scores show how well each job fits your profile. Higher percentages mean better matches. Yellow badges show the match percentage for each job.";
    } else if (userMessage.includes('filter')) {
      helpResponse = "You can filter jobs by asking me! Try 'show remote jobs', 'only full-time roles', or 'jobs in Bangalore'. I can also filter by skills and match score.";
    } else if (userMessage.includes('apply')) {
      helpResponse = "Click 'Apply Now' on any job card to apply. We'll track it in your applications automatically.";
    } else {
      helpResponse = "I can help you with:\n• Searching for jobs ('find React developer jobs')\n• Filtering results ('show only remote')\n• Uploading your resume\n• Tracking applications\n• Understanding match scores\n\nWhat would you like to know more about?";
    }

    return {
      ...state,
      response: helpResponse,
    };
  }

  async handleGeneral(state) {
    const lastMessage = state.messages[state.messages.length - 1];
    const userMessage = lastMessage.content;

    const generalPrompt = `
You are a helpful job search assistant. Respond to this message in a friendly, conversational way.

User: "${userMessage}"

Keep your response brief and helpful. If the user seems to want to search or filter jobs, 
guide them on how to do that. Otherwise, engage naturally.
`;

    try {
      const response = await this.model.invoke([new HumanMessage(generalPrompt)]);
      return {
        ...state,
        response: response.content,
      };
    } catch (error) {
      console.error('General response error:', error);
      return {
        ...state,
        response: "I'm here to help you find jobs! You can ask me to search for specific roles, filter results, or answer questions about the platform.",
      };
    }
  }

  async processMessage(userId, message) {
    try {
      // Get or create conversation history
      if (!this.conversationHistory.has(userId)) {
        this.conversationHistory.set(userId, []);
      }

      const history = this.conversationHistory.get(userId);
      
      // Add user message to history
      const userMessage = new HumanMessage(message);
      history.push(userMessage);

      // Keep only last 10 messages to manage context
      if (history.length > 10) {
        history.splice(0, history.length - 10);
      }

      // Run the graph
      const initialState = {
        messages: [userMessage],
      };

      const result = await this.graph.invoke(initialState);

      // Add AI response to history
      if (result.response) {
        history.push(new AIMessage(result.response));
      }

      return {
        response: result.response || "I'm not sure how to help with that. Can you rephrase?",
        intent: result.intent,
        filterUpdate: result.filterUpdate,
        searchCriteria: result.searchCriteria,
      };
    } catch (error) {
      console.error('LangGraph processing error:', error);
      return {
        response: "I'm having trouble processing that right now. Please try again.",
        intent: 'error',
      };
    }
  }

  clearHistory(userId) {
    this.conversationHistory.delete(userId);
  }
}

module.exports = new LangGraphAssistant();