let request = require('request');
xdescribe("Login route check", () =>{
    it("Test for login credentials", (done) => {
        let data = {
            email: "psnanda.bapu@gmail.com",
            password: "308ab220"
        }
        let url = "http://localhost:8000/login";
        let options = {
            method: 'post',
            body: data,
            json: true,
            url: url
        }
        request(options, (error, response, body) => {
            expect(body.success).toBe(true);
            expect(body.message).toMatch("Success");
            done();
        })
    })
})

describe("Test for player route", () => {
    let token = "";
    beforeEach((done) => {
        let data = {
            email: "psnanda.bapu@gmail.com",
            password: "308ab220"
        }
        let url = "http://localhost:8000/login";
        let options = {
            method: 'post',
            body: data,
            json: true,
            url: url
        }
        request(options, (error, response, body) => {
            token = body.token;
            done();
        })
    })
    it("Test getplayers route", (done) => {
        done();
    })
} )
