
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Car, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = React.useState(false)
    const [isLoggedIn, setIsLoggedIn] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        const token = localStorage.getItem('token')
        setIsLoggedIn(!!token)
    }, [pathname])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsLoggedIn(false)
        router.push('/login')
        router.refresh()
    }

    const routes = [
        {
            href: "/",
            label: "Home",
            active: pathname === "/",
        },
        {
            href: "/vehicles",
            label: "Vehicles",
            active: pathname === "/vehicles",
        },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <Car className="h-6 w-6" />
                        <span className="text-xl font-bold">VehicleRental</span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                route.active ? "text-foreground" : "text-foreground/60"
                            )}
                        >
                            {route.label}
                        </Link>
                    ))}
                    {isLoggedIn && (
                        <Link
                            href="/dashboard"
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"
                            )}
                        >
                            Dashboard
                        </Link>
                    )}
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    {isLoggedIn ? (
                        <Button variant="ghost" onClick={handleLogout}>Logout</Button>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link href="/register">
                                <Button>Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Navigation */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <div className="grid gap-6 py-6">
                            <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                                <Car className="h-6 w-6" />
                                <span className="text-xl font-bold">VehicleRental</span>
                            </Link>
                            <nav className="grid gap-4">
                                {routes.map((route) => (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "text-lg font-medium transition-colors hover:text-foreground/80",
                                            route.active ? "text-foreground" : "text-foreground/60"
                                        )}
                                    >
                                        {route.label}
                                    </Link>
                                ))}
                                {isLoggedIn && (
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "text-lg font-medium transition-colors hover:text-foreground/80",
                                            pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"
                                        )}
                                    >
                                        Dashboard
                                    </Link>
                                )}
                                <div className="grid gap-2 mt-4">
                                    {isLoggedIn ? (
                                        <Button variant="outline" className="w-full" onClick={() => {
                                            handleLogout()
                                            setIsOpen(false)
                                        }}>Logout</Button>
                                    ) : (
                                        <>
                                            <Link href="/login" onClick={() => setIsOpen(false)}>
                                                <Button variant="outline" className="w-full">Login</Button>
                                            </Link>
                                            <Link href="/register" onClick={() => setIsOpen(false)}>
                                                <Button className="w-full">Get Started</Button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </nav>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    )
}
