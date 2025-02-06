import { createMockSupabaseClient } from "./supabaseClient.mock";

export class MockSupabaseService {
  getClient() {
    return createMockSupabaseClient();
  }
}
