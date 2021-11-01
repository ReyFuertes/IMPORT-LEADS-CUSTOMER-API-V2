import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

const app = 'http://localhost:3000';

/* venues */
// describe('AppController (e2e)', () => {
//   it('/ (GET)', () => {
//     return request(app)
//       .get('/api/v1/venues')
//       .expect(200)
//   });
// });
