/* eslint-disable */
import { API_KEY, VERSION_ONE_TEST_ROUTE } from '../constants/index.constants';
import { expect } from 'chai';
import { agent as request } from 'supertest';
import app from '..';
import { StatusCodes } from 'http-status-codes';

const { OK, UNAUTHORIZED, NOT_FOUND} = StatusCodes;

describe('API works', () => {
  it('should return OK when we hit the test route', async () => {
    const res = await request(app)
      .get(VERSION_ONE_TEST_ROUTE)
      .set('x-api-key', String(API_KEY));
    expect(res.status).to.equal(OK);
  });

  it('should return a 401 when no x-api-key is provided', async () => {
    const res = await request(app)
      .get(VERSION_ONE_TEST_ROUTE)
    expect(res.status).to.equal(UNAUTHORIZED);
  });

  it('should return a 404 error for an unknown route', async () => {
    const res = await request(app)
      .get('/unknown-api-route')
      .set('x-api-key', String(API_KEY));
    expect(res.status).to.equal(NOT_FOUND);
  });
});
