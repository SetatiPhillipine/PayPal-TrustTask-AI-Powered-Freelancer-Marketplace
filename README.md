
# TrustTask — AI-Powered Freelancer Marketplace

**Clear projects. Trusted partnerships.**

TrustTask is an AI-powered freelancer marketplace designed to help clients and freelancers collaborate with clearer requirements, structured milestones, and transparent payment tracking.

The platform uses AI to turn client requests into organised project briefs, suggest milestones and deliverables, and support a more structured freelance workflow. PayPal integration will provide a payment option for clients using the platform.

## The Problem

Freelancers and clients can struggle to agree on project requirements, pricing, deadlines, and deliverables. Misunderstandings can lead to delays, disagreements, and uncertainty about project progress.

## Our Solution

TrustTask aims to make freelance collaboration more organised by helping users:

- Generate structured project briefs using AI.
- Suggest project milestones and deliverables.
- Organise projects and track progress.
- Manage client and freelancer accounts.
- Initiate and verify payments through PayPal's sandbox environment.

## Key Features

- **AI Project Planning:** Transform client descriptions into structured project briefs.
- **Milestone Management:** Break projects into manageable stages.
- **Progress Tracking:** Monitor milestone status and deliverables.
- **Client and Freelancer Accounts:** Support different user roles and workflows.
- **PayPal Integration:** Enable checkout through PayPal APIs.
- **Project Dashboard:** Keep project information and progress organised.

*Features will be updated as development progresses.*

## Technology Stack

- **Frontend:** React
- **Backend:** Node.js and Express
- **Database:** MongoDB
- **AI:** Large language model API
- **Payments:** PayPal REST API
- **Authentication:** Secure backend-managed sessions or JWT

## How It Works

1. A client describes the project they need completed.
2. The backend sends the description to an AI service.
3. The AI generates a structured brief and suggested milestones.
4. Project information is stored in MongoDB.
5. Clients and freelancers manage projects and track progress.
6. Clients can proceed to PayPal checkout in the sandbox environment.
7. The backend verifies payment status before updating payment records.

## Security

- Keep API keys and credentials in backend environment variables.
- Protect accounts and project data with authentication and authorisation.
- Verify payment status on the backend.
- Use PayPal's sandbox environment for development and testing.
- Never commit private `.env` files or API secrets.

## Project Status

TrustTask is being developed as a hackathon project. The initial goal is to build a functional MVP featuring AI-assisted project planning, user accounts, milestone tracking, and PayPal sandbox payments.

## Vision

Our vision is to help freelancers and clients turn ideas into clearly defined projects, build trust through transparent collaboration, and manage work more confidently from planning to payment.

## Built With

React, Node.js, Express, MongoDB, an AI API, and PayPal REST APIs.
