// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
  sessionStorage.clear();
});

async function mount() {
  vi.stubEnv("NEXT_PUBLIC_WORKER_API_URL", "https://api.example.test");
  const { ChatProvider } = await import("../chat-provider");
  const { ChatWidget } = await import("../chat-widget");
  render(
    <ChatProvider>
      <ChatWidget />
    </ChatProvider>,
  );
}

describe("ChatWidget", () => {
  it("opens a panel that Lenis smooth-scroll leaves alone, so wheel scrolling stays inside the chat", async () => {
    await mount();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));
    });
    const panel = document.querySelector("[data-lenis-prevent]");
    expect(panel).not.toBeNull();
    expect(panel?.textContent).toContain("Ask about");
  });

  it("greets the visitor by first name and streams the reply into the transcript", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.endsWith("/sessions")) {
          return {
            ok: true,
            status: 201,
            json: async () => ({ sessionToken: "t" }),
          };
        }
        const enc = new TextEncoder();
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "text/event-stream" }),
          body: new ReadableStream<Uint8Array>({
            start(c) {
              c.enqueue(
                enc.encode(
                  'event: delta\ndata: {"text":"See [Projects](/projects)."}\n\nevent: done\ndata: {}\n\n',
                ),
              );
              c.close();
            },
          }),
        };
      }),
    );
    await mount();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));
    });

    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "Ada Lovelace" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your email"), {
      target: { value: "ada@example.test" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Start chat" }));
    });
    expect(await screen.findByText(/Hi Ada!/)).toBeTruthy();

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "What has he built?" }),
      );
    });
    const link = await screen.findByRole("link", { name: "Projects" });
    expect(link.getAttribute("href")).toBe("/projects");
    // Anchoring would jump the transcript so the visitor's message sits at the top on every send.
    expect(
      document.querySelectorAll('[data-scroll-anchor="true"]'),
    ).toHaveLength(0);
    // The visitor's avatar carries their initials.
    expect(screen.getAllByText("AL").length).toBeGreaterThan(0);
  });
});
