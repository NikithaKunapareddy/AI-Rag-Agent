# Agent3
# Agent3: Universal AI Assistant Platform

Agent3 is a full-stack, multi-modal AI assistant platform that combines universal web search, document-based retrieval (RAG), website summarization, and persistent conversation history. It features a modern Next.js frontend and a Flask backend, with support for document upload, web search, and context-aware AI responses using Gemini AI and other LLMs.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
  - [Backend (Flask)](#backend-flask)
  - [Frontend (Next.js)](#frontend-nextjs)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)
- [Credits](#credits)
- [License](#license)

---

## Features

- **3-Step AI Process:**
  1. **Web Search:** Finds and summarizes the latest information from the web.
  2. **Document Analysis (RAG):** Answers questions using your uploaded documents.
  3. **Context-Aware Response:** Generates detailed, context-rich answers using Gemini AI.

- **Website Summarization:** Paste any URL (including YouTube) to get a structured summary.
- **Document Upload:** Upload `.txt`, `.pdf`, `.doc`, `.docx`, or `.md` files for RAG-powered Q&A.
- **Persistent Conversations:** All chats and uploads are saved per user via Supabase.
- **Modern UI:** Responsive, dark/light mode, and animated chat interface.
- **Multi-user Support:** Each user has their own conversations and document context.
- **Error Handling:** Friendly error messages and troubleshooting tips.

---

## Architecture

- **Frontend:** Next.js (React) app for chat UI, document upload, and conversation management.
- **Backend:** Flask API for web search, document RAG, website summarization, and AI response generation.
- **Database:** Supabase for storing user conversations and messages.
- **RAG:** Uses `sentence-transformers` for embeddings and `faiss` for fast similarity search.
- **Web Search:** Integrates with Serper and NewsAPI for up-to-date web results.
- **AI Model:** Uses Gemini AI (Google) for context-aware response generation.

---

## Project Structure

```
Agent3/
├── Agent3/
│   ├── main.py              # Flask backend (API, RAG, web search, website summarization)
│   ├── .env                 # Backend environment variables (API keys, Supabase)
│   └── README.md            # (This file)
├── front_end/
│   ├── app/
│   │   ├── page.js          # Next.js frontend main chat interface
│   │   ├── layout.js        # Global layout and styles
│   │   └── globals.css      # Global CSS
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   ├── next.config.mjs      # Next.js config
│   └── .env.production      # Frontend environment variables
└── ...
```

---

## Setup & Installation

### Backend (Flask)

1. **Install Python dependencies:**

   ```bash
   cd Agent3
   pip install -r requirements.txt
   ```

2. **Set up `.env` with your API keys and Supabase credentials:**

   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   SERPER_API_KEY=your_serper_api_key
   NEWSAPI_KEY=your_newsapi_key
   NOVITA_API_KEY=your_novita_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Run the backend:**

   ```bash
   python main.py
   # or
   flask run --host=0.0.0.0 --port=8080
   ```

   The backend will be available at `http://localhost:8080`.

### Frontend (Next.js)

1. **Install Node.js dependencies:**

   ```bash
   cd front_end
   npm install
   ```

2. **Set up `.env.production` or `.env.local`:**

   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

3. **Run the frontend:**

   ```bash
   npm run dev
   ```

   The frontend will be available at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

### Backend (`.env`)

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SERPER_API_KEY=your_serper_api_key
NEWSAPI_KEY=your_newsapi_key
NOVITA_API_KEY=your_novita_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (`.env.production` or `.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## Usage

1. **Sign in with your email** on the frontend.
2. **Start a new conversation** or continue an existing one.
3. **Upload documents** to enable document-based Q&A.
4. **Ask questions** — the assistant will use web search, your documents, and conversation context.
5. **Paste a website or YouTube URL** to get a structured summary.

---

## API Endpoints

- `POST /api/conversations` — List all conversations for a user.
- `POST /api/conversation/new` — Start a new conversation.
- `POST /api/conversation/<id>/messages` — Get all messages for a conversation.
- `DELETE /api/conversation/<id>` — Delete a conversation.
- `POST /upload` — Upload a document for RAG.
- `POST /api/news` — Main endpoint for chat queries (web search, RAG, AI response).
- `GET /health` — Health check endpoint.

---

## Customization

- **Chunking and RAG:** Tune chunk size and similarity threshold in `main.py` for your use case.
- **UI:** Edit `front_end/app/page.js` for branding, colors, or UX changes.
- **API Integrations:** Add or swap out web search/news APIs as needed.
- **Document Types:** Extend `extract_text_from_file` in `main.py` to support more file types.

---

## Troubleshooting

- **Document upload not working?**  
  Ensure RAG dependencies are installed and `RAG_AVAILABLE` is `True` in backend logs.

- **Step 2 shows "No relevant document context"?**  
  This is normal until you ask a question after uploading a document.

- **CORS errors?**  
  Make sure your frontend and backend URLs are allowed in the Flask CORS config.

- **Supabase errors?**  
  Double-check your Supabase URL and key in `.env`.

- **Backend not starting?**  
  Check for missing Python dependencies or API keys.

---

## Deployment

- **Frontend:** Deploy the `front_end` folder to [Vercel](https://vercel.com/) or any Next.js-compatible host.
- **Backend:** Deploy the Flask app to [Google Cloud Run](https://cloud.google.com/run), [Render](https://render.com/), or any Python server.
- **Environment Variables:** Set all required API keys and URLs in your deployment environment.

---

## Credits

- [Next.js](https://nextjs.org/)
- [Flask](https://flask.palletsprojects.com/)
- [Supabase](https://supabase.com/)
- [Google Gemini AI](https://ai.google.dev/)
- [Serper](https://serper.dev/)
- [NewsAPI](https://newsapi.org/)
- [sentence-transformers](https://www.sbert.net/)
- [FAISS](https://github.com/facebookresearch/faiss)
- [newspaper3k](https://newspaper.readthedocs.io/)
- [Selenium](https://www.selenium.dev/)

---

## License

MIT License

---

## Contact

For questions or support, open an issue or contact the
