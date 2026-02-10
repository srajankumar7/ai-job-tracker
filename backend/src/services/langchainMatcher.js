const { ChatAnthropic } = require('@langchain/anthropic');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');

class LangChainMatcher {
  constructor() {
    this.model = new ChatAnthropic({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      modelName: 'claude-3-5-sonnet-20241022',
      temperature: 0.2,
    });

    this.matchingPrompt = PromptTemplate.fromTemplate(`
You are an expert job matching system. Analyze how well a candidate's resume matches a job description.

Resume:
{resume}

Job Title: {jobTitle}
Job Description:
{jobDescription}

Analyze the match and provide:
1. Match Score (0-100): How well the resume matches this job
2. Matching Skills: List specific skills from resume that match the job
3. Relevant Experience: Experience that aligns with job requirements
4. Keywords Alignment: Important keywords that match
5. Brief Explanation: Why this score was given

Scoring Guidelines:
- 90-100: Perfect match, candidate exceeds requirements
- 70-89: Strong match, candidate meets most requirements
- 40-69: Moderate match, some relevant skills/experience
- 0-39: Weak match, limited relevant qualifications

Return ONLY a valid JSON object with this exact structure:
{{
  "score": <number 0-100>,
  "matchingSkills": ["skill1", "skill2"],
  "relevantExperience": ["experience1", "experience2"],
  "keywordsAlignment": ["keyword1", "keyword2"],
  "explanation": "brief explanation"
}}
`);
  }

  async matchJob(resume, jobTitle, jobDescription) {
    try {
      if (!resume || !jobDescription) {
        return this.getDefaultMatch();
      }

      const chain = this.matchingPrompt.pipe(this.model).pipe(new StringOutputParser());

      const response = await chain.invoke({
        resume: resume.substring(0, 3000), // Limit resume length
        jobTitle,
        jobDescription: jobDescription.substring(0, 2000),
      });

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response');
        return this.getDefaultMatch();
      }

      const result = JSON.parse(jsonMatch[0]);

      return {
        score: Math.min(100, Math.max(0, result.score || 0)),
        matchingSkills: result.matchingSkills || [],
        relevantExperience: result.relevantExperience || [],
        keywordsAlignment: result.keywordsAlignment || [],
        explanation: result.explanation || 'No explanation available',
      };
    } catch (error) {
      console.error('LangChain matching error:', error.message);
      return this.getDefaultMatch();
    }
  }

  async batchMatchJobs(resume, jobs) {
    try {
      // Match jobs in parallel with rate limiting
      const matchPromises = jobs.map(async (job, index) => {
        // Add delay to avoid rate limits (100ms between requests)
        await new Promise(resolve => setTimeout(resolve, index * 100));
        
        const match = await this.matchJob(resume, job.title, job.description);
        return {
          ...job,
          matchScore: match.score,
          matchDetails: {
            matchingSkills: match.matchingSkills,
            relevantExperience: match.relevantExperience,
            keywordsAlignment: match.keywordsAlignment,
            explanation: match.explanation,
          },
        };
      });

      return await Promise.all(matchPromises);
    } catch (error) {
      console.error('Batch matching error:', error.message);
      // Return jobs with default scores if batch fails
      return jobs.map(job => ({
        ...job,
        matchScore: 50,
        matchDetails: this.getDefaultMatch(),
      }));
    }
  }

  getDefaultMatch() {
    return {
      score: 50,
      matchingSkills: [],
      relevantExperience: [],
      keywordsAlignment: [],
      explanation: 'Unable to calculate match score at this time',
    };
  }

  getMatchLevel(score) {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  getMatchColor(score) {
    if (score >= 70) return 'green';
    if (score >= 40) return 'yellow';
    return 'gray';
  }
}

module.exports = new LangChainMatcher();