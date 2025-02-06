import { CreateArticleDto } from "@/articles/dto";

export const articleMock = {
  title: "Test Article Title",
  body_raw: "Test Article Content",
  date: "2024-01-01T12:00:00Z",
  author: "Test Author",
  subtitle: "Test Subtitle",
  featured_image: "https://test-image.com/test.jpg",
  topics: ["Test Topic"],
  urlsegment: "test-article-title",
  original_url: "https://test.com/test-article",
  user_id: "test-user-123",
  generated_ai_content: "Test AI Content",
  questions_and_answers: [],
  type: "article",
} as CreateArticleDto;
