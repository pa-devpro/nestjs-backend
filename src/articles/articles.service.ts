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

  async create(articleToCreate: CreateArticleDto) {
    console.log("Service: articleToCreate", articleToCreate);

    const { error } = await this.supabase
      .from("saved_articles")
      .insert([articleToCreate]);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, message: `Article created successfully` };
  }

  async update(id: string, articleToUpdate: UpdateArticleDto) {
    const { error } = await this.supabase
      .from("saved_articles")
      .update(articleToUpdate)
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
    return {
      success: true,
      message: `Article #${id} updated successfully`,
    };
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from("saved_articles")
      .delete()
      .eq("id", id);
    if (error) {
      throw new Error(error.message);
    }
    return { success: true, message: `Article #${id} deleted successfully` };
  }
}
