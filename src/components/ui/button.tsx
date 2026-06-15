import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-bold whitespace-nowrap transition-all duration-200 outline-none select-none hover:-translate-y-0.5 focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/20 active:translate-y-px disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:h-4 [&_svg:not([class*='size-'])]:w-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_14px_24px_-18px_color-mix(in_oklab,var(--primary)_70%,black)] hover:bg-primary/90",
        outline:
          "border-border bg-white text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary",
        ghost:
          "shadow-none hover:bg-muted hover:text-foreground aria-expanded:bg-muted",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "shadow-none text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-2 px-4",
        xs: "h-7 gap-1 rounded-md px-2 text-xs [&_svg:not([class*='size-'])]:h-3 [&_svg:not([class*='size-'])]:w-3",
        sm: "h-9 gap-1.5 rounded-md px-3 text-[0.8rem] [&_svg:not([class*='size-'])]:h-3.5 [&_svg:not([class*='size-'])]:w-3.5",
        lg: "h-11 gap-2 px-5",
        icon: "h-10 w-10",
        "icon-xs":
          "h-7 w-7 rounded-md [&_svg:not([class*='size-'])]:h-3 [&_svg:not([class*='size-'])]:w-3",
        "icon-sm":
          "h-8 w-8 rounded-md",
        "icon-lg": "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
