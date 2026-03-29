import { cx } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cx("bg-tint animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
