import { Module } from "@nestjs/common";
import { ArticlesModule } from "./articles/articles.module";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { SupabaseService } from "./supabase";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    ArticlesModule,
  ],
  controllers: [AppController],
  providers: [SupabaseService],
})
export class AppModule {}
