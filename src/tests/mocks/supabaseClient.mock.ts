export const createMockSupabaseClient = () => ({
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        returns: jest.fn(() => ({
          then: jest.fn((cb) =>
            Promise.resolve(
              cb({
                data: [{ id: "1", title: "Test Article", user_id: "user1" }],
                error: null,
              })
            )
          ),
        })),
        single: jest.fn(() => ({
          then: jest.fn((cb) =>
            Promise.resolve(
              cb({
                data: { id: "1", title: "Test Article", user_id: "user1" },
                error: null,
              })
            )
          ),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() =>
          Promise.resolve({ data: { id: "2" }, error: null })
        ),
      })),
    })),
  })),
});
