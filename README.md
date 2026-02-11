# AI-Powered Job Tracker

> An intelligent job tracking platform with AI-powered matching, conversational assistant, and smart application tracking.

## 🎯 Live Demo

**Live URL**: [To be deployed on Vercel/Render]
- Frontend:Netlify
- Backend: Render

## 📋 Test Credentials

```
Email: test@gmail.com
Password: test@123
```

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Job Feed  │  │Filters   │  │Dashboard │  │AI Chat   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Node.js + Express)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Auth      │  │Jobs      │  │Resume    │  │Tracking  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
         │                │                │                │
         │                │                │                │
    ┌────▼────┐    ┌─────▼─────┐    ┌────▼────┐    ┌─────▼─────┐
    │MongoDB  │    │External   │    │LangChain│    │LangGraph  │
    │Database │    │Job APIs   │    │Matching │    │AI Agent   │
    └─────────┘    └───────────┘    └─────────┘    └───────────┘
                         │                │                │
                         │                │                │
                    ┌────▼────────────────▼────────────────▼────┐
                    │         OpenAI GPT-4 / Claude 3.5         │
                    └───────────────────────────────────────────┘
```

## 🚀 Features

### Core Features
- ✅ **Job Feed**: Real-time job listings from external APIs (Remotive, Adzuna)
- ✅ **AI Job Matching**: LangChain-powered resume-job matching with scores
- ✅ **Smart Filters**: Role, Skills, Date, Job Type, Work Mode, Location, Match Score
- ✅ **Application Tracking**: Smart popup flow with status management
- ✅ **AI Assistant**: LangGraph-powered conversational agent with UI control

### AI Capabilities
- 🤖 Resume parsing and skill extraction
- 🎯 Intelligent job matching (0-100% scores)
- 💬 Natural language job search
- 🎛️ Direct UI filter control via conversation
- 📊 Match explanation (skills, experience, keywords)

## 📦 Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State**: React Context + Hooks
- **HTTP**: Axios
- **Routing**: React Router v6
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcrypt
- **File Upload**: Multer
- **PDF Parsing**: pdf-parse

### AI Stack
- **LLM**: OpenAI GPT-4 / Anthropic Claude 3.5
- **Matching**: LangChain (Required)
- **Orchestration**: LangGraph (Required)
- **Vector Store**: In-memory (simple implementation)

## 🛠️ Setup Instructions

### Prerequisites
```bash
- Node.js 18+ 
- MongoDB (local or Atlas)
- OpenAI API Key or Anthropic API Key
- Git
```

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/ai-job-tracker.git
cd ai-job-tracker
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Start backend
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Edit .env:
# VITE_API_URL=http://localhost:5000

# Start frontend
npm run dev
```

### 4. Access Application
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Login: test@gmail.com / test@123

## 🧠 LangChain & LangGraph Implementation

### LangChain for Job Matching

**Purpose**: Intelligent resume-job matching with scoring


**Scoring Algorithm**:
1. **Skills Match** (50%): Overlap between resume and job skills
2. **Experience Relevance** (30%): Years + domain alignment
3. **Keyword Alignment** (20%): NLP similarity of descriptions

**Performance**:
- Batch processing: 10 jobs/second
- Caching: Store results for 1 hour
- Async processing: Non-blocking UI

### LangGraph for AI Assistant

**Purpose**: Conversational agent with UI control and multi-step reasoning

**Graph Structure**:
```
START
  │
  ▼
[Intent Classification]
  │
  ├──► [Job Search] ──► Execute Search ──► END
  │
  ├──► [Filter Update] ──► Parse Filters ──► Update UI ──► END
  │
  ├──► [Help/Info] ──► Provide Info ──► END
  │
  └──► [Conversation] ──► Maintain Context ──► END
```


**State Management**:
- Conversation history: Last 10 messages
- Filter state: Synchronized with frontend
- User context: Resume data, preferences

**Prompt Design**:
```
You are a helpful job search assistant. You can:
1. Search for jobs using natural language
2. Update UI filters directly
3. Answer questions about the platform

When user requests filter changes, call update_ui_filters tool.
When user searches jobs, call search_jobs tool.

Current filters: {currentFilters}
User resume: {resumeSummary}
```

