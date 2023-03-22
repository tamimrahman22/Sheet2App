const request = require("supertest");
const baseURL = "http://localhost:4000";
let tempAppId = "";

describe ("GET /app/test", () => {
    it("should return 200", async () => {
        const response = await request(baseURL).get("/app/test");
        expect(response.statusCode).toBe(200);
    });
});

describe ("POST /app/create with invalid info", () => {
    it("should return 400 with empty info", async () => {
        const testData = {
            name: "",
            creator: "",
            roleMembershipSheet: "",
        }
        const response = await request(baseURL).post("/app/create").send(testData);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Error in reading membership sheet information for app ");
    });
    it("should return 400 with bad link", async () => {
        const testData = {
            name: "Test",
            creator: "Tester",
            roleMembershipSheet: "http://thisisabadlink.com",
        }
        response = await request(baseURL).post("/app/create").send(testData);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Error in reading membership sheet information for app Test");
    });
});

describe ("POST /app/create", () => {
    const testData = {
        name: "Test",
        creator: "Tester",
        roleMembershipSheet: "https://docs.google.com/spreadsheets/u/2/d/1K1RoF5WRKtu_UDOVMTAMlr_tfCGv0rTi3qQBIwRCvrY/edit?usp=drive_web&ouid=117080592128520220146",
    }
    it("should successfully add a new app to MongoDb with info", async () => {
        const response = await request(baseURL).post("/app/create").send(testData);
        expect(response.statusCode).toBe(200);
        expect(response.body.name).toBe("Test");
        expect(response.body.creator).toBe("Tester");
        expect(response.body.roleMembershipSheet).toBe("https://docs.google.com/spreadsheets/u/2/d/1K1RoF5WRKtu_UDOVMTAMlr_tfCGv0rTi3qQBIwRCvrY/edit?usp=drive_web&ouid=117080592128520220146");
        expect(response.body.roles.length).toBe(5);
        tempAppId = response.body._id;
    });
});

describe("GET /app/list", () => {
    it("should return the one created app", async () => {
        const response = await request(baseURL).get("/app/list");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
    });
});

describe("POST /app/get with invalid appId", () => {
    it("should return 400 with empty appId", async () => {
        const response = await request(baseURL).post("/app/get").send({ "appId": "" });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Error in getting app");
    });
    it("should return 400 with bad appId", async () => {
        const response = await request(baseURL).post("/app/get").send({ "appId": "badAppId" });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Error in getting app");
    });
});


describe(`POST /app/get ${tempAppId}`, () => {
    it("should return app info for given appId", async () => {
        const response = await request(baseURL).post("/app/get").send({ "appId": tempAppId });
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].name).toBe("Test");
        expect(response.body[0].creator).toBe("Tester");
        expect(response.body[0].roleMembershipSheet).toBe("https://docs.google.com/spreadsheets/u/2/d/1K1RoF5WRKtu_UDOVMTAMlr_tfCGv0rTi3qQBIwRCvrY/edit?usp=drive_web&ouid=117080592128520220146");
        expect(response.body[0].roles.length).toBe(5);
    });
})

describe("POST /app/publish with invalid appId", () => {
    it("should return 400 with empty appId", async () => {
        const response = await request(baseURL).post("/app/publish").send({ "appId": "" });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Error in publishing app");
    });
    it("should return 400 with bad appId", async () => {
        const response = await request(baseURL).post("/app/publish").send({ "appId": "badAppId" });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Error in publishing app");
    });
});

describe(`POST /app/publish ${tempAppId}`, () => {
    it("should publish the given app", async () => {
        const response = await request(baseURL).post("/app/publish").send({ "appId": tempAppId });
        expect(response.statusCode).toBe(200);
        expect(response.body.published).toBe(true);
    });
});

describe("POST /app/unpublish with invalid appId", () => {
    it("should return 400 with empty appId", async () => {
        const response = await request(baseURL).post("/app/unpublish").send({ "appId": "" });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Error in unpublishing app");
    });
    it("should return 400 with bad appId", async () => {
        const response = await request(baseURL).post("/app/unpublish").send({ "appId": "badAppId" });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Error in unpublishing app");
    });
});

describe(`POST /app/unpublish ${tempAppId}`, () => {
    it("should unpublish the given app", async () => {
        const response = await request(baseURL).post("/app/unpublish").send({ "appId": tempAppId });
        expect(response.statusCode).toBe(200);
        expect(response.body.published).toBe(false);
    });
});

describe("POST /app/published-end-user", () => {
    beforeAll(async () => await request(baseURL).post("/app/publish").send({ "appId": tempAppId }));
    afterAll(async () => await request(baseURL).post("/app/unpublish").send({ "appId": tempAppId }));
    it("should return empty list with empty user", async () => {
        const response = await request(baseURL).post("/app/published-end-user").send({ "user": "" });
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
    });
    it("should return empty list with unfound user", async () => {
        const response = await request(baseURL).post("/app/published-end-user").send({ "user": "fake@gmail.com" });
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
    });
    it("should return empty list with developer user", async () => {
        const response = await request(baseURL).post("/app/published-end-user").send({ "user": "1@gmail.com" });
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
    });
    it(`should return list containing ${tempAppId} with developer user`, async () => {
        const response = await request(baseURL).post("/app/published-end-user").send({ "user": "2@gmail.com" });
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].name).toBe("Test");
        expect(response.body[0].creator).toBe("Tester");
        expect(response.body[0].roleMembershipSheet).toBe("https://docs.google.com/spreadsheets/u/2/d/1K1RoF5WRKtu_UDOVMTAMlr_tfCGv0rTi3qQBIwRCvrY/edit?usp=drive_web&ouid=117080592128520220146");
        expect(response.body[0].roles.length).toBe(5);
    });
});

describe("POST /app/delete with invalid appId", () => {
    it("should return 400 with empty appId", async () => {
        const response = await request(baseURL).post("/app/delete").send({ "appId": "" });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Error in app deletion for app ");
    });
    it("should return 400 with bad appId", async () => {
        const response = await request(baseURL).post("/app/delete").send({ "appId": "badAppId" });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Error in app deletion for app badAppId");
    });
});

describe(`POST /app/delete ${tempAppId}`, () => {
    it("should delete an app with given id", async () => {
        const response = await request(baseURL).post("/app/delete").send({ "appId": tempAppId });
        expect(response.statusCode).toBe(200);
        expect(response.body.acknowledged).toBe(true);
        expect(response.body.deletedCount).toBe(1);
    });
    it("should leave the database empty", async () => {
        response = await request(baseURL).get("/app/list");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
    });
});

