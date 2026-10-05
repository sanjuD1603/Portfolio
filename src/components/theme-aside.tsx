import ThemeToggleCircle from "@/components/common/theme-toggle-circle";
import ContactPopup from "@/components/contact-popup";

export default function ThemeAside() {
  return (
    <aside className="fixed right-6 top-4 z-50 flex items-center gap-2">
      <ContactPopup />
      <ThemeToggleCircle />
    </aside>
  );
}
