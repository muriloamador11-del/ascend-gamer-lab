import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:border-sky-400 focus-visible:ring-sky-400/25 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default:
          "border border-sky-500/20 bg-sky-500 text-white shadow-[0_10px_24px_rgba(14,165,233,0.22)] hover:bg-sky-600",
        destructive:
          "border border-red-200 bg-red-600 text-white shadow-sm hover:bg-red-700",
        outline:
          "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700",
        secondary:
          "border border-slate-200 bg-slate-100 text-slate-800 shadow-sm hover:bg-slate-200",
        ghost:
          "text-slate-600 hover:bg-sky-50 hover:text-sky-700",
        link:
          "text-sky-600 underline-offset-4 hover:text-sky-700 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-xl px-6 has-[>svg]:px-4",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };