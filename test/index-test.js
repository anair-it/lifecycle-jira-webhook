const request = require('supertest');
const app = require("../index");

describe('GET /ping', () => {
    it('Ping', async()=> {
        await request(app)
            .get('/ping')
            .expect(200, 'pong');
    });
})