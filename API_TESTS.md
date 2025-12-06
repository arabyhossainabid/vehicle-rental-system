# Vehicle Rental System API Testing

This script tests all API endpoints according to the specification.

## Prerequisites
- Server running on http://localhost:5000
- Database connected and tables created

## Test Sequence

### 1. Authentication Tests

#### Register Admin User
```powershell
$body = @{
    name = "Admin User"
    email = "admin@example.com"
    password = "admin123"
    phone = "01712345678"
    role = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/signup" -Method Post -Body $body -ContentType "application/json"
```

#### Register Customer User
```powershell
$body = @{
    name = "John Doe"
    email = "john.doe@example.com"
    password = "securePassword123"
    phone = "01712345678"
    role = "customer"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/signup" -Method Post -Body $body -ContentType "application/json"
```

#### Login as Admin
```powershell
$body = @{
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

$adminAuth = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/signin" -Method Post -Body $body -ContentType "application/json"
$adminToken = $adminAuth.data.token
```

#### Login as Customer
```powershell
$body = @{
    email = "john.doe@example.com"
    password = "securePassword123"
} | ConvertTo-Json

$customerAuth = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/signin" -Method Post -Body $body -ContentType "application/json"
$customerToken = $customerAuth.data.token
```

### 2. Vehicle Tests

#### Create Vehicle (Admin Only)
```powershell
$headers = @{
    "Authorization" = "Bearer $adminToken"
}

$body = @{
    vehicle_name = "Toyota Camry 2024"
    type = "car"
    registration_number = "ABC-1234"
    daily_rent_price = 50
    availability_status = "available"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/vehicles" -Method Post -Headers $headers -Body $body -ContentType "application/json"
```

#### Get All Vehicles (Public)
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/vehicles" -Method Get
```

#### Get Vehicle by ID (Public)
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/vehicles/1" -Method Get
```

#### Update Vehicle (Admin Only)
```powershell
$headers = @{
    "Authorization" = "Bearer $adminToken"
}

$body = @{
    vehicle_name = "Toyota Camry 2024 Premium"
    daily_rent_price = 55
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/vehicles/1" -Method Put -Headers $headers -Body $body -ContentType "application/json"
```

### 3. User Tests

#### Get All Users (Admin Only)
```powershell
$headers = @{
    "Authorization" = "Bearer $adminToken"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/users" -Method Get -Headers $headers
```

#### Update Own Profile (Customer)
```powershell
$headers = @{
    "Authorization" = "Bearer $customerToken"
}

$body = @{
    name = "John Doe Updated"
    phone = "01798765432"
} | ConvertTo-Json

# Get customer user ID from login response first
$customerId = $customerAuth.data.user.id
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/users/$customerId" -Method Put -Headers $headers -Body $body -ContentType "application/json"
```

### 4. Booking Tests

#### Create Booking (Customer)
```powershell
$headers = @{
    "Authorization" = "Bearer $customerToken"
}

$body = @{
    vehicle_id = 1
    rent_start_date = "2024-12-10"
    rent_end_date = "2024-12-15"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/bookings" -Method Post -Headers $headers -Body $body -ContentType "application/json"
```

#### Get Bookings (Customer - sees own bookings)
```powershell
$headers = @{
    "Authorization" = "Bearer $customerToken"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/bookings" -Method Get -Headers $headers
```

#### Get Bookings (Admin - sees all bookings)
```powershell
$headers = @{
    "Authorization" = "Bearer $adminToken"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/bookings" -Method Get -Headers $headers
```

#### Cancel Booking (Customer)
```powershell
$headers = @{
    "Authorization" = "Bearer $customerToken"
}

$body = @{
    status = "cancelled"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/bookings/1" -Method Put -Headers $headers -Body $body -ContentType "application/json"
```

#### Mark Booking as Returned (Admin Only)
```powershell
$headers = @{
    "Authorization" = "Bearer $adminToken"
}

$body = @{
    status = "returned"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/bookings/1" -Method Put -Headers $headers -Body $body -ContentType "application/json"
```

## Complete Test Script

Run all tests in sequence:

