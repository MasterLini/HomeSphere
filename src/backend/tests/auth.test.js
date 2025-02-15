const request = require('supertest');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../app');
const UserModel = require('../models/User');
const { connectDB, disconnectDB } = require('../db/connectDB');

let mongoServer;
let connection;
let db;

beforeAll(async () => {
    // Setup MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to in-memory database
    connection = await MongoClient.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    db = connection.db();
    
    // Mock environment variables
    process.env.SECRET_KEY = 'test-secret-key';
    process.env.NODE_ENV = 'test';
});

afterAll(async () => {
    await connection.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    // Clear database before each test
    await db.collection('users').deleteMany({});
});

describe('Authentication Routes', () => {
    describe('POST /auth/register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'Test123!@#'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('userId');
            expect(response.body.message).toContain('Registration successful');

            // Verify user in database
            const user = await db.collection('users').findOne({ email: 'test@example.com' });
            expect(user).toBeTruthy();
            expect(user.username).toBe('testuser');
            expect(user.isVerified).toBe(false);
        });

        it('should reject registration with invalid password', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'weak'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Password must');
        });

        it('should reject registration with existing email', async () => {
            // First registration
            await request(app)
                .post('/auth/register')
                .send({
                    username: 'testuser1',
                    email: 'test@example.com',
                    password: 'Test123!@#'
                });

            // Second registration with same email
            const response = await request(app)
                .post('/auth/register')
                .send({
                    username: 'testuser2',
                    email: 'test@example.com',
                    password: 'Test123!@#'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('already taken');
        });
    });

    describe('POST /auth/login', () => {
        beforeEach(async () => {
            // Create a verified user for login tests
            const user = new UserModel('testuser', 'test@example.com', 'Test123!@#');
            await user.hashPassword();
            user.isVerified = true;
            await db.collection('users').insertOne(user);
        });

        it('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'Test123!@#'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe('test@example.com');
        });

        it('should reject login with incorrect password', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Invalid email or password');
        });

        it('should reject login for unverified user', async () => {
            // Create unverified user
            await db.collection('users').updateOne(
                { email: 'test@example.com' },
                { $set: { isVerified: false } }
            );

            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'Test123!@#'
                });

            expect(response.status).toBe(403);
            expect(response.body.message).toContain('verify your email');
        });
    });

    describe('POST /auth/forgot-password', () => {
        beforeEach(async () => {
            const user = new UserModel('testuser', 'test@example.com', 'Test123!@#');
            await user.hashPassword();
            user.isVerified = true;
            await db.collection('users').insertOne(user);
        });

        it('should generate reset token for existing user', async () => {
            const response = await request(app)
                .post('/auth/forgot-password')
                .send({
                    email: 'test@example.com'
                });

            expect(response.status).toBe(200);
            
            // Verify reset token was generated
            const user = await db.collection('users').findOne({ email: 'test@example.com' });
            expect(user.passwordResetToken).toBeTruthy();
            expect(user.passwordResetExpires).toBeTruthy();
        });

        it('should not reveal user existence for non-existent email', async () => {
            const response = await request(app)
                .post('/auth/forgot-password')
                .send({
                    email: 'nonexistent@example.com'
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('If an account exists');
        });
    });

    describe('POST /auth/reset-password/:token', () => {
        let resetToken;

        beforeEach(async () => {
            const user = new UserModel('testuser', 'test@example.com', 'Test123!@#');
            await user.hashPassword();
            user.isVerified = true;
            resetToken = user.generatePasswordResetToken();
            await db.collection('users').insertOne(user);
        });

        it('should reset password with valid token', async () => {
            const response = await request(app)
                .post(`/auth/reset-password/${resetToken}`)
                .send({
                    password: 'NewTest123!@#'
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('Password has been reset successfully');

            // Verify login with new password works
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'NewTest123!@#'
                });

            expect(loginResponse.status).toBe(200);
        });

        it('should reject password reset with invalid token', async () => {
            const response = await request(app)
                .post('/auth/reset-password/invalidtoken')
                .send({
                    password: 'NewTest123!@#'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Invalid or expired reset token');
        });
    });

    describe('POST /auth/logout', () => {
        let authToken;

        beforeEach(async () => {
            // Create user and generate token
            const user = new UserModel('testuser', 'test@example.com', 'Test123!@#');
            await user.hashPassword();
            user.isVerified = true;
            const result = await db.collection('users').insertOne(user);

            authToken = jwt.sign(
                { userId: result.insertedId, username: user.username },
                process.env.SECRET_KEY
            );
        });

        it('should successfully logout user', async () => {
            const response = await request(app)
                .post('/auth/logout')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('Successfully logged out');

            // Verify token is blacklisted by attempting to use it
            const protectedResponse = await request(app)
                .get('/protected-route')
                .set('Authorization', `Bearer ${authToken}`);

            expect(protectedResponse.status).toBe(401);
        });

        it('should handle logout without token', async () => {
            const response = await request(app)
                .post('/auth/logout');

            expect(response.status).toBe(401);
            expect(response.body.message).toContain('Unauthorized');
        });
    });
});