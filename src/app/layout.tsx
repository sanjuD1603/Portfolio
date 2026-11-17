import type { Metadata } from "next";
import { Geist_Mono, Hanken_Grotesk } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";
import Analytics from "@/components/analytics";
import { ChatProvider } from "@/components/chat/chat-provider";
import { ChatWidget } from "@/components/chat/chat-widget";
import CommandPalette from "@/components/command-palette";
import BackToTop from "@/components/common/back-to-top";
import Aurora from "@/components/effects/aurora";
import PointerEffects from "@/components/effects/pointer-effects";
import ScrollProgress from "@/components/effects/scroll-progress";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { buildCommandItems } from "@/lib/command-items";
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
 * Root layout: theme provider, view-transition page navigation and the full-width page
 * shell - animated backdrop and scroll progress bar behind, sticky navbar (with the
 * command palette), page content, footer, then the floating back-to-top button, chat
 * widget and (opt-in) analytics. Every page renders inside it.
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
        data-scroll-behavior="smooth"
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ChatProvider>
              <ScrollProgress />
              <Aurora />
              <PointerEffects />
              <Navbar>
                <CommandPalette items={buildCommandItems()} />
              </Navbar>
              <div className="relative z-10 flex flex-1 flex-col">
                {children}
              </div>
              <Footer />
              <BackToTop />
              <ChatWidget />
              <Analytics />
            </ChatProvider>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
