# ExplainThis – Full-Stack AI Document Chat Application

ExplainThis is a full-stack application that allows users to upload PDF documents and chat with an AI assistant that answers questions **based on the uploaded content**.  
It also supports **context-aware follow-up questions** like “explain it more” or “why is that important?”, making conversations feel natural and intelligent.

The project is built using modern backend and AI technologies and follows production-grade architectural practices.

---

## 🚀 Features

- 📄 Upload and process PDF documents
- ✂️ Text chunking and semantic embeddings
- 🧠 AI-powered answers based on document context (RAG)
- 💬 Conversational chat with follow-up question handling
- 🧵 Session-based chat memory using Redis
- ⚡ Fast semantic search using Pinecone
- 🌐 Full-stack application (Frontend + Backend)

---

## 🧱 Tech Stack

### Frontend

- React
- Fetch / Axios for API communication
- Chat-style user interface

### Backend

- Node.js
- Express
- TypeScript

### AI & Data

- Gemini API (text embeddings and response generation)
- Pinecone (vector database)
- Redis (conversation memory)
- pdf-parse (PDF text extraction)

---

## 🧠 How the System Works

1. A user uploads a PDF document
2. Text is extracted from the PDF
3. The text is split into overlapping chunks
4. Each chunk is embedded using Gemini embeddings
5. Embeddings are stored in Pinecone with session metadata
6. The user asks a question
7. Relevant document chunks are retrieved from Pinecone
8. Recent chat history is fetched from Redis
9. Follow-up questions are rewritten into self-contained questions
10. The AI generates a concise, context-aware answer

---

## ⚙️ Environment Variables

Create a `.env` file in the backend project:

PORT=8000
REDIS_URL=redis://127.0.0.1:6379
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name
GEMINI_API_KEY=your_gemini_api_key

## 🧠 Redis Setup (Local Installation)

- This project uses locally installed Redis (not Docker).

# Install Redis

- Ubuntu / Debian
  sudo apt update
  sudo apt install redis-server
  sudo systemctl start redis
  sudo systemctl enable redis

- macOS (Homebrew)
  brew install redis
  brew services start redis

- Verify Redis
  redis-cli ping

- Expected output:
  PONG

## ▶️ Running the Application

### Backend

npm install
npm run dev

- You should see:

Redis connected
Server is running on port 8000

### Frontend

npm install
npm start

- The frontend communicates with the backend using REST APIs.
