import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 border font-mono font-semibold uppercase tracking-wide whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-black/30 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default: "border-black bg-black text-white hover:bg-white hover:text-black",
        outline:
          "border-black/30 bg-white text-black/60 hover:border-black hover:text-black",
        secondary: "border-black bg-black/5 text-black hover:bg-black/10",
        ghost: "border-transparent text-black/50 hover:text-black",
        destructive:
          "border-red-600/40 bg-white text-red-600 hover:border-red-600 hover:bg-red-600 hover:text-white",
        link: "border-transparent p-0! text-black underline underline-offset-4 hover:no-underline",
      },
      size: {
        default: "h-auto px-4 py-1.5 text-[11px]",
        sm: "h-auto px-3 py-1 text-[10px]",
        lg: "h-auto w-full px-4 py-3 text-[12px]",
        icon: "size-8 p-0",
        "icon-xs": "size-6 p-0",
        "icon-sm": "size-7 p-0",
        "icon-lg": "size-9 p-0",
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
