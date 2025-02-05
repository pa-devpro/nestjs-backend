# NestJS Backend Service

This project is a simple backend service built with NestJS that allows users to manage articles. It provides capabilities to create, update, and delete articles, with data stored in a Supabase database.

## Features

- Create articles
- Update articles
- Delete articles

## Project Structure

```
nestjs-backend
├── src
│   ├── articles
│   │   ├── articles.controller.ts
│   │   ├── articles.module.ts
│   │   ├── articles.service.ts
│   │   └── dto
│   │       ├── create-article.dto.ts
│   │       ├── update-article.dto.ts
│   │       └── index.ts
│   ├── app.module.ts
│   ├── main.ts
├── package.json
├── tsconfig.json
├── ormconfig.json
└── README.md
```

## Setup Instructions

1. Clone the repository:

   ```
   git clone <repository-url>
   cd nestjs-backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Configure your Supabase database in `ormconfig.json`.

4. Run the application:
   ```
   npm run start
   ```

## Usage

Using the supabase database:
"supabase:login": "npx supabase login",
"supabase:init": "npx supabase init",
"supabase:pull": "npx supabase db pull",
"supabase:diff": "npx supabase db diff --local --remote",
"supabase:push": "npx supabase db push"

- Use the `/articles` endpoint to manage articles.
- HTTP methods:
  - `POST /articles` to create a new article.
  - `PUT /articles/:id` to update an existing article.
  - `DELETE /articles/:id` to delete an article.

# Timeout and Throttle Configuration

## Timeout

- The application uses the `@Timeout()` decorator (from NestJS Schedule module) to schedule certain tasks or delay executions.
- In our service, methods like `getArticleById` use `@Timeout()` to execute code after a set delay, helping simulate or manage asynchronous operations.
- This can be useful for scheduled clean-ups, caching refreshes, or any delayed process without blocking request handlers.

## Throttle

- Rate limiting is configured using the `ThrottlerModule` from NestJS.
- The current configuration in

app.module.ts

allows:

- **TTL (Time-To-Live):** 900 seconds (15 minutes)
- **Limit:** 100 requests per IP per TTL window
- A global guard (

ThrottlerGuard

) is provided to apply this policy across all endpoints.

- This provides basic protection against too many requests (DoS/DDoS attacks) and helps prevent abuse while ensuring normal traffic is not hindered.

Include these settings in your local or deployed environments as needed to balance performance and security.
