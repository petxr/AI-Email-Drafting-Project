// const request = require("supertest");
// const app = require("../server");
// const { createClient } = require("@supabase/supabase-js");

// // Initialize Supabase
// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// // Test user credentials
// let testUser = { email: `testuser${Date.now()}@test.com`, password: "TestPassword123!" };

// describe("🔐 Auth API Tests", () => {
//     let testUserId = null;
//     let testToken = null;

//     /**
//      * 🛠 Setup - Ensure test user does not already exist
//      */
//     beforeAll(async () => {
//         console.log("🛠 Setting up test user...");

//         // Check if test user exists
//         const { data: existingUser, error: fetchError } = await supabase
//             .from("users")
//             .select("id")
//             .eq("email", testUser.email)
//             .single();

//         if (fetchError && fetchError.code !== "PGRST116") {
//             console.error("❌ Failed to check existing user:", fetchError.message);
//         }

//         // If user exists, store the ID, otherwise create a new one
//         if (existingUser) {
//             console.log("🔄 Test user already exists. Deleting before test...");
//             await supabase.auth.admin.deleteUser(existingUser.id);
//         } else {
//             console.log("🛠 Creating test user...");
//             const { data, error } = await supabase.auth.signUp({
//                 email: testUser.email,
//                 password: testUser.password,
//                 options: { email_confirm: false } // ✅ Disable email confirmation for test accounts
//             });

//             if (error) {
//                 console.error("❌ Failed to create test user:", error.message);
//             } else {
//                 console.log("✅ Test user created.");
//                 testUserId = data.user.id;
//             }
//         }
//     });

//     /**
//      * 🔹 User can register successfully
//      */
//     it("🔹 User can register successfully", async () => {
//         const res = await request(app)
//             .post("/api/auth/register")
//             .send({ email: `newuser${Date.now()}@test.com`, password: "NewPassword123!" });

//         expect(res.statusCode).toBe(201);
//         expect(res.body).toHaveProperty("message", "User registered successfully");
//     });

//     /**
//      * 🔹 User cannot register with an existing email
//      */
//     it("🔹 User cannot register with existing email", async () => {
//         const res = await request(app)
//             .post("/api/auth/register")
//             .send({ email: testUser.email, password: "TestPassword123!" });

//         expect(res.statusCode).toBe(400);
//         expect(res.body).toHaveProperty("error", "User already exists");
//     });

//     /**
//      * 🔑 User can log in successfully
//      */
//     it("🔹 User can log in successfully", async () => {
//         const res = await request(app)
//             .post("/api/auth/login")
//             .send({ email: testUser.email, password: testUser.password });

//         expect(res.statusCode).toBe(200);
//         expect(res.body).toHaveProperty("token");
//         testToken = res.body.token;
//     });

//     /**
//      * ❌ User cannot log in with wrong password
//      */
//     it("🔹 User cannot log in with wrong password", async () => {
//         const res = await request(app)
//             .post("/api/auth/login")
//             .send({ email: testUser.email, password: "WrongPassword!" });

//         expect(res.statusCode).toBe(401);
//         expect(res.body).toHaveProperty("error", "Invalid credentials");
//     });

//     /**
//      * ❌ API returns error if email is missing in registration
//      */
//     it("🔹 API returns error if email is missing in registration", async () => {
//         const res = await request(app)
//             .post("/api/auth/register")
//             .send({ password: "SomePassword123!" });

//         expect(res.statusCode).toBe(400);
//         expect(res.body).toHaveProperty("error", "Email and password are required");
//     });

//     /**
//      * ❌ API returns error if password is missing in login
//      */
//     it("🔹 API returns error if password is missing in login", async () => {
//         const res = await request(app)
//             .post("/api/auth/login")
//             .send({ email: testUser.email });

//         expect(res.statusCode).toBe(400);
//         expect(res.body).toHaveProperty("error", "Email and password are required");
//     });

//     /**
//      * 🗑 Cleanup - Delete test user after all tests complete
//      */
//     afterAll(async () => {
//         console.log("🗑 Cleaning up test user...");

//         if (testUserId) {
//             const { error } = await supabase.auth.admin.deleteUser(testUserId);
//             if (error) {
//                 console.error("❌ Failed to delete test user:", error.message);
//             } else {
//                 console.log("✅ Test user deleted.");
//             }
//         }
//     });
// });
