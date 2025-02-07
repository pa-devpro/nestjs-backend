import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { SupabaseClient } from "@supabase/supabase-js";
import { SavedArticle } from "@/supabase/supabase-types";
import { CreateArticleDto } from "./dto";
import { Timeout } from "@/common/timeout.decorator";
import { DatabaseException } from "@/common/exceptions/database.exception";
import { SupabaseService } from "@/supabase";

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(private supabaseService: SupabaseService) {}

  @Timeout()
  async getArticleById(id: string, token: string): Promise<SavedArticle> {
    try {
      if (!id) {
        this.logger.warn("Article ID is required");
        throw new HttpException(
          "Article ID is required",
          HttpStatus.BAD_REQUEST
        );
      }

      const supabase = await this.supabaseService.getClient(token);

      this.logger.debug(`Fetching article with id: ${id}`);

      const { data, error: databaseError } = await supabase
        .from("saved_articles")
        .select("*")
        .eq("id", id)
        .single<SavedArticle>();

      if (databaseError) {
        throw new DatabaseException(databaseError.message);
      }

      if (!data) {
        throw new NotFoundException(`Article with id ${id} not found`);
      }

      this.logger.debug(`Successfully fetched article ${data.id}`);
      return data;
    } catch (error) {
      this.logger.error(
        `Unexpected error in get(${id}): ${(error as any).message}`
      );

      // Rethrow the error as an HttpException if it's not already one.
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Timeout()
  async getArticlesByUserId(
    userId: string,
    token: string
  ): Promise<SavedArticle[]> {
    try {
      if (!userId) {
        this.logger.warn("User ID is required");
        throw new HttpException("User ID is required", HttpStatus.BAD_REQUEST);
      }

      const supabase = await this.supabaseService.getClient(token);

      this.logger.debug(`Fetching articles for user with id: ${userId}`);

      const { data, error } = await supabase
        .from("saved_articles")
        .select("*")
        .eq("user_id", userId)
        .returns<SavedArticle[]>();

      if (error) {
        this.logger.error(
          `Error fetching articles for user ${userId}: ${error.message}`
        );
        throw new DatabaseException(error.message);
      }

      this.logger.debug(`Successfully fetched articles for user ${userId}`);
      return data || [];
    } catch (error) {
      this.logger.error(
        `Unexpected error in getArticlesByUserId(${userId}): ${
          (error as any).message
        }`
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Timeout()
  async create(
    articleToCreate: CreateArticleDto,
    userId: string,
    token: string
  ) {
    try {
      this.logger.debug("Creating article", articleToCreate.user_id);

      if (userId !== articleToCreate.user_id) {
        throw new UnauthorizedException("User ID mismatch");
      }

      const supabase = await this.supabaseService.getClient(token);

      // Check for duplicates based on URL and user_id
      const { data: existingArticle, error: checkError } = await supabase
        .from("saved_articles")
        .select("*")
        .eq("title", articleToCreate.title)
        .eq("user_id", userId)
        .returns<SavedArticle[]>();

      if (checkError && checkError.code !== "PGRST116") {
        throw new DatabaseException(checkError.message);
      }

      if (existingArticle?.length !== 0) {
        throw new ConflictException("Article already exists");
      }

      // If article for user does not exist, create it
      const { data: articleCreated, error: databaseError } = await supabase
        .from("saved_articles")
        .insert(articleToCreate)
        .select("id")
        .single<SavedArticle>();

      if (databaseError) {
        throw new DatabaseException(databaseError.message);
      }

      this.logger.debug(`Article #${articleCreated.id} created successfully`, {
        articleCreated,
      });
      return {
        success: true,
        message: `Article #${articleCreated.id} created successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Unexpected error in create(${articleToCreate}): ${
          (error as any).message
        }`
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Timeout()
  async update(id: string, articleToUpdate: UpdateArticleDto, token: string) {
    try {
      this.logger.debug(`Updating article with id: ${id}`);

      const supabase = await this.supabaseService.getClient(token);

      const { data: articleUpdated, error } = await supabase
        .from("saved_articles")
        .update(articleToUpdate)
        .eq("id", id)
        .select("id")
        .single<Pick<SavedArticle, "id">>();

      if (error) {
        this.logger.error(`Error updating article ${id}: ${error.message}`);
        throw new DatabaseException(
          error.message || `Error updating article ${id}`
        );
      }
      return {
        success: true,
        message: `Article #${articleUpdated.id} updated successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Unexpected error in update(${id}): ${(error as any).message}`
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Timeout()
  async delete(id: string, token: string) {
    try {
      this.logger.debug(`Deleting article with id: ${id}`);

      const supabase = await this.supabaseService.getClient(token);
      const { data: articleDeleted, error } = await supabase
        .from("saved_articles")
        .delete()
        .eq("id", id)
        .select("id")
        .single<{ id: number }>();

      if (error) {
        this.logger.error(`Error deleting article ${id}: ${error.message}`);
        throw new DatabaseException(
          error.message || `Error deleting article ${id}`
        );
      }
      return {
        success: true,
        message: `Article #${articleDeleted.id} deleted successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Unexpected error in delete(${id}): ${(error as any).message}`
      );

      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
