import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";


interface Vehicle {
    id: string;
    vehicle_name: string;
    type: string;
    daily_rent_price: number;
    availability_status: string;
}

async function getVehicles() {
    try {
        const res = await fetch('http://localhost:3000/api/v1/vehicles', { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || [];
    } catch (error) {
        return [];
    }
}

export default async function VehiclesPage() {
    const vehicles = await getVehicles();

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-8">Our Fleet</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.length > 0 ? (
                    vehicles.map((vehicle: Vehicle) => (
                        <Card key={vehicle.id} className="overflow-hidden group">
                            <div className="aspect-video bg-muted relative flex items-center justify-center bg-secondary overflow-hidden">
                                <img
                                    src="/car-placeholder.png"
                                    alt={vehicle.vehicle_name}
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{vehicle.vehicle_name}</CardTitle>
                                        <p className="text-sm text-muted-foreground capitalize">{vehicle.type}</p>
                                    </div>
                                    <Badge variant={vehicle.availability_status === 'available' ? 'default' : 'secondary'}>
                                        {vehicle.availability_status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${vehicle.daily_rent_price}
                                    <span className="text-sm font-normal text-muted-foreground">/day</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link href={`/vehicles/${vehicle.id}`} className="w-full">
                                    <Button className="w-full">Book Now</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 text-muted-foreground">
                        No vehicles found.
                    </div>
                )}
            </div>
        </div>
    );
}
