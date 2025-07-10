
# 🤖 MultiMind-RAG-Agent

## 🌟 Overview
MultiMind-RAG-Agent is a next-generation, creative, and highly customizable conversational AI platform. It is designed for deep, meaningful, and context-aware interactions, blending advanced AI with real-time data and rich personas. Whether you need a wise philosopher, a playful Gen Z companion, or a business-savvy advisor, MultiMind-RAG-Agent adapts to your needs.

---

## 🚀 Key Features
- 🧑‍🎤 **Dynamic Personas:** Multiple, deeply crafted personalities (age, background, interests, tone) for unique, human-like conversations.
- 📰 **Real-Time News & Knowledge:** Integrates with NewsAPI, Serper, and a comprehensive knowledge base for up-to-date, insightful responses.
- 🧠 **API-Driven Intelligence:** Connects to Supabase, Gemini, Novita, Sarvam, and more for data-rich, context-aware answers.
- 💻 **Modern Frontend:** Built with Next.js for a fast, beautiful, and responsive user experience.
- 🛠️ **Customizable & Extensible:** Easily modify personas, add new data sources, or extend conversation logic.
- 🔒 **Secure & Scalable:** Environment-based API key management and modular architecture for easy scaling.

---

## 🏗️ Architecture
```
┌────────────────────────────┐
│        Frontend           │
│    (Next.js, React)       │
└────────────┬──────────────┘
             │ REST/HTTP
┌────────────▼──────────────┐
│        Backend            │
│   (Python: main.py)       │
│  ─ Persona Engine         │
│  ─ API Integrations       │
│  ─ Knowledge Retrieval    │
└────────────┬──────────────┘
             │
┌────────────▼──────────────┐
│   External APIs/DBs       │
│  (Supabase, Gemini, etc.) │
└───────────────────────────┘
```

---

## 🔑 Environment Keys
All API keys and sensitive configuration are managed via the `.env` file. Example keys:

| Key                | Description                        |
|--------------------|------------------------------------|
| SUPABASE_KEY       | Supabase database access           |
| SUPABASE_URL       | Supabase project URL               |
| SERPER_API_KEY     | Serper web search API              |
| NEWSAPI_KEY        | NewsAPI for real-time news         |
| NOVITA_API_KEY     | Novita API for advanced features   |
| SARVAM_API_KEY     | Sarvam API for language/insights   |
| GEMINI_API_KEY     | Gemini AI for LLM responses        |

---

## ⚡ Quick Start
1. **Clone the Repository:**
   ```sh
   git clone https://github.com/NikithaKunapareddy/AI-Rag-Agent.git
   cd AI-Rag-Agent-main
   ```
2. **Install Backend Dependencies:**
   ```sh
   pip install -r requirements.txt
   ```
3. **Configure Environment:**
   - Copy `.env.example` to `.env` and fill in your API keys (see table above).
4. **Run the Backend:**
   ```sh
   python main.py
   ```
5. **Setup Frontend:**
   ```sh
   cd front_end
   npm install
   npm run dev
   ```
6. **Access the App:**
   - Open your browser and go to `http://localhost:3000`.

---

## 🗂️ Project Structure
```
AI-Rag-Agent-main/
├── bot.py                # Persona logic and conversation engine
├── main.py               # Main backend logic
├── requirements.txt      # Python dependencies
├── .env                  # API keys and configuration
├── comprehensive_news_knowledge.txt # Knowledge base
├── front_end/            # Next.js frontend
│   ├── app/              # Main app pages and components
│   ├── public/           # Static assets
│   └── ...
└── ...
```

---

## 🎨 Creativity & Customization
- 🧑‍🎤 **Personas:**
  - Edit `bot.py` to craft new personas with unique backgrounds, interests, and conversational styles.
- 📚 **Knowledge Sources:**
  - Expand or update `comprehensive_news_knowledge.txt` for richer, more relevant responses.
- 🖥️ **Frontend:**
  - Customize the Next.js UI for your brand or user experience.

---

## 🙏 Acknowledgements
- [Supabase](https://supabase.com/) 🚀
- [Google Gemini](https://ai.google.dev/gemini-api) 🤖
- [NewsAPI](https://newsapi.org/) 📰
- [Serper](https://serper.dev/) 🌐
- [Novita](https://novita.ai/) 🧠
- [Sarvam](https://sarvam.ai/) 🗣️
- [Next.js](https://nextjs.org/) 💻
- [Open Source Community](https://github.com/) 🌍

---

## 📄 License
This project is licensed under the MIT License. See `LICENSE.txt` for details.

## 🤝 Contributing
We welcome creative contributions! Please open issues or submit pull requests to help us improve and expand the AI Rag Agent.

---

> 🤖 **MultiMind-RAG-Agent**: Where creativity meets intelligence. Build, converse, and innovate with the next generation of AI chatbots.
