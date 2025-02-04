import { SavedArticle } from "@/supabase/supabase-types";
import { IsOptional } from "class-validator";

export class UpdateArticleDto {
  @IsOptional()
  questions_and_answers?: SavedArticle["questions_and_answers"];
}
