import { Timeout } from "./timeout.decorator";
import { RequestTimeoutException } from "@nestjs/common";

class TestService {
  @Timeout(100) // set timeout to 100ms
  async slowMethod(): Promise<string> {
    // this promise resolves after 200ms, so it should time out
    return new Promise((resolve) => setTimeout(() => resolve("Done"), 200));
  }
}

describe("Timeout Decorator", () => {
  let service: TestService;
  beforeEach(() => {
    service = new TestService();
  });

  it("should throw RequestTimeoutException if execution exceeds timeout", async () => {
    await expect(service.slowMethod()).rejects.toThrow(RequestTimeoutException);
  });
});
