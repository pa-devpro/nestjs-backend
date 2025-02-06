import { Test, TestingModule } from "@nestjs/testing";
import { AuthGuard } from "./auth.guard";
import { SupabaseService } from "../supabase";
import { UnauthorizedException } from "@nestjs/common";
import { createMockContext } from "@/tests/utils/context.mock";
describe("AuthGuard", () => {
  let guard: AuthGuard;
  let mockSupabaseService: any;

  beforeEach(async () => {
    mockSupabaseService = {
      getClient: jest.fn().mockReturnValue({
        auth: {
          getUser: jest.fn(),
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  it("should allow valid token", async () => {
    const mockUser = { id: "1", email: "test@example.com" };
    mockSupabaseService.getClient().auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const context = createMockContext({
      headers: { authorization: "Bearer valid-token" },
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it("should reject invalid token", async () => {
    mockSupabaseService.getClient().auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid token" },
    });

    const context = createMockContext({
      headers: { authorization: "Bearer invalid-token" },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException
    );
  });
});
