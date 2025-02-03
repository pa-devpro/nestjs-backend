import { Injectable } from "@nestjs/common";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "@/supabase";
import { SavedArticle } from "@/supabase/supabase-types";
import { CreateArticleDto } from "./dto";

@Injectable()
export class ArticlesService {
  private supabase: SupabaseClient;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  async get(id: string): Promise<SavedArticle> {
    const { data, error } = await this.supabase
      .from("saved_articles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data || {};
  }

  async getArticlesByUserId(userId: string): Promise<SavedArticle[]> {
    const { data, error } = await this.supabase
      .from("saved_articles")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  private renameKeys(obj: any, newKeys: any) {
    const keyValues = Object.keys(obj).map((key) => {
      const newKey = newKeys[key] || key;
      return { [newKey]: obj[key] };
    });
    return Object.assign({}, ...keyValues);
  }

  async create(articleToCreate: CreateArticleDto) {
    articleToCreate = this.renameKeys(articleToCreate, {
      generatedAiContent: "generated_ai_content",
      questionsAndAnswers: "questions_and_answers",
    });

    const { error } = await this.supabase
      .from("saved_articles")
      .insert([articleToCreate]);

    if (error) {
      throw new Error(error.message);
    }
    return { success: true };
  }

  async update(id: string, updateArticleDto: UpdateArticleDto) {
    const { data, error } = await this.supabase
      .from("saved_articles")
      .update(updateArticleDto)
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from("saved_articles")
      .delete()
      .eq("id", id);
    if (error) {
      throw new Error(error.message);
    }
    return { success: true };
  }
}
