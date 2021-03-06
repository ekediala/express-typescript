/* eslint-disable */
import {
  API_KEY,
  API_VERSION_ONE_URL,
  AUTH_HEADER_TOKEN_KEY,
  JWT_PASSWORD_RESET_REQUEST_SECRET_KEY,
  JWT_PASSWORD_RESET_SECRET_KEY,
} from '../constants/index.constants';
import { expect } from 'chai';
import { agent as request } from 'supertest';
import app from '..';
import { StatusCodes } from 'http-status-codes';
import { ROUTES } from '../router/routes';
import faker from 'faker';
import mockery from 'mockery';
import nodemailerMock from 'nodemailer-mock';
import { sign } from 'jsonwebtoken';

const {
  OK,
  NOT_FOUND,
  CREATED,
  UNPROCESSABLE_ENTITY,
  CONFLICT,
} = StatusCodes;

const {
  LOGIN,
  REGISTER,
  VERIFY_PASSWORD_RESET_REQUEST,
  REQUEST_PASSWORD_RESET,
  RESET_PASSWORD,
} = ROUTES;

// Register tests
describe('Test for creating user', () => {
  const email = faker.internet.email();
  const password = 'password';
  it('should register a user successfully', async () => {
    const res = await request(app)
      .post(`${API_VERSION_ONE_URL}/${REGISTER}`)
      .set('x-api-key', String(API_KEY))
      .send({
        email,
        password,
        confirmPassword: password,
      });
    expect(res.status).to.equal(CREATED);
    expect(res.body)
      .to.haveOwnProperty('data')
      .to.not.haveOwnProperty('password');
    expect(res.header).to.haveOwnProperty(AUTH_HEADER_TOKEN_KEY);
  });

  it('should return a 422 if passwords do not match', async () => {
    const res = await request(app)
      .post(`${API_VERSION_ONE_URL}/${REGISTER}`)
      .set('x-api-key', String(API_KEY))
      .send({
        email,
        password,
        confirmPassword: `${faker.internet.password(10)}-${Math.random()}`,
      });
    expect(res.status).to.equal(UNPROCESSABLE_ENTITY);
  });

  it('should return a conflict if user has already been registered', async () => {
    const res = await request(app)
      .post(`${API_VERSION_ONE_URL}/${REGISTER}`)
      .set('x-api-key', String(API_KEY))
      .send({
        email,
        password,
        confirmPassword: password,
      });
    expect(res.status).to.equal(CONFLICT);
  });

  it('should return a 422 if a form field is omitted', async () => {
    const res = await request(app)
      .post(`${API_VERSION_ONE_URL}/${REGISTER}`)
      .set('x-api-key', String(API_KEY))
      .send({
        email,
        password,
      });
    expect(res.status).to.equal(UNPROCESSABLE_ENTITY);
  });
});

// Login tests
describe('Login tests', () => {
  const email = faker.internet.email();
  const password = 'password';
  before(async () => {
    await request(app)
      .post(`${API_VERSION_ONE_URL}/${REGISTER}`)
      .set('x-api-key', String(API_KEY))
      .send({ email, password, confirmPassword: password });
  });

  it('successfully logs a registered user in', async () => {
    const res = await request(app)
      .post(`${API_VERSION_ONE_URL}/${LOGIN}`)
      .set('x-api-key', String(API_KEY))
      .send({
        email,
        password,
      });
    expect(res.status).to.equal(OK);
    expect(res.body)
      .to.haveOwnProperty('data')
      .to.not.haveOwnProperty('password');
    expect(res.header).to.haveOwnProperty(AUTH_HEADER_TOKEN_KEY);
  });

  it('rejects an unknown user', async () => {
    const res = await request(app)
      .post(`${API_VERSION_ONE_URL}/${LOGIN}`)
      .set('x-api-key', String(API_KEY))
      .send({
        email: faker.internet.email(),
        password,
      });
    expect(res.status).to.equal(NOT_FOUND);
  });

  it('rejects an user with the wrong password', async () => {
    const res = await request(app)
      .post(`${API_VERSION_ONE_URL}/${LOGIN}`)
      .set('x-api-key', String(API_KEY))
      .send({
        email,
        password: faker.internet.password(16),
      });
    expect(res.status).to.equal(UNPROCESSABLE_ENTITY);
  });

  it('should return a 422 if a form field is omitted', async () => {
    const res = await request(app)
      .post(`${API_VERSION_ONE_URL}/${REGISTER}`)
      .set('x-api-key', String(API_KEY))
      .send({
        email,
      });
    expect(res.status).to.equal(UNPROCESSABLE_ENTITY);
  });
});

