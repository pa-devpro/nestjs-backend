import { Module } from "@nestjs/common";
import { ArticlesController } from "./articles.controller";
import { ArticlesService } from "./articles.service";
import { SupabaseService } from "@/supabase";

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService, SupabaseService],
})
export class ArticlesModule {}