## 🎯 AI Matching Logic

### Scoring Approach

**1. Skill Extraction**
- Resume: Use LangChain to extract skills, technologies, frameworks
- Jobs: Parse from description + required skills field
- Normalization: Map synonyms (React.js → React, Node → Node.js)

**2. Score Calculation**
```javascript
function calculateMatchScore(resume, job) {
  const skillsScore = calculateSkillsMatch(resume.skills, job.skills);
  const experienceScore = calculateExperienceMatch(resume.experience, job.experience);
  const keywordScore = calculateKeywordSimilarity(resume.text, job.description);
  
  const finalScore = (
    skillsScore * 0.5 +
    experienceScore * 0.3 +
    keywordScore * 0.2
  );
  
  return Math.round(finalScore);
}
```

**3. Why It Works**
- **Skills-weighted**: Skills are most important indicator
- **Context-aware**: Considers experience level and domain
- **Semantic**: Not just keyword matching, understands context
- **Explainable**: Returns which skills match/missing

**4. Performance Considerations**
- Cache match scores for 1 hour
- Process in batches of 20
- Use worker threads for large datasets
- Debounce on filter changes

## 🎨 Smart Popup Flow Design

### Design Decision: Modal with Confirmation

**Flow**:
1. User clicks "Apply" → Opens job link in new tab
2. User returns to app → Popup appears after 3s delay
3. Options presented:
   - ✅ Yes, Applied
   - 👀 No, just browsing  
   - 📅 Applied Earlier

**Why This Design**:
- **Non-intrusive**: 3s delay allows user to settle back
- **Honest options**: Acknowledges browsing behavior
- **Data quality**: "Applied Earlier" prevents duplicates
- **User respect**: Can dismiss and won't show again for same job

**Edge Cases Handled**:
1. **Multiple tabs**: Track per-tab, show once
2. **Quick navigation**: Don't show if user returns <2s
3. **Already applied**: Check database, don't ask again
4. **Dismissed**: Store in localStorage, respect choice
5. **Network error**: Queue action, retry later

**Alternative Approaches Considered**:
1. ❌ **Immediate popup**: Too aggressive, interrupts flow
2. ❌ **Email tracking**: Privacy concerns, complex implementation
3. ❌ **Browser extension**: Extra installation, scope creep
4. ✅ **Current approach**: Balanced, respectful, effective

**Implementation**:
```javascript
// Track tab visibility
useEffect(() => {
  const handleVisibility = () => {
    if (document.visibilityState === 'visible' && pendingApplication) {
      setTimeout(() => {
        showApplicationPopup(pendingApplication);
      }, 3000);
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibility);
  return () => document.removeEventListener('visibilitychange', handleVisibility);
}, [pendingApplication]);
```

## 💬 AI Assistant UI Choice

### Choice: Floating Chat Bubble (Bottom-Right)

**Why This Design**:

**Pros**:
- ✅ **Non-blocking**: Doesn't take permanent screen space
- ✅ **Familiar**: Users recognize pattern from other apps
- ✅ **Mobile-friendly**: Works well on small screens
- ✅ **Contextual**: Available everywhere without navigation
- ✅ **Progressive disclosure**: Hidden until needed

**Cons**:
- ⚠️ Can cover content (mitigated with smart positioning)
- ⚠️ Small screen space (mitigated with full-screen option on mobile)

**UX Reasoning**:
1. **Discoverability**: Visible indicator that AI help is available
2. **Accessibility**: Keyboard shortcut (Cmd/Ctrl + K) to toggle
3. **Persistence**: Maintains conversation context across pages
4. **Affordance**: Pulse animation draws attention when idle

**Implementation Details**:
- Expandable: 60px button → 400px chat window
- Max height: 600px with scroll
- Position: 24px from bottom-right
- Z-index: 1000 (above all content)
- Backdrop blur when expanded on mobile

**Alternative Considered**:
- Sidebar: Takes permanent space, better for desktop-only
- Top bar: Harder to access, conflicts with navigation
- **Current choice wins**: Best balance for all screen sizes

## 📈 Scalability

