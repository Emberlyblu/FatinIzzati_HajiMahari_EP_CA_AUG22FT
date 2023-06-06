const request = require("supertest");
const app = require("../app");
const db = require("../models");
const UtilitiesService = require("../services/utilitiesService");


beforeAll(async () => {
    await db.sequelize.sync({force: true});
});


// helper functions for logins
const login = async (username, password) => {
    const res = await request(app).post("/login").send({username, password});

    return res.body.token;
}


// functions to create test data for TEST #8
const createTestCategory = async () => {
    return db.Category.create({category: "Test Category"});
};

let skuCounter = 0;

const createTestItem = async () => {
    try {
        const item = await db.Item.create({
            name: "Test Item",
            price: 10.99,
            stock_quantity: 100,
            sku: `TEST_SKU_${
                skuCounter++
            }`,
            categoryId: 1
        });
        return item;
    } catch (error) {
        throw error;
    }
};


// TEST 1: Setup endpoint
describe("POST /setup", () => {
    it("should populate the database and return a 201 status code", async () => {
        const res = await request(app).post("/setup").send();

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("message", "Database populated successfully");
    });

    // Check if the database has already been populated
    it("should not populate the database if data already exist and return a 500 status code with proper message", async () => {
        const res = await request(app).post("/setup").send();

        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty("message", "Setup operation has already been completed");
    });
});


// TEST 2: Signup endpoint
describe("POST/signup", () => { // register new user successfully created
    it("should register a new user and return a 201 status code", async () => {
        const res = await request(app).post("/signup").send({fullname: "John Doe", username: "johndoe", password: "password", email: "johndoe@example.com"});

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("fullname", "John Doe");
        expect(res.body).toHaveProperty("username", "johndoe");
        expect(res.body).toHaveProperty("email", "johndoe@example.com");
    });

    // check for validation and return error when fails
    it("should return a 400 status code with errors if validation fails", async () => {
        const res = await request(app).post("/signup").send({fullname: "John", username: "johndoe", password: "pass", email: "invalid_email"});

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("errors");
    });

    // check if username is already taken
    it("should return a 400 status code with proper message if username is already taken", async () => { // First, register a user with the username
        await request(app).post("/signup").send({fullname: "John Doe", username: "johndoe", password: "password", email: "johndoe@example.com"});

        // And then attempt to register another user with the same username
        const res = await request(app).post("/signup").send({fullname: "Jane Smith", username: "johndoe", password: "password", email: "janesmith@example.com"});

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("message", "Username is already taken");
    });

    // returning error if fullname validation is not met
    it("should return a 400 status code with proper message if an error occurs during signup", async () => {
        const res = await request(app).post("/signup").send({fullname: "", username: "johndoe", password: "password", email: "johndoe@example.com"});

        expect(res.statusCode).toEqual(400);
        expect(res.body.errors[0].msg).toEqual("Fullname is required");
    });
});


// TEST 3: Login endpoint
describe("POST /login", () => { // User from test 1
    it("should login the user in test 1 and return a 200 status code with token and user data", async () => {
        const res = await request(app).post("/login").send({username: process.env.REQUIRED_ADMIN_USERNAME, password: process.env.REQUIRED_ADMIN_PASSWORD});

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body).toHaveProperty("user");
    });

    // User missing password check
    it("should return a 400 status code with proper message if username or password is missing", async () => {
        const res = await request(app).post("/login").send({username: process.env.REQUIRED_ADMIN_USERNAME});

        expect(res.statusCode).toEqual(400);
        expect(res.body.errors[0].msg).toEqual("Password is required");
    });

    // User entering the wrong password check
    it("should return a 400 status code with proper message if invalid username or password is provided", async () => {
        const res = await request(app).post("/login").send({username: process.env.REQUIRED_ADMIN_USERNAME, password: "wrongpassword"});

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("message", "Invalid username or password");
    });
});


// TEST 4: category endpoint
describe("POST /category", () => {
    let token;

    beforeAll(async () => {
        token = await login(process.env.REQUIRED_ADMIN_USERNAME, process.env.REQUIRED_ADMIN_PASSWORD);
    });


    // Create a new category
    it("should create a new category and return a 201 status code", async () => {
        const res = await request(app).post("/category").set("Authorization", `Bearer ${token}`).send({category: "CAT_TEST"});

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("category", "CAT_TEST");
    });


    // Attempt to create the category with the same name again
    it("should return a 400 status code with proper message if category already exists", async () => {
        await request(app).post("/category").set("Authorization", `Bearer ${token}`).send({category: "CAT_TEST"});

        // Attempt to create the category with the same name again
        const res = await request(app).post("/category").set("Authorization", `Bearer ${token}`).send({category: "CAT_TEST"});

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("message", "Category already exists");
    });


    // Missing category name
    it("should return a 400 status code with proper message if category name is missing", async () => {
        const res = await request(app).post("/category").set("Authorization", `Bearer ${token}`).send({});

        expect(res.statusCode).toEqual(400);
        expect(res.body.errors[0].msg).toEqual("Name must be a string");
    });
});


