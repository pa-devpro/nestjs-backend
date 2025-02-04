import { Module } from "@nestjs/common";
import { ArticlesModule } from "./articles/articles.module";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { SupabaseService } from "./supabase";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    ArticlesModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [SupabaseService],
})
export class AppModule {}
