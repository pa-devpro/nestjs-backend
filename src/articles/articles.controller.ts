import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { ArticlesService } from "./articles.service";
import { CreateArticleDto, getArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { SavedArticle } from "@/supabase/supabase-types";

@Controller("articles")
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get(":id")
  async getArticle(@Param("id") id: string) {
    return this.articlesService.get(id);
  }

  @Get()
  async getArticlesByUserId(@Query("userId") userId: string) {
    return this.articlesService.getArticlesByUserId(userId);
  }

  @Post()
  async createArticle(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto);
  }

  @Put(":id")
  async updateArticle(
    @Param("id") id: string,
    @Body() updateArticleDto: UpdateArticleDto
  ) {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Delete(":id")
  async deleteArticle(@Param("id") id: string) {
    console.log("deleteArticle", id);
    return this.articlesService.delete(id);
  }
}
