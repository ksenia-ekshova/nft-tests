const chai = require('chai');
const expect = chai.expect;
const axios = require('axios');

const appBasicUrl = "http://localhost:4000";

describe('Backend Test', function() {
  it('Should return 200 status code', async function() {
    let response = await axios.get(appBasicUrl + '/events/');
    expect(response.status).to.equal(200);
    console.log('response code ' + response.status);
  });
});