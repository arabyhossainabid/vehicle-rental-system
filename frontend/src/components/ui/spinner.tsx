import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "default" | "lg" | "xl"
}

export function Spinner({ className, size = "default", ...props }: SpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        default: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12"
    }

    return (
        <div className={cn("flex justify-center items-center", className)} {...props}>
            <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        </div>
    )
}
