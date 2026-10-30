# QueryQuest AI — Database Assistant

A React + Vite learning app that turns plain-language requests into SQL, explains the result, and provides a fictional sample database for safe practice.

## Run locally

```sh
npm install
npm run dev
```

The React frontend works without credentials, but SQL generation requires the Vercel serverless endpoint and a server-side OpenAI API key. For local API development, use Vercel CLI (`vercel dev`) and set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` in a local `.env.local` file. Never commit the key.

## Deploy to Vercel

1. Import this project directory into a Vercel project.
2. Set `OPENAI_API_KEY` in the project's Environment Variables. Optionally set `OPENAI_MODEL`.
3. Deploy. Vercel builds the Vite frontend and serves `api/generate.js` as a serverless function.

The project is configured for Vercel with `vercel.json`. `api/generate.js` calls the OpenAI Responses API and returns SQL, a plain-language explanation, and a practice prompt. AI suggestions are limited by instructions to the fictional schema and are never described as executed.

## Safety and demo scope

- ShopSmart records in the client are fictional and intentionally small.
- The preview runner is a basic educational parser for single-table `SELECT`, `WHERE`, `ORDER BY`, and `LIMIT` examples. It does not connect to a database and does not execute arbitrary SQL.
- It rejects common data-changing statements. This browser-only demonstration runner is not a general SQL security boundary.
- The AI endpoint has a best-effort in-memory request cap per warm serverless instance. It is not a durable distributed rate limiter; add a persistent rate-limiting service before relying on it for a high-traffic public launch.
- Never connect this prototype to a production database without adding server-side parsing, authorization, row limits, and a read-only database role.

## Project links

- Public app: https://queryquest-ai.vercel.app
- GitHub repository: https://github.com/Armstrfa/queryquest-ai

AI generation requires `OPENAI_API_KEY` to be added to the Vercel project's encrypted environment variables. The website is public; until the key is configured, its API responds with a setup message.
