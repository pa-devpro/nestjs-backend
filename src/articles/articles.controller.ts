import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ConflictException,
} from "@nestjs/common";
import { ArticlesService } from "./articles.service";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { AuthGuard } from "@/auth/auth.guard";
import { User } from "@/common/user.decorator";

@Controller("articles")
@UseGuards(AuthGuard)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  async getArticlesByUserId(@User() user: { id: string }) {
    console.log("getArticlesByUserId", user.id);
    return this.articlesService.getArticlesByUserId(user.id);
  }

  @Get(":id")
  async getArticle(@Param("id") id: string) {
    return this.articlesService.getArticleById(id);
  }

  @Post()
  async createArticle(
    @Body() createArticleDto: CreateArticleDto,
    @User() user: { id: string }
  ) {
    return this.articlesService.create(createArticleDto, user.id);
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
