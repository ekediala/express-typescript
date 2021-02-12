/* eslint-disable */
import { VERSION_ONE_TEST_ROUTE } from '../constants/index.constants';
import { expect } from 'chai';
import { agent as request } from 'supertest';
import app from '..';

describe('API works', () => {
  it('should return OK when we hit the test route', async () => {
    const res = await request(app).get(VERSION_ONE_TEST_ROUTE);
    expect(res.status).to.equal(200);
  });
});

describe('Unknown routes fail', () => {
  it('should return a 404 error for an unknown route', async () => {
    const res = await request(app).get('/unknown-api-route');
    expect(res.status).to.equal(404);
  });
});
