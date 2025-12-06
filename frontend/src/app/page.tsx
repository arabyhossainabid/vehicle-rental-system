import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    console.error("Failed to fetch vehicles:", error);
    return [];
  }
}

export default async function Home() {
  const vehicles = await getVehicles();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero.png')" }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="container relative z-10 text-center space-y-6 text-white">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Drive Your Dreams
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-[600px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Book the finest vehicles for your journey. Premium comfort, affordable rates.
          </p>
          <div className="flex gap-4 justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-400">
            <Link href="/vehicles">
              <Button size="lg" className="h-12 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground">
                Browse Fleet
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg bg-background/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Fleet */}
      <section className="py-20 container">
        <div className="flex justify-between items-center mb-12">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Featured Fleet</h2>
            <p className="text-muted-foreground">Top rated vehicles for you</p>
          </div>
          <Link href="/vehicles">
            <Button variant="ghost">View All &rarr;</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.length > 0 ? (
            vehicles.slice(0, 3).map((vehicle: Vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative flex items-center justify-center bg-secondary overflow-hidden">
                  {/* In a real app we would use vehicle.image_url */}
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
            <div className="col-span-full text-center py-10 text-muted-foreground">
              <p>No vehicles available at the moment. Please check back later.</p>
              <p className="text-sm mt-2 text-red-500">Note: Ensure backend is running on port 5000.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
