const request = require("supertest");
const baseURL = "http://localhost:4000";

describe("POST /views/create", () => {
    const testData = {
        name: "Test",
        creator: "Tester",
        roleMembershipSheet: "https://docs.google.com/spreadsheets/u/2/d/1K1RoF5WRKtu_UDOVMTAMlr_tfCGv0rTi3qQBIwRCvrY/edit?usp=drive_web&ouid=117080592128520220146",
    }
    let tempAppId = ""; 
    let dataSourceId = "";
    beforeAll(async () => {
        const response = await request(baseURL).post("/app/create").send(testData);
        tempAppId = response.body._id;
        const tempData = {
            appId: tempAppId,
            url: "https://docs.google.com/spreadsheets/d/1kU6q9PXjjxF7NpjOozNThislZTKmJ1rQL3zG0rF3vm0/edit#gid=0",
            sheetIndex: 0,
            keys: [],
        }
        const data = await request(baseURL).post("/dataSource/add").send(tempData);
        dataSourceId = data.body._id;
    });
    afterAll(async () => {
        const response = await request(baseURL).post("/app/delete").send({ "appId": tempAppId });
    });
    it("should return 400 on empty info", async () => {
        const tempData = {
            appId: "",
            tableId: "",
            viewType: "",
        }
        const response = await request(baseURL).post("/views/create").send(tempData);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Error in view creation for app");
    });
    it("should add a new view", async () => {
        const tempData = {
            appId: tempAppId,
            tableId: dataSourceId,
            viewType: "table",
        }
        const response = await request(baseURL).post("/views/create").send(tempData);
        expect(response.statusCode).toBe(200);
        const app = await request(baseURL).post("/app/get").send({ "appId": tempAppId });
        expect(app.body[0].views.length).toBe(1);
    })
});