"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
// import { toast } from "@/components/ui/use-toast" // Toast deprecated, using alert for now

interface Vehicle {
    id: string
    vehicle_name: string
    type: string
    daily_rent_price: number
    availability_status: string
    description?: string
}

export default function VehicleDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [vehicle, setVehicle] = useState<Vehicle | null>(null)
    const [loading, setLoading] = useState(true)
    const [startDate, setStartDate] = useState<Date>()
    const [endDate, setEndDate] = useState<Date>()
    const [bookingLoading, setBookingLoading] = useState(false)

    useEffect(() => {
        async function fetchVehicle() {
            try {
                const res = await fetch(`/api/v1/vehicles/${params.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setVehicle(data.data)
                }
            } catch (error) {
                console.error("Failed to fetch vehicle", error)
            } finally {
                setLoading(false)
            }
        }
        fetchVehicle()
    }, [params.id])

    async function handleBook() {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }

        if (!startDate || !endDate) {
            return
        }

        setBookingLoading(true)
        try {
            const res = await fetch('/api/v1/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    vehicle_id: vehicle?.id,
                    rent_start_date: startDate.toISOString(),
                    rent_end_date: endDate.toISOString()
                })
            })

            const data = await res.json()

            if (res.ok) {
                alert("Booking created successfully!")
                router.push('/dashboard')
            } else {
                alert(data.message || "Failed to book vehicle")
            }
        } catch (error) {
            alert("Something went wrong. Please try again.")
        } finally {
            setBookingLoading(false)
        }
    }

    if (loading) return <div className="p-10 text-center">Loading vehicle details...</div>
    if (!vehicle) return <div className="p-10 text-center">Vehicle not found</div>

    return (
        <div className="container py-10">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="aspect-video bg-muted relative rounded-lg overflow-hidden flex items-center justify-center bg-secondary">
                        <img
                            src="/car-placeholder.png"
                            alt={vehicle.vehicle_name}
                            className="object-cover w-full h-full"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">{vehicle.vehicle_name}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant={vehicle.availability_status === 'available' ? 'default' : 'secondary'}>
                                {vehicle.availability_status}
                            </Badge>
                            <span className="text-muted-foreground capitalize">{vehicle.type}</span>
                        </div>
                    </div>

                    <div className="text-3xl font-bold">
                        ${vehicle.daily_rent_price}
                        <span className="text-lg font-normal text-muted-foreground">/day</span>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Book this vehicle</CardTitle>
                            <CardDescription>Select your dates to check availability</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Start Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "justify-start text-left font-normal",
                                                !startDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={setStartDate}
                                            initialFocus
                                            disabled={(date) => date < new Date()}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">End Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "justify-start text-left font-normal",
                                                !endDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={setEndDate}
                                            initialFocus
                                            disabled={(date) => date < (startDate || new Date())}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleBook}
                                disabled={bookingLoading || vehicle.availability_status !== 'available'}
                            >
                                {bookingLoading ? "Processing..." : "Confirm Booking"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
