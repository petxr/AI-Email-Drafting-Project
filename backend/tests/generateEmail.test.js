// const request = require("supertest");
// const app = require("../server");
// const { createClient } = require("@supabase/supabase-js");

// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// const TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000";
// const TEST_USER_EMAIL = "test@example.com";

// beforeAll(async () => {
//     console.log("🚀 Checking if test user exists...");

//     // ✅ Check if the test user already exists
//     const { data: existingUser, error: userCheckError } = await supabase
//         .from("users")
//         .select("id")
//         .eq("email", TEST_USER_EMAIL)
//         .single();

//     if (userCheckError && userCheckError.code !== "PGRST116") {  // PGRST116 = "No results found"
//         console.error("❌ Error checking for existing test user:", userCheckError.message);
//         throw new Error(userCheckError.message);
//     }

//     if (existingUser) {
//         console.log("✅ Test user already exists:", existingUser.id);
//     } else {
//         console.log("🛠 Creating test user...");
//         const { error: insertError } = await supabase.from("users").insert([
//             { id: TEST_USER_ID, email: TEST_USER_EMAIL, password: "test1234" }
//         ]);

//         if (insertError) {
//             console.error("❌ Failed to insert test user:", insertError.message);
//             throw new Error(insertError.message);
//         }

//         console.log("✅ Test user inserted successfully.");
//     }

//     // 🔄 Wait before proceeding to allow Supabase to sync
//     await new Promise((resolve) => setTimeout(resolve, 3000));
// });

// afterAll(async () => {
//     console.log("🗑 Cleaning up test data...");

//     // ✅ Remove test emails
//     const { error: deleteEmailsError } = await supabase
//         .from("emails")
//         .delete()
//         .eq("user_id", TEST_USER_ID);

//     if (deleteEmailsError) {
//         console.error("❌ Failed to delete test emails:", deleteEmailsError.message);
//     } else {
//         console.log("✅ Test emails deleted.");
//     }
// });

// describe("POST /api/generate", () => {
//     it("should return a generated email draft", async () => {
//         const requestData = {
//             userId: TEST_USER_ID,
//             emailType: "Appointment Confirmation",
//             clientName: "John Doe"
//         };

//         console.log("📩 Sending request with data:", requestData);

//         const res = await request(app).post("/api/generate").send(requestData);

//         console.log("Test Response:", res.body); // Debugging Log

//         expect(res.statusCode).toBe(200);
//         expect(res.body).toHaveProperty("subject");
//         expect(res.body).toHaveProperty("body");
//     });

//     it("should return 400 if missing parameters", async () => {
//         const res = await request(app).post("/api/generate").send({ userId: TEST_USER_ID });

//         expect(res.statusCode).toBe(400);
//         expect(res.body).toHaveProperty("error");
//     });
// });


