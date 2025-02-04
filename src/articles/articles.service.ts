import { Injectable, Logger, RequestTimeoutException } from "@nestjs/common";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "@/supabase";
import { SavedArticle } from "@/supabase/supabase-types";
import { CreateArticleDto } from "./dto";
import { Timeout } from "@/common/timeout.decorator";

@Injectable()
export class ArticlesService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(ArticlesService.name);

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
    this.logger.log("ArticlesService initialized");
  }

  @Timeout()
  async getArticleById(id: string): Promise<SavedArticle> {
    try {
      if (!id) {
        this.logger.warn("Article ID is required");
        throw new Error("Article ID is required");
      }

      this.logger.debug(`Fetching article with id: ${id}`);

      const { data } = await this.supabase
        .from("saved_articles")
        .select("*")
        .eq("id", id)
        .single();

      this.logger.debug(`Successfully fetched article ${id}`);
      return data || {};
    } catch (error) {
      this.logger.error(
        `Unexpected error in get(${id}): ${(error as any).message}`
      );
      throw error;
    }
  }

  @Timeout()
  async getArticlesByUserId(userId: string): Promise<SavedArticle[]> {
    try {
      const { data, error } = await this.supabase
        .from("saved_articles")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      this.logger.error(
        `Unexpected error in getArticlesByUserId(${userId}): ${
          (error as any).message
        }`
      );
      throw error;
    }
  }

  @Timeout()
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

  @Timeout()
  async update(id: string, articleToUpdate: UpdateArticleDto) {
    try {
      this.logger.debug(`Updating article with id: ${id}`);
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
    } catch (error) {
      this.logger.error(
        `Unexpected error in update(${id}): ${(error as any).message}`
      );
      throw error;
    }
  }

  @Timeout()
  async delete(id: string) {
    try {
      const { error } = await this.supabase
        .from("saved_articles")
        .delete()
        .eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
      return {
        success: true,
        message: `Article #${id} deleted successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Unexpected error in delete(${id}): ${(error as any).message}`
      );
      throw error;
    }
  }
}
