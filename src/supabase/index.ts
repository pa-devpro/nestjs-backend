import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SupabaseClient, createClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    const supabaseAnonKey = this.configService.get<string>("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase credentials are not provided in environment variables"
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  async getClient(authToken?: string): Promise<SupabaseClient> {
    if (authToken) {
      console.log("Setting auth token", authToken);
      // Set auth context when token provided
      await this.supabase.auth.setSession({
        access_token: authToken,
        refresh_token: "",
      });
    }
    return createClient(
      this.configService.get("SUPABASE_URL")!,
      this.configService.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      }
    );
  }
}
