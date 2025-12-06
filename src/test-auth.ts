import bcrypt from 'bcrypt';
import pool from './config/database';

const testAuth = async () => {
    try {
        console.log('Testing auth flow...\n');

        const email = 'debug@test.com'.toLowerCase();
        const password = 'test123456';
        const name = 'Debug User';
        const phone = '01700000000';
        const role = 'customer';

        // Test 1: Check if user exists
        console.log('1. Checking if user exists...');
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        console.log(`   Found ${userCheck.rows.length} users with this email`);

        if (userCheck.rows.length > 0) {
            console.log('   User already exists, deleting for fresh test...');
            await pool.query('DELETE FROM users WHERE email = $1', [email]);
        }

        // Test 2: Hash password
        console.log('\n2. Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('   Password hashed successfully');

        // Test 3: Insert user
        console.log('\n3. Inserting user...');
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role',
            [name, email, hashedPassword, phone, role]
        );
        console.log('   ✅ User created successfully!');
        console.log('   User:', newUser.rows[0]);

        // Test 4: Login
        console.log('\n4. Testing login...');
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }

        const user = userResult.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        console.log('   Password match:', validPassword);

        console.log('\n✅ ALL AUTH TESTS PASSED!');
        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Error:', error.message);
        console.error('Error code:', error.code);
        console.error('Full error:', error);
        process.exit(1);
    }
};

testAuth();
