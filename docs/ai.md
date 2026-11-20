# CampusIQ AI & RAG Architecture

## Core Principle

CampusIQ AI is **NOT a generic chatbot**. It is an intelligent academic reasoning agent deeply grounded in the authenticated student's real-time university database records and verified institutional documents.

---

## 1. Multi-Stage Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant AI as AI Controller
    participant Auth as Context Aggregator
    participant RAG as RAG Vector Search
    participant Guard as Prompt Guard & Sanitizer
    participant Gemini as Google Gemini Provider

    Student->>AI: POST /api/v1/ai/chat {"message": "..."}
    AI->>Guard: Sanitize input & check injection patterns
    AI->>Auth: Fetch Live Student Records (Attendance, Timetable, CGPA)
    AI->>RAG: 768-dim query embedding & Top-K Cosine Similarity Retrieval
    AI->>Gemini: Synthesize prompt with Context + RAG Excerpts + Safety Directives
    Gemini-->>AI: Grounded answer
    AI-->>Student: Return {"answer": "...", "sources": [{"title": "...", "page": 2}]}
```

---

## 2. Context Isolation & Security

- **Student Data Isolation**: The system queries records using `req.user.id` extracted strictly from the verified JWT.
- **Prompt Injection Defense**: Guard checks for jailbreak markers, prompt revelation queries, and system overrides.
- **Factual Grounding**: If information is absent from university records or documents, the AI issues a grounded uncertainty refusal rather than hallucinating answers.
