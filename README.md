# TrustTask

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white)

TrustTask is an AI-powered freelancer marketplace that eliminates the friction of writing project briefs and secures payments through PayPal.

Built for the PayPal Hackathon.

## The Problem
Clients often struggle to write detailed project briefs. This leads to scope creep, misaligned expectations, and unpaid work for freelancers.

## The Solution
TrustTask uses AI (Groq/LLaMA 3) to interview the client in a chat interface. Once the AI has enough details, it automatically generates a structured project brief with deliverables and milestone pricing. The client can then fund the project securely using the PayPal Sandbox API.

## Tech Stack
- **Frontend:** React, Vite, React Router, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose)
- **AI Integration:** Groq API (LLaMA 3.3 70B)
- **Payments:** PayPal REST API (Sandbox)

## Key Features
1. **AI Project Briefing:** A conversational AI assistant asks targeted questions to build a comprehensive project scope.
2. **Milestone Generation:** The AI automatically breaks the project down into deliverable milestones with suggested USD amounts.
3. **Role-Based Access:** Separate dashboards for Clients (posting jobs) and Freelancers (finding work).
4. **PayPal Integration:** Clients can securely fund the project via the PayPal Sandbox checkout flow.

## Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- A MongoDB Atlas account
- A Groq API Key (Free)
- A PayPal Developer Sandbox account

### 1. Clone the Repository
```bash
git clone https://github.com/SetatiPhillipine/PayPal-TrustTask-AI-Powered-Freelancer-Marketplace.git
cd PayPal-TrustTask-AI-Powered-Freelancer-Marketplace