// Password reset tests
describe('Password reset tests', () => {
  const email = faker.internet.email();
  const password = 'password';
  before(async () => {
    mockery.enable({
      warnOnUnregistered: false,
    });

    /* Once mocked, any code that calls require('nodemailer')
    will get our nodemailerMock */
    mockery.registerMock('nodemailer', nodemailerMock);

    await request(app)
      .post(`${API_VERSION_ONE_URL}/${REGISTER}`)
      .set('x-api-key', String(API_KEY))
      .send({ email, password, confirmPassword: password });
  });

  afterEach(async () => {
    // Reset the mock back to the defaults after each test
    nodemailerMock.mock.reset();
  });

  after(async () => {
    // Remove our mocked nodemailer and disable mockery
    mockery.deregisterAll();
    mockery.disable();
  });

  it('test it sends an email to a user', async () => {
    const res = await request(app)
      .post(`${API_VERSION_ONE_URL}/${REQUEST_PASSWORD_RESET}`)
      .set('x-api-key', String(API_KEY))
      .send({ email });
    expect(res.status).to.equal(OK);
  });

  it('rejects an unregistered user password reset request', async () => {
    const res = await request(app)
      .post(`${API_VERSION_ONE_URL}/${REQUEST_PASSWORD_RESET}`)
      .set('x-api-key', String(API_KEY))
      .send({ email: faker.internet.email() });
    expect(res.status).to.equal(NOT_FOUND);
  });

  it('verifies a correct password reset request token', async () => {
    const token = sign(
      { email },
      String(JWT_PASSWORD_RESET_REQUEST_SECRET_KEY)
    );
    const res = await request(app)
      .get(
        `${API_VERSION_ONE_URL}/${VERIFY_PASSWORD_RESET_REQUEST.replace(
          '/:token',
          ''
        )}/${token}`
      )
      .set('x-api-key', String(API_KEY));
    expect(res.status).to.equal(OK);
    expect(res.body).to.haveOwnProperty('data').to.haveOwnProperty('token');
  });

  it('does not verify an expired password reset request token', async () => {
    const token = sign(
      { email },
      String(JWT_PASSWORD_RESET_REQUEST_SECRET_KEY),
      { expiresIn: '1ms' }
    );
    const res = await request(app)
      .get(
        `${API_VERSION_ONE_URL}/${VERIFY_PASSWORD_RESET_REQUEST.replace(
          '/:token',
          ''
        )}/${token}`
      )
      .set('x-api-key', String(API_KEY));
    expect(res.status).to.equal(NOT_FOUND);
  });

  it('successfully changes user password', async () => {
    const token = sign({ email }, String(JWT_PASSWORD_RESET_SECRET_KEY));
    const res = await request(app)
      .post(`${API_VERSION_ONE_URL}/${RESET_PASSWORD}`)
      .set('x-api-key', String(API_KEY))
      .send({ token, password: 'password', confirmPassword: 'password' });
    expect(res.status).to.equal(OK);
    expect(res.body)
      .to.haveOwnProperty('data')
      .to.not.haveOwnProperty('password');
    expect(res.header).to.haveOwnProperty(AUTH_HEADER_TOKEN_KEY);
  });

  it('fails to change user password if password and confirm password do not match', async () => {
    const token = sign({ email }, String(JWT_PASSWORD_RESET_SECRET_KEY));
    const res = await request(app)
      .post(`${API_VERSION_ONE_URL}/${RESET_PASSWORD}`)
      .set('x-api-key', String(API_KEY))
      .send({ token, password: 'password', confirmPassword: 'password1234' });
    expect(res.status).to.equal(UNPROCESSABLE_ENTITY);
  });

  it('fails to change user password if token has expired', async () => {
    const token = sign({ email }, String(JWT_PASSWORD_RESET_SECRET_KEY), {expiresIn: '1ms'});
    const res = await request(app)
      .post(`${API_VERSION_ONE_URL}/${RESET_PASSWORD}`)
      .set('x-api-key', String(API_KEY))
      .send({ token, password: 'password', confirmPassword: 'password' });
    expect(res.status).to.equal(NOT_FOUND);
  });
});
