import { Module } from "@nestjs/common";
import { ArticlesModule } from "./articles/articles.module";
import { AppController } from "./app.controller";
import { ConfigModule } from "@nestjs/config";
import { SupabaseService } from "./supabase";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD, Reflector } from "@nestjs/core";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 900, // 15 minutes
        limit: 100, // 100 requests per TTL window per IP
      },
    ]),
    ArticlesModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    SupabaseService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
