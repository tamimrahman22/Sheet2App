const request = require("supertest");
const baseURL = "http://localhost:4000";

describe("POST /dataSource/add", () => {
    const testData = {
        name: "Test",
        creator: "Tester",
        roleMembershipSheet: "https://docs.google.com/spreadsheets/u/2/d/1K1RoF5WRKtu_UDOVMTAMlr_tfCGv0rTi3qQBIwRCvrY/edit?usp=drive_web&ouid=117080592128520220146",
    }
    let tempAppId = ""; 
    beforeAll(async () => {
        const response = await request(baseURL).post("/app/create").send(testData);
        tempAppId = response.body._id;
    });
    afterAll(async () => {
        const response = await request(baseURL).post("/app/delete").send({ "appId": tempAppId });
    });
    it("should return 400 on empty info", async () => {
        const tempData = {
            appId: "",
            url: "",
            sheetIndex: 0,
            keys: [],
        }
        const response = await request(baseURL).post("/dataSource/add").send(tempData);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Error in adding data source for app ");
    });
    it("should add a given data source", async () => {
        const tempData = {
            appId: tempAppId,
            url: "https://docs.google.com/spreadsheets/d/1kU6q9PXjjxF7NpjOozNThislZTKmJ1rQL3zG0rF3vm0/edit#gid=0",
            sheetIndex: 0,
            keys: [],
        }
        const response = await request(baseURL).post("/dataSource/add").send(tempData);
        expect(response.statusCode).toBe(200);
        const app = await request(baseURL).post("/app/get").send({ "appId": tempAppId });
        expect(app.body[0].dataSources.length).toBe(1);
    })
});

describe('POST /dataSource/getColumns', () => {
    it('should return the expected columns', async () => {
        const requestBody = {
            url: 'https://docs.google.com/spreadsheets/d/1WqzX_qC-oVPjKFt6gZVq_LAd7JmZtGkLmAb3GIjP6Ew/edit#gid=0',
            sheetIndex: 0
        };
        const expectedResponse = ['Student ID#','Full Name','Course ID','Graduation Year'];
        const response = await request(baseURL)
            .post('/dataSource/getColumns')
            .send(requestBody);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedResponse);
    });
});

describe('POST /dataSource/getRows', () => {
    it('should return the expected rows', async () => {
        const requestBody = {
            url: 'https://docs.google.com/spreadsheets/d/1WqzX_qC-oVPjKFt6gZVq_LAd7JmZtGkLmAb3GIjP6Ew/edit#gid=0',
            sheetIndex: 0
        };
        const expectedResponse = [
            ['1001','John Doe','101','2023'],
            ['1002','Jane Smith','102','2022'],
            ['1003','Tom Johnson','103','2024'],
            ['1004','Emily Chen','101','2023'],
            ['1005','Alex Kim','104','2022'],
            ['1006','Sarah Lee','102','2024'],
            ['1007','Jack Ma','105','2023'],
            ['1008','Lily Wang','106','2022'],
            ['1009','Michael Johnson','107','2024'],
            ['1010','Samantha Lee','108','2022'],
            ['1011','David Kim','109','2023'],
            ['1012','Rachel Chen','107','2024'],
            ['1013','Kevin Lee','110','2022'],
            ['1014','Ashley Wong','108','2023'],
            ['1015','William Chen','111','2024'],
            ['1016','Jessica Liu','112','2022']
        ];
        const response = await request(app)
            .post('/dataSource/getRows')
            .send(requestBody);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedResponse);
    });
});

