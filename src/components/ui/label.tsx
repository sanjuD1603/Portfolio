import { cn } from "cn";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: generic primitive; callers supply htmlFor/children.
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm font-medium leading-none select-none",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
