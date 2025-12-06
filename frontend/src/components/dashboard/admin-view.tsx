"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CheckCircle, XCircle, Plus, Trash2, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Helper to safely format dates
const safeFormat = (dateString: string) => {
    try {
        return format(new Date(dateString), 'PPP')
    } catch (error) {
        return 'Invalid Date'
    }
}

interface AdminViewProps {
    user: any
    bookings: any[]
    setBookings: (bookings: any[]) => void
}

export function AdminView({ user, bookings, setBookings }: AdminViewProps) {
    const [vehicles, setVehicles] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false)
    const [newVehicle, setNewVehicle] = useState({
        vehicle_name: '',
        type: 'car',
        registration_number: '',
        daily_rent_price: '',
        availability_status: 'available',
        description: ''
    })

    // Fetch Vehicles and Users on mount
    useEffect(() => {
        const token = localStorage.getItem('token')

        const fetchVehicles = async () => {
            const res = await fetch('/api/v1/vehicles')
            if (res.ok) {
                const data = await res.json()
                setVehicles(data.data)
            }
        }

        const fetchUsers = async () => {
            const res = await fetch('/api/v1/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setUsers(data.data)
            }
        }

        fetchVehicles()
        fetchUsers()
    }, [])


    async function handleBookingAction(bookingId: string, action: 'cancel' | 'return') {
        const token = localStorage.getItem('token')
        if (!confirm(`Are you sure you want to ${action} this booking?`)) return

        try {
            const status = action === 'cancel' ? 'cancelled' : 'returned'
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
                alert(data.message || `Failed to ${action} booking`)
            }
        } catch (error) {
            alert("Something went wrong")
        }
    }

    async function handleCreateVehicle() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/v1/vehicles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newVehicle,
                    daily_rent_price: parseFloat(newVehicle.daily_rent_price)
                })
            })

            if (res.ok) {
                const data = await res.json()
                setVehicles([...vehicles, data.data])
                alert("Vehicle created successfully")
                setIsVehicleModalOpen(false)
                setNewVehicle({
                    vehicle_name: '',
                    type: 'car',
                    registration_number: '',
                    daily_rent_price: '',
                    availability_status: 'available',
                    description: ''
                })
            } else {
                const data = await res.json()
                alert(data.message || "Failed to create vehicle")
            }
        } catch (error) {
            alert("Something went wrong")
        }
    }

    async function handleDeleteVehicle(id: string) {
        if (!confirm("Are you sure? This action cannot be undone.")) return
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/v1/vehicles/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
            setVehicles(vehicles.filter(v => v.id !== id))
            alert("Vehicle deleted")
        } else {
            const data = await res.json()
            alert(data.message || "Failed to delete")
        }
    }

    async function handleDeleteUser(id: string) {
        if (!confirm("Are you sure? This will delete the user permanently.")) return
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/v1/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
            setUsers(users.filter(u => u.id !== id))
            alert("User deleted")
        } else {
            alert("Failed to delete user")
        }
    }

    return (
        <Tabs defaultValue="all_bookings" className="space-y-4">
            <TabsList>
                <TabsTrigger value="all_bookings">All Bookings</TabsTrigger>
                <TabsTrigger value="vehicles">Manage Vehicles</TabsTrigger>
                <TabsTrigger value="users">Manage Users</TabsTrigger>
            </TabsList>

            <TabsContent value="all_bookings" className="space-y-4 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Manage All Bookings</CardTitle>
                        <CardDescription>View and manage all customer bookings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bookings.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{booking.customer?.name}</span>
                                                <span className="text-xs text-muted-foreground">{booking.customer?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{booking.vehicle?.vehicle_name}</TableCell>
                                        <TableCell className="text-sm">
                                            {safeFormat(booking.rent_start_date)} - <br />
                                            {safeFormat(booking.rent_end_date)}
                                        </TableCell>
                                        <TableCell>${booking.total_price}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                booking.status === 'active' ? 'default' :
                                                    booking.status === 'cancelled' ? 'destructive' : 'secondary'
                                            }>
                                                {booking.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {booking.status === 'active' && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            title="Return Vehicle"
                                                            onClick={() => handleBookingAction(booking.id, 'return')}
                                                        >
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            title="Cancel Booking"
                                                            onClick={() => handleBookingAction(booking.id, 'cancel')}
                                                        >
                                                            <XCircle className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="vehicles" className="space-y-4">
                <div className="flex justify-end">
                    <Dialog open={isVehicleModalOpen} onOpenChange={setIsVehicleModalOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> Add Vehicle</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Vehicle</DialogTitle>
                                <DialogDescription>Create a new vehicle listing.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Name</Label>
                                    <Input
                                        className="col-span-3"
                                        value={newVehicle.vehicle_name}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, vehicle_name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Reg. No</Label>
                                    <Input
                                        className="col-span-3"
                                        value={newVehicle.registration_number}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, registration_number: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Type</Label>
                                    <div className="col-span-3">
                                        <Select
                                            value={newVehicle.type}
                                            onValueChange={(val) => setNewVehicle({ ...newVehicle, type: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="car">Car</SelectItem>
                                                <SelectItem value="bike">Bike</SelectItem>
                                                <SelectItem value="van">Van</SelectItem>
                                                <SelectItem value="SUV">SUV</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Price</Label>
                                    <Input
                                        type="number"
                                        className="col-span-3"
                                        value={newVehicle.daily_rent_price}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, daily_rent_price: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateVehicle}>Save Vehicle</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Vehicles List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Registration</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vehicles.map((v) => (
                                    <TableRow key={v.id}>
                                        <TableCell className="font-mono">{v.registration_number}</TableCell>
                                        <TableCell>{v.vehicle_name}</TableCell>
                                        <TableCell className="capitalize">{v.type}</TableCell>
                                        <TableCell>
                                            <Badge variant={v.availability_status === 'available' ? 'default' : 'secondary'}>
                                                {v.availability_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>${v.daily_rent_price}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteVehicle(v.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="users">
                <Card>
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell>{u.name}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell className="capitalize">{u.role}</TableCell>
                                        <TableCell>
                                            {u.role !== 'admin' && (
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
