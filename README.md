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

Error Handling Documentation
This document outlines the error handling changes implemented in the Articles Service. The goal was to ensure a consistent and robust approach for managing expected and unexpected errors, while providing clear, actionable feedback in both logs and API responses.

#### Key Changes

##### 1. Global Exception Filtering

Global Filter Registration:
The application now registers a global exception filter (see configApp.ts), which catches all instances of HttpException and formats their responses consistently.
Custom Message:
The filter appends custom information to errors (except for validation errors) so that error responses are uniform.

##### 2. Validation of Input Parameters

Early Validation:
Controllers (or a global pipeline) validate required parameters (e.g., userId in getArticlesByUserId).
Bad Request:
If a required parameter is missing, a HttpException with status 400 BAD REQUEST is thrown immediately.

##### 3. Custom Exception Classes

DatabaseException:
Used to wrap errors returned from the database (Supabase) in operations such as fetching, inserting, or updating articles.
ConflictException:
Thrown when duplicate articles are detected (based on a combination of title and user_id), returning a 409 CONFLICT HTTP status.

##### 4. Logging and Debugging Enhancements

Detailed Logging:
Logging statements are added before and after database calls to trace the flow of execution.
Error Context:
When errors occur, additional context (e.g., user ID or article ID) is logged to simplify troubleshooting.

##### 5. Handling of Unexpected Errors

Generic Internal Server Error:
In catch blocks, if the caught error is not already an HttpException, it is wrapped in a generic HttpException with status 500 INTERNAL SERVER ERROR.

### Summary

The error handling strategy in the Articles Service consists of:

- Early and consistent validation: Ensuring all required inputs are validated.
- Consistent error responses: All errors are handled via a global exception filter and custom exception classes, ensuring standard error payloads.
- Enhanced logging: Detailed logging across service methods provides better insight into failures and helps with debugging.

These improvements make the application more robust, maintainable, and easier to troubleshoot in production.