// TEST 5: item endpoint
describe("POST /item", () => {
    let token;

    beforeAll(async () => {
        token = await login(process.env.REQUIRED_ADMIN_USERNAME, process.env.REQUIRED_ADMIN_PASSWORD);
    });

    // Create a new item
    it("should create a new item with category 'CAT_TEST' and name 'ITEM_TEST' and return a 201 status code", async () => {
        const categoriesRes = await request(app).get("/categories").set("Authorization", `Bearer ${token}`);

        await request(app).post("/category").set("Authorization", `Bearer ${token}`).send({category: "CAT_TEST"});

        if (!Array.isArray(categoriesRes.body)) {
            throw new Error('categoriesRes.body is not an array');
        }

        const category = categoriesRes.body.find(category => category.category === 'CAT_TEST');
        if (! category) {
            throw new Error('Category CAT_TEST not found');
        }

        const categoryId = category.id;

        const res = await request(app).post("/item").set("Authorization", `Bearer ${token}`).send({
            name: "ITEM_TEST",
            price: 10.5,
            stock_quantity: 15,
            sku: "ITEM_SKU_TEST",
            categoryId: categoryId,
            img_url: "https://example.com/image.jpg"
        });


        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("name", "ITEM_TEST");
        expect(res.body).toHaveProperty("categoryId", category.id);
    });


    // Attempt to create an item without the required fields
    it("should return a 400 status code with errors if required fields are not provided", async () => {
        const res = await request(app).post("/item").set("Authorization", `Bearer ${token}`).send({
            name: "ITEM_TEST",
            price: 10.5,
            stock_quantity: 15,
            sku: "ITEM_SKU_TEST",
            img_url: "https://example.com/image.jpg"
        });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("errors");
    });
});


// TESTS 6 & 7: search endpoint
describe("POST /search", () => {
    it("should search for items with 'mart' in the item name and return three items", async () => {
        const res = await request(app).post("/search").send({item_name: "mart"});

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(3);

        const itemNames = res.body.map((item) => item.name);
        expect(itemNames).toContain("Smartwatch");
        expect(itemNames).toContain("Smart Watch");
        expect(itemNames).toContain("Smartphone");

    });

    // Test case for searching items with the name "Laptop"
    it("should search for items with the name 'Laptop' and return one item", async () => {
        const res = await request(app).post("/search").send({item_name: "Laptop"});

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);

        const item = res.body[0];
        expect(item.name).toEqual("Laptop");
    });
});


// TEST 8: Admin user endpoints
describe("Admin user endpoints", () => {
    let token;

    beforeAll(async () => { 
        token = await login(process.env.REQUIRED_ADMIN_USERNAME, process.env.REQUIRED_ADMIN_PASSWORD);
    });

    // Test case for updating a category
    it("should update a category", async () => {
        const category = await createTestCategory();
        const res = await request(app).put(`/category/${
            category.id
        }`).send({category: "New Category Name"}).set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual("Category updated successfully");

        // Assert that the category has been updated in the database
        const updatedCategory = await db.Category.findByPk(category.id);
        expect(updatedCategory.category).toEqual("New Category Name");
    });

    // Test case for updating an item
    it("should update an item", async () => {
        const item = await createTestItem();
        const res = await request(app).put(`/item/${
            item.id
        }`).send({name: "New Item Name"}).set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toEqual("New Item Name");

        const updatedItem = await db.Item.findByPk(item.id);
        expect(updatedItem.name).toEqual("New Item Name");
    });

    // Test case for deleting an item
    it("should delete an item", async () => {
        const item = await createTestItem();
        const res = await request(app).delete(`/item/${
            item.id
        }`).set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual("item deleted successfully");

        // Assert that the item has been deleted from the database
        const deletedItem = await db.Item.findByPk(item.id);
        expect(deletedItem).toBeNull();
    });
});


// TEST 9: Database deletion test
describe("DELETE entries", () => {
    let token;

    beforeAll(async () => { 
        token = await login(process.env.REQUIRED_ADMIN_USERNAME, process.env.REQUIRED_ADMIN_PASSWORD);
    });

    // Delete the item with name 'ITEM_TEST' created in the previous test
    it("should delete the item 'ITEM_TEST'", async () => {
        const item = await db.Item.findOne({
            where: {
                name: "ITEM_TEST"
            }
        });

        const res = await request(app).delete(`/item/${
            item.id
        }`).set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);

        // Check if the item has been deleted from the database
        const deletedItem = await db.Item.findByPk(item.id);
        expect(deletedItem).toBeNull();
    });

    // Delete the category with name 'CAT_TEST' created in the previous test
    it("should delete the category 'CAT_TEST'", async () => {
        const category = await db.Category.findOne({
            where: {
                category: "CAT_TEST"
            }
        });

        const res = await request(app).delete(`/category/${
            category.id
        }`).set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);

        // Check if the category has been deleted from the database
        const deletedCategory = await db.Category.findByPk(category.id);
        expect(deletedCategory).toBeNull();
    });

    // Delete the user with username created in the previous test
    it("should delete the user 'johndoe'", async () => {
        const user = await db.User.findOne({
            where: {
                username: "johndoe"
            }
        });

        const res = await request(app).delete(`/${
            user.id
        }`).set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toEqual(204);

        // Check if the user has been deleted from the database
        const deletedUser = await db.User.findByPk(user.id);
        expect(deletedUser).toBeNull();
    });
});


// Test 10: running the /setup endpoint without making the API call or populate the database.
describe("/Setup endpoint without API call", () => {
    it("should return relevant message without making API call or populating the database", async () => {
        jest.spyOn(UtilitiesService, "fetchItemsFromExternalAPI").mockImplementation(() => {
            throw new Error("fetchItemsFromExternalAPI should not be called");
        });

        // Mock the utilitiesService.setupCompleted method
        jest.spyOn(UtilitiesService, "setupCompleted").mockResolvedValue(true);

        const res = await request(app).post("/setup")

        expect(res.statusCode).toEqual(409);
        expect(res.body.message).toEqual("Setup operation has already been completed");

        // Restore the original implementations of the mocked methods
        UtilitiesService.fetchItemsFromExternalAPI.mockRestore();
        UtilitiesService.setupCompleted.mockRestore();
    });
})

afterAll(async () => {
    await db.sequelize.sync({force: true});
    await db.sequelize.close();
});