### Handling 100+ Jobs

**Frontend**:
- Virtual scrolling (react-window): Render only visible jobs
- Pagination: 20 jobs per page
- Lazy loading: Load images on viewport entry
- Debounced search: 300ms delay before API call

**Backend**:
- Database indexing: On skills, location, datePosted
- Query optimization: Project only required fields
- Caching: Redis for job listings (5min TTL)
- CDN: Static assets and images

**AI Matching**:
- Batch processing: 20 jobs at a time
- Async workers: Queue-based processing
- Result caching: Store scores in DB
- Rate limiting: Max 10 requests/second to LLM

### Handling 10,000 Users

**Infrastructure**:
- **Load balancing**: Multiple backend instances
- **Database**: MongoDB sharding by user_id
- **Caching**: Redis for sessions, job data
- **CDN**: Cloudflare for static assets

**Database Design**:
```javascript
// Indexed fields
{
  users: { email: 1 },
  jobs: { datePosted: -1, skills: 1, location: 1 },
  applications: { userId: 1, jobId: 1 }
}
```

**API Optimization**:
- Rate limiting: 100 req/min per user
- Response compression: gzip
- Connection pooling: MongoDB
- Horizontal scaling: Stateless backend

**Cost Optimization**:
- LLM caching: Reduce API calls by 70%
- Batch embeddings: Process multiple resumes
- Lazy matching: Only match when user views job

## ⚖️ Tradeoffs

### Known Limitations

1. **Job Data Freshness**
   - **Issue**: External APIs rate limits
   - **Impact**: Jobs may be 1-6 hours old
   - **Mitigation**: Cache with TTL, show "Updated X mins ago"

2. **AI Matching Accuracy**
   - **Issue**: LLM can misinterpret skills
   - **Impact**: Some scores may be ±10% off
   - **Mitigation**: Allow user feedback, retraining

3. **Application Tracking**
   - **Issue**: Relies on user confirmation
   - **Impact**: May miss applications
   - **Mitigation**: Clear UX, reminders

4. **Mobile Experience**
   - **Issue**: Complex filters on small screens
   - **Impact**: Harder to use on mobile
   - **Mitigation**: AI assistant compensates, bottom sheet filters

5. **Real-time Updates**
   - **Issue**: No WebSocket implementation
   - **Impact**: Manual refresh needed
   - **Mitigation**: Auto-refresh every 5 mins

### What I'd Improve with More Time

1. **Advanced Features**
   - Email integration: Auto-track applications
   - Calendar sync: Interview scheduling
   - Salary insights: Market data integration
   - Company reviews: Glassdoor API

2. **AI Enhancements**
   - Fine-tuned model: Custom job matching
   - Resume optimization: AI suggestions
   - Interview prep: Generated questions
   - Career path: Recommendation engine

3. **Performance**
   - Server-side rendering: Next.js
   - GraphQL: Efficient data fetching
   - WebSocket: Real-time updates
   - Service workers: Offline support

4. **Analytics**
   - User behavior tracking
   - A/B testing: UI variations
   - Success metrics: Application → Offer rate
   - ML model: Predict application success

5. **DevOps**
   - CI/CD: Automated deployment
   - Monitoring: Error tracking (Sentry)
   - Logging: Structured logs (Winston)
   - Testing: E2E tests (Playwright)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
https://aijob-tracker.netlify.app/login
```

### Backend (Render)
```bash
https://ai-job-tracker-j1ra.onrender.com
```


## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs with filters
- `GET /api/jobs/:id` - Get job by ID
- `GET /api/jobs/search` - Search jobs

### Resume
- `POST /api/resume/upload` - Upload resume
- `GET /api/resume` - Get user resume
- `DELETE /api/resume` - Delete resume

### Applications
- `POST /api/applications` - Create application
- `GET /api/applications` - Get user applications
- `PUT /api/applications/:id` - Update application status

### AI Assistant
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/match-jobs` - Get job matches

## 🤝 Contributing

This is a technical assessment project. Not accepting contributions.

## 📄 License

MIT License - See LICENSE file

## 👤 Author

Srajan kumar


---

Built with ❤️ using MERN stack, LangChain, and LangGraph