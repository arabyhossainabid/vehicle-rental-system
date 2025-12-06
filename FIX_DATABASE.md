# How to Fix Database Connection Issue

## Problem
Password authentication failed for user "postgres"

## Solutions

### Solution 1: Find Your PostgreSQL Password

**Option A: Check if you remember setting a password during installation**
- Common default passwords: `postgres`, `admin`, or empty

**Option B: Try connecting without password**
1. Open Command Prompt
2. Try: `psql -U postgres`
   - If it works, your password might be empty
   - Update `.env`: `DB_PASSWORD=`

**Option C: Check pgAdmin (if installed)**
- Open pgAdmin
- Check saved server connections
- The password might be saved there

### Solution 2: Reset PostgreSQL Password (Windows)

1. **Stop PostgreSQL service:**
   ```cmd
   net stop postgresql-x64-<version>
   ```
   (Replace `<version>` with your PostgreSQL version, e.g., `15`)

2. **Edit pg_hba.conf file:**
   - Location: `C:\Program Files\PostgreSQL\<version>\data\pg_hba.conf`
   - Find line: `host all all 127.0.0.1/32 scram-sha-256`
   - Change to: `host all all 127.0.0.1/32 trust`
   - Save the file

3. **Start PostgreSQL service:**
   ```cmd
   net start postgresql-x64-<version>
   ```

4. **Connect and reset password:**
   ```cmd
   psql -U postgres
   ```
   Then in psql:
   ```sql
   ALTER USER postgres PASSWORD 'newpassword';
   \q
   ```

5. **Revert pg_hba.conf:**
   - Change back to: `host all all 127.0.0.1/32 scram-sha-256`
   - Restart PostgreSQL service

6. **Update .env file:**
   ```env
   DB_PASSWORD=newpassword
   ```

### Solution 3: Create New PostgreSQL User

1. Connect to PostgreSQL (using method from Solution 2):
   ```cmd
   psql -U postgres
   ```

2. Create new user:
   ```sql
   CREATE USER vehicle_user WITH PASSWORD 'your_password';
   CREATE DATABASE vehicle_rental OWNER vehicle_user;
   GRANT ALL PRIVILEGES ON DATABASE vehicle_rental TO vehicle_user;
   \q
   ```

3. Update `.env`:
   ```env
   DB_USER=vehicle_user
   DB_PASSWORD=your_password
   ```

### Solution 4: Use Windows Authentication (Advanced)

If PostgreSQL is configured for Windows authentication:
1. Update `.env`:
   ```env
   DB_USER=your_windows_username
   DB_PASSWORD=
   ```

## After Fixing Password

1. Test connection:
   ```bash
   node test-db-connection.js
   ```

2. If connection succeeds, create tables:
   ```bash
   psql -U postgres -d vehicle_rental -f setup.sql
   ```

3. Restart your server:
   ```bash
   npm run dev
   ```

4. Try signup again in Postman!

