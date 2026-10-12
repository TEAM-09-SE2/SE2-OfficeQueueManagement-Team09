const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');

describe('GET /api/counters/current', () => {
  it('should return all counters with their current serving tickets', async () => {
    const response = await request(app).get('/api/counters/current');
    
    assert.strictEqual(response.status, 200, 'Status code should be 200');
    assert.ok(Array.isArray(response.body), 'Response body should be an array');
    
    if (response.body.length > 0) {
      const firstCounter = response.body[0];
      assert.ok('id_counter' in firstCounter, 'Counter object should contain id_counter');
      assert.ok('ticket_code' in firstCounter, 'Counter object should contain ticket_code');
      assert.ok('service_name' in firstCounter, 'Counter object should contain service_name');
    }
  });
});