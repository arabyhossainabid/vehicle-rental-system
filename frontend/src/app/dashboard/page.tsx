"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { AdminView } from "@/components/dashboard/admin-view"
import { CustomerView } from "@/components/dashboard/customer-view"

export default function DashboardPage() {
    const router = useRouter()
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')

        if (!token || !userStr) {
            router.push('/login')
            return
        }

        setUser(JSON.parse(userStr))

        async function fetchBookings() {
            try {
                const res = await fetch('/api/v1/bookings', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (res.ok) {
                    const data = await res.json()
                    setBookings(data.data)
                }
            } catch (error) {
                console.error("Failed to fetch bookings", error)
            } finally {
                setLoading(false)
            }
        }

        fetchBookings()
    }, [router])

    if (loading) return <div className="h-screen flex items-center justify-center"><Spinner size="xl" /></div>

    const isAdmin = user?.role === 'admin'

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant={isAdmin ? "destructive" : "secondary"}>
                            {user?.role?.toUpperCase()}
                        </Badge>
                        <p className="text-muted-foreground">Welcome, {user?.name}</p>
                    </div>
                </div>
                <Button onClick={() => {
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    window.location.href = '/'
                }} variant="outline">Logout</Button>
            </div>

            {isAdmin ? (
                <AdminView
                    user={user}
                    bookings={bookings}
                    setBookings={setBookings}
                />
            ) : (
                <CustomerView
                    user={user}
                    bookings={bookings}
                    setBookings={setBookings}
                    loading={loading}
                />
            )}
        </div>
    )
}
