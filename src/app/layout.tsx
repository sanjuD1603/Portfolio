import type { Metadata } from "next";
import { Geist_Mono, Hanken_Grotesk } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";
import Analytics from "@/components/analytics";
import { ChatProvider } from "@/components/chat/chat-provider";
import { ChatWidget } from "@/components/chat/chat-widget";
import CommandPalette from "@/components/command-palette";
import BackToTop from "@/components/common/back-to-top";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/providers/theme-provider";
import ThemeAside from "@/components/theme-aside";
import { buildCommandItems } from "@/lib/command-items";
import { ReactLenis } from "@/lib/lenis";
import { cn } from "@/lib/utils";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Site-wide metadata (title and description). */
export const metadata: Metadata = {
  title: "Mogili Dinesh Reddy | Portfolio",
  description: "Portfolio website of Mogili Dinesh Reddy",
};

/**
 * Root layout: theme provider, Lenis smooth scrolling, view-transition page
 * navigation, shared navbar, floating controls, command palette, chat widget
 * and (opt-in) analytics. Every page
 * renders inside it.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        className={cn(
          "h-full",
          "antialiased",
          hankenGrotesk.variable,
          geistMono.variable,
          "font-sans",
        )}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ReactLenis root>
              <ChatProvider>
                <ThemeAside>
                  <CommandPalette items={buildCommandItems()} />
                </ThemeAside>
                <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col border-x">
                  <Navbar />
                  {children}
                </div>
                <BackToTop />
                <ChatWidget />
                <Analytics />
              </ChatProvider>
            </ReactLenis>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
