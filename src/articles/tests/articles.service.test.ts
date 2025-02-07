import { Test, TestingModule } from "@nestjs/testing";
import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import { ArticlesService } from "../articles.service";
import { SupabaseService } from "@/supabase";
import { MockSupabaseService } from "@/tests/mocks/supabaseService.mock";
import { DatabaseException } from "@/common/exceptions/database.exception";
import { SupabaseClient } from "@supabase/supabase-js";
import { articleMock } from "@/tests/mocks/data.mocks";

describe("ArticlesService", () => {
  let service: ArticlesService;
  let mockSupabaseClient: any;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: SupabaseService, useClass: MockSupabaseService },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    const supabaseService = module.get<SupabaseService>(SupabaseService);
    mockSupabaseClient = supabaseService.getClient();

    jest.resetAllMocks();
    mockSupabaseClient = {
      from: jest.fn(),
    } as unknown as SupabaseClient;

    jest
      .spyOn(supabaseService, "getClient")
      .mockReturnValue(mockSupabaseClient);

    service = new ArticlesService(supabaseService);
  });

  afterAll(() => {
    jest.clearAllTimers();
  });

  describe("getArticlesByUserId", () => {
    it("should fetch articles by user id", async () => {
      // Override chain methods in the mock for this test:
      mockSupabaseClient.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            returns: jest.fn().mockResolvedValue({
              data: [{ id: "1", title: "Test Article", user_id: "user1" }],
              error: null,
            }),
          }),
        }),
      });

      const articles = await service.getArticlesByUserId("user1", "test-token");
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("saved_articles");

      console.log({ articles });
      expect(articles).toBeDefined();
      expect(articles).toHaveLength(1);
      expect(articles[0].id).toEqual("1");
    });

    it("should throw error if user id is missing", async () => {
      await expect(
        service.getArticlesByUserId("", "test-token")
      ).rejects.toThrow(
        new HttpException("User ID is required", HttpStatus.BAD_REQUEST)
      );
    });

    it("should throw a DatabaseException when supabase returns an error", async () => {
      mockSupabaseClient.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            returns: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Simulated supabase error" },
            }),
          }),
        }),
      });

      await expect(
        service.getArticlesByUserId("user1", "test-token")
      ).rejects.toThrow(DatabaseException);
    });
  });

  describe("getArticleById", () => {
    it("should fetch article by id", async () => {
      mockSupabaseClient.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: "1", title: "Test Article", user_id: "user1" },
              error: null,
            }),
          }),
        }),
      });

      const article = await service.getArticleById("1", "test-token");
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("saved_articles");

      expect(article).toBeDefined();
      expect(article.id).toEqual("1");
    });

    it("should throw error if article id is missing", async () => {
      await expect(service.getArticleById("", "test-token")).rejects.toThrow(
        new HttpException("Article ID is required", HttpStatus.BAD_REQUEST)
      );
    });

    it("should throw a DatabaseException when supabase returns an error", async () => {
      mockSupabaseClient.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Simulated supabase error" },
            }),
          }),
        }),
      });

      await expect(service.getArticleById("1", "test-token")).rejects.toThrow(
        DatabaseException
      );
    });

    it("should throw a NotFoundException when article is not found", async () => {
      mockSupabaseClient.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      await expect(service.getArticleById("1", "test-token")).rejects.toThrow(
        new HttpException("Article with id 1 not found", HttpStatus.NOT_FOUND)
      );
    });
  });

  describe("createArticle", () => {
    const userId = "test-user-123";

    it("should throw UnauthorizedException when user_id doesnt match", async () => {
      await expect(
        service.create(
          { ...articleMock, user_id: "different-id" },
          "actual-user-id",
          "test-token"
        )
      ).rejects.toThrow(UnauthorizedException);
    });
    it("should create an article", async () => {
      // First call: Duplicate check returns an empty array
      const duplicateCheckMock = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              returns: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      };

      // Second call: Insert call returns created article id
      const insertMock = {
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: "2" },
              error: null,
            }),
          }),
        }),
      };

      // Third call: Get created article
      const getArticleMock = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: "2", title: "Last test" },
              error: null,
            }),
          }),
        }),
      };

      // Setup the three calls on .from() in sequence
      mockSupabaseClient.from
        .mockReturnValueOnce(duplicateCheckMock)
        .mockReturnValueOnce(insertMock)
        .mockReturnValueOnce(getArticleMock);

      const article = await service.create(articleMock, userId, "test-token");

      // Expect that the from method was called twice with "saved_articles"
      expect(mockSupabaseClient.from).toHaveBeenNthCalledWith(
        1,
        "saved_articles"
      );
      expect(mockSupabaseClient.from).toHaveBeenNthCalledWith(
        2,
        "saved_articles"
      );

      // Verify that the returned response is as expected.
      expect(article).toEqual({
        success: true,
        message: "Article #2 created successfully",
      });
    });

    it("should throw a DatabaseException when duplicate article exists", async () => {
      const duplicateCheckMock = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              returns: jest.fn().mockResolvedValue({
                data: [{ id: "1", title: "Test Article" }],
                error: null,
              }),
            }),
          }),
        }),
      };

      mockSupabaseClient.from = jest.fn().mockReturnValue(duplicateCheckMock);

      await expect(
        service.create(articleMock, userId, "test-token")
      ).rejects.toThrow(new DatabaseException("Article already exists"));
    });

    it("should throw a DatabaseException when supabase returns an error", async () => {
      const duplicateCheckMock = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              returns: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "Simulated supabase error" },
              }),
            }),
          }),
        }),
      };

      mockSupabaseClient.from = jest.fn().mockReturnValue(duplicateCheckMock);

      await expect(
        service.create(articleMock, userId, "test-token")
      ).rejects.toThrow(DatabaseException);
    });

    it("should throw a DatabaseException when insert returns an error", async () => {
      const duplicateCheckMock = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              returns: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      };

      const insertMock = {
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Simulated supabase error" },
            }),
          }),
        }),
      };

      mockSupabaseClient.from = jest
        .fn()
        .mockReturnValueOnce(duplicateCheckMock)
        .mockReturnValueOnce(insertMock);

      await expect(
        service.create(articleMock, userId, "test-token")
      ).rejects.toThrow(DatabaseException);
    });

    it("should throw a HttpException when unexpected error occurs", async () => {
      const duplicateCheckMock = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              returns: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      };

      const insertMock = {
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockRejectedValue(new Error("Unexpected error")),
          }),
        }),
      };

      mockSupabaseClient.from = jest
        .fn()
        .mockReturnValueOnce(duplicateCheckMock)
        .mockReturnValueOnce(insertMock);

      await expect(
        service.create(articleMock, userId, "test-token")
      ).rejects.toThrow(
        new HttpException(
          "Internal server error",
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });

    it("should throw a HttpException when HttpException is thrown", async () => {
      const duplicateCheckMock = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              returns: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      };

      const insertMock = {
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockRejectedValue(
                new HttpException("Test error", HttpStatus.BAD_REQUEST)
              ),
          }),
        }),
      };

      mockSupabaseClient.from = jest
        .fn()
        .mockReturnValueOnce(duplicateCheckMock)
        .mockReturnValueOnce(insertMock);

      await expect(
        service.create(articleMock, userId, "test-token")
      ).rejects.toThrow(
        new HttpException("Test error", HttpStatus.BAD_REQUEST)
      );
    });

    it("should throw a HttpException when unexpected error occurs", async () => {
      const duplicateCheckMock = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              returns: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      };

      const insertMock = {
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockRejectedValue(new Error("Unexpected error")),
          }),
        }),
      };

      mockSupabaseClient.from = jest
        .fn()
        .mockReturnValueOnce(duplicateCheckMock)
        .mockReturnValueOnce(insertMock);

      await expect(
        service.create(articleMock, userId, "test-token")
      ).rejects.toThrow(
        new HttpException(
          "Internal server error",
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe("updateArticle", () => {
    it("should update an article", async () => {
      const updateMock = {
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: "1" },
                error: null,
              }),
            }),
          }),
        }),
      };

      mockSupabaseClient.from = jest.fn().mockReturnValueOnce(updateMock);

      const result = await service.update("1", articleMock, "test-token");

      expect(mockSupabaseClient.from).toHaveBeenNthCalledWith(
        1,
        "saved_articles"
      );

      expect(result).toBeDefined();
      expect(result.success).toBeTruthy();
      expect(result.message).toEqual("Article #1 updated successfully");
    });

    it("should throw a DatabaseException when supabase returns an error", async () => {
      const updateMock = {
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "Simulated supabase error" },
              }),
            }),
          }),
        }),
      };

      mockSupabaseClient.from = jest.fn().mockReturnValueOnce(updateMock);

      await expect(
        service.update("1", articleMock, "test-token")
      ).rejects.toThrow(DatabaseException);
    });

    it("should throw a HttpException when article id is missing", async () => {
      await expect(
        service.update("", articleMock, "test-token")
      ).rejects.toThrow(
        new HttpException("Internal server error", HttpStatus.BAD_REQUEST)
      );
    });

    it("should throw a HttpException when unexpected error occurs", async () => {
      const updateMock = {
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest
                .fn()
                .mockRejectedValue(new Error("Unexpected error")),
            }),
          }),
        }),
      };

      mockSupabaseClient.from = jest.fn().mockReturnValueOnce(updateMock);

      await expect(
        service.update("1", articleMock, "test-token")
      ).rejects.toThrow(
        new HttpException(
          "Internal server error",
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe("deleteArticle", () => {
    it("should delete an article", async () => {
      const deleteMock = {
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: "1" },
                error: null,
              }),
            }),
          }),
        }),
      };

      mockSupabaseClient.from = jest.fn().mockReturnValueOnce(deleteMock);

      const result = await service.delete("1", "test-token");

      expect(mockSupabaseClient.from).toHaveBeenNthCalledWith(
        1,
        "saved_articles"
      );

      expect(result).toBeDefined();
      expect(result.success).toBeTruthy();
      expect(result.message).toEqual("Article #1 deleted successfully");
    });

    it("should throw a DatabaseException when supabase returns an error", async () => {
      const deleteMock = {
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "Simulated supabase error" },
              }),
            }),
          }),
        }),
      };

      mockSupabaseClient.from = jest.fn().mockReturnValueOnce(deleteMock);

      await expect(service.delete("1", "test-token")).rejects.toThrow(
        DatabaseException
      );
    });

    it("should throw a HttpException when article id is missing", async () => {
      await expect(service.delete("", "test-token")).rejects.toThrow(
        new HttpException("Internal server error", HttpStatus.BAD_REQUEST)
      );
    });

    it("should throw a HttpException when unexpected error occurs", async () => {
      const deleteMock = {
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest
                .fn()
                .mockRejectedValue(new Error("Unexpected error")),
            }),
          }),
        }),
      };

      mockSupabaseClient.from = jest.fn().mockReturnValueOnce(deleteMock);

      await expect(service.delete("1", "test-token")).rejects.toThrow(
        new HttpException(
          "Internal server error",
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });
});
