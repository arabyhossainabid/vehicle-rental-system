"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Car, Calendar, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"

// Helper to safely format dates
const safeFormat = (dateString: string) => {
    try {
        return format(new Date(dateString), 'PPP')
    } catch (error) {
        return 'Invalid Date'
    }
}

interface CustomerViewProps {
    user: any
    bookings: any[]
    setBookings: (bookings: any[]) => void
    loading: boolean
}

export function CustomerView({ user, bookings, setBookings, loading }: CustomerViewProps) {
    const router = useRouter()

    async function handleBookingAction(bookingId: string, action: 'cancel') {
        const token = localStorage.getItem('token')
        if (!confirm(`Are you sure you want to ${action} this booking?`)) return

        try {
            const status = 'cancelled'
            const res = await fetch(`/api/v1/bookings/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            })

            if (res.ok) {
                setBookings(bookings.map(b => b.id === bookingId ? { ...b, status } : b))
                alert(`Booking ${status} successfully`)
            } else {
                const data = await res.json()
                console.error(data)
                alert(data.message || `Failed to ${action} booking`)
            }
        } catch (error) {
            console.error(error)
            alert("Something went wrong")
        }
    }

    if (loading) return <div className="h-40 flex items-center justify-center"><Spinner /></div>

    return (
        <Tabs defaultValue="my_bookings" className="space-y-4">
            <TabsList>
                <TabsTrigger value="my_bookings">My Bookings</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="my_bookings" className="space-y-4 mt-4">
                {bookings.length > 0 ? (
                    bookings.map((booking) => (
                        <Card key={booking.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl">
                                            {booking.vehicle?.vehicle_name || `Vehicle #${booking.vehicle_id}`}
                                        </CardTitle>
                                        <CardDescription>Booking ID: {booking.id}</CardDescription>
                                    </div>
                                    <Badge variant={
                                        booking.status === 'active' ? 'default' :
                                            booking.status === 'cancelled' ? 'destructive' : 'secondary'
                                    }>
                                        {booking.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {safeFormat(booking.rent_start_date)} - {safeFormat(booking.rent_end_date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-bold">${booking.total_price} Total</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                {booking.status === 'active' && (
                                    <Button variant="destructive" size="sm" onClick={() => handleBookingAction(booking.id, 'cancel')}>Cancel Booking</Button>
                                )}
                                {booking.status === 'cancelled' && (
                                    <p className="text-sm text-muted-foreground italic">This booking has been cancelled.</p>
                                )}
                                {booking.status === 'completed' && (
                                    <Button variant="outline" size="sm" disabled>Rate Vehicle</Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-20 border rounded-lg bg-muted/20">
                        <Car className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No bookings yet</h3>
                        <p className="text-muted-foreground mb-4">You haven't made any bookings yet.</p>
                        <Button onClick={() => router.push('/vehicles')}>Browse Vehicles</Button>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="profile">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Name</label>
                                <p className="font-medium">{user?.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                <p className="font-medium">{user?.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                <p className="font-medium">{user?.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Role</label>
                                <p className="font-medium capitalize">{user?.role}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
