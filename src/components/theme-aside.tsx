import CalBooking from "@/components/cal-booking";
import ThemeToggleCircle from "@/components/common/theme-toggle-circle";

/** Fixed top-right cluster: optional `children` (e.g. the command palette), schedule-a-call button and theme toggle. */
export default function ThemeAside({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <aside className="fixed right-6 top-3.5 z-50 sm:top-2 flex items-center gap-2">
      {children}
      <CalBooking variant="default" className="" />
      <ThemeToggleCircle />
    </aside>
  );
}
