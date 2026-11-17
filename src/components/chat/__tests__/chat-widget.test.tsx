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

// The real booker loads the Cal.com iframe; the widget only needs to know it is mounted.
vi.mock("@/components/cal-booking", () => ({
  Booker: () => <div data-testid="cal-booker" />,
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

// Each test re-imports the widget (gsap, icons, UI kit) after `vi.resetModules()`; under a full
// parallel run that cold import can exceed the default 5s, so allow for it.
describe("ChatWidget", { timeout: 20_000 }, () => {
  it("opens the chat panel when the launcher is clicked", async () => {
    await mount();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));
    });
    expect(screen.getByText(/Ask about/)).not.toBeNull();
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

  it("swaps the chat for the Cal.com booker via 'Book a call' and back again", async () => {
    await mount();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Open chat" }));
    });
    expect(screen.queryByTestId("cal-booker")).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Book a call/ }));
    });
    expect(screen.getByTestId("cal-booker")).not.toBeNull();
    expect(screen.queryByText("Message me")).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Back to chat" }));
    });
    expect(screen.queryByTestId("cal-booker")).toBeNull();
  });
});
