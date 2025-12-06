import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function VehiclesLoading() {
    return (
        <div className="container py-10">
            <Skeleton className="h-10 w-48 mb-8" /> {/* Title skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                        <div className="aspect-video bg-muted relative">
                            <Skeleton className="h-full w-full" />
                        </div>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <Skeleton className="h-6 w-16" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-24" />
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-10 w-full" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
