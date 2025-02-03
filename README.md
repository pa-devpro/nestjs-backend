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