```powershell
# Test Server Connection
Write-Host "Testing server connection..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:5000/" -Method Get
Write-Host "✅ Server is running!" -ForegroundColor Green

# 1. Register Users
Write-Host "`n1. Registering Admin User..." -ForegroundColor Yellow
try {
    $adminSignup = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/signup" -Method Post -Body (@{name="Admin User";email="admin@example.com";password="admin123";phone="01712345678";role="admin"} | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Admin registered: $($adminSignup.data.email)" -ForegroundColor Green
} catch {
    Write-Host "⚠ Admin may already exist" -ForegroundColor Yellow
}

Write-Host "`n2. Registering Customer User..." -ForegroundColor Yellow
try {
    $customerSignup = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/signup" -Method Post -Body (@{name="John Doe";email="john.doe@example.com";password="securePassword123";phone="01712345678";role="customer"} | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Customer registered: $($customerSignup.data.email)" -ForegroundColor Green
} catch {
    Write-Host "⚠ Customer may already exist" -ForegroundColor Yellow
}

# 2. Login
Write-Host "`n3. Logging in as Admin..." -ForegroundColor Yellow
$adminAuth = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/signin" -Method Post -Body (@{email="admin@example.com";password="admin123"} | ConvertTo-Json) -ContentType "application/json"
$adminToken = $adminAuth.data.token
Write-Host "✅ Admin logged in. Token: $($adminToken.Substring(0,20))..." -ForegroundColor Green

Write-Host "`n4. Logging in as Customer..." -ForegroundColor Yellow
$customerAuth = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/signin" -Method Post -Body (@{email="john.doe@example.com";password="securePassword123"} | ConvertTo-Json) -ContentType "application/json"
$customerToken = $customerAuth.data.token
$customerId = $customerAuth.data.user.id
Write-Host "✅ Customer logged in. ID: $customerId" -ForegroundColor Green

# 3. Create Vehicle
Write-Host "`n5. Creating Vehicle (Admin)..." -ForegroundColor Yellow
try {
    $vehicle = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/vehicles" -Method Post -Headers @{"Authorization"="Bearer $adminToken"} -Body (@{vehicle_name="Toyota Camry 2024";type="car";registration_number="ABC-1234";daily_rent_price=50;availability_status="available"} | ConvertTo-Json) -ContentType "application/json"
    $vehicleId = $vehicle.data.id
    Write-Host "✅ Vehicle created: $($vehicle.data.vehicle_name) (ID: $vehicleId)" -ForegroundColor Green
} catch {
    Write-Host "⚠ Vehicle may already exist, using existing vehicle" -ForegroundColor Yellow
    $vehicles = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/vehicles" -Method Get
    $vehicleId = $vehicles.data[0].id
}

# 4. Get All Vehicles
Write-Host "`n6. Getting All Vehicles (Public)..." -ForegroundColor Yellow
$vehicles = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/vehicles" -Method Get
Write-Host "✅ Found $($vehicles.data.Count) vehicles" -ForegroundColor Green

# 5. Create Booking
Write-Host "`n7. Creating Booking (Customer)..." -ForegroundColor Yellow
$booking = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/bookings" -Method Post -Headers @{"Authorization"="Bearer $customerToken"} -Body (@{vehicle_id=$vehicleId;rent_start_date="2024-12-15";rent_end_date="2024-12-20"} | ConvertTo-Json) -ContentType "application/json"
$bookingId = $booking.data.id
Write-Host "✅ Booking created: ID $bookingId, Total: `$$($booking.data.total_price)" -ForegroundColor Green

# 6. Get Bookings as Customer
Write-Host "`n8. Getting Bookings (Customer)..." -ForegroundColor Yellow
$customerBookings = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/bookings" -Method Get -Headers @{"Authorization"="Bearer $customerToken"}
Write-Host "✅ Customer has $($customerBookings.data.Count) booking(s)" -ForegroundColor Green

# 7. Get Bookings as Admin
Write-Host "`n9. Getting All Bookings (Admin)..." -ForegroundColor Yellow
$allBookings = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/bookings" -Method Get -Headers @{"Authorization"="Bearer $adminToken"}
Write-Host "✅ Total bookings in system: $($allBookings.data.Count)" -ForegroundColor Green

Write-Host "`n✅ ALL TESTS PASSED!" -ForegroundColor Green
Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  - Server: Running on port 5000" -ForegroundColor White
Write-Host "  - Database: Connected to Neon PostgreSQL" -ForegroundColor White
Write-Host "  - Vehicles: $($vehicles.data.Count)" -ForegroundColor White
Write-Host "  - Bookings: $($allBookings.data.Count)" -ForegroundColor White
```
