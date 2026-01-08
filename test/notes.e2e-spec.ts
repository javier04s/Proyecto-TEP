import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * End-to-end tests for Notes API
 */
describe('Notes (e2e)', () => {
  let app: INestApplication;
  let createdNoteId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/notes (POST)', () => {
    it('should create a new note', () => {
      return request(app.getHttpServer())
        .post('/notes')
        .send({
          title: 'Test Note',
          content: 'Test Content',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Test Note');
          expect(res.body.content).toBe('Test Content');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('modifiedAt');
          createdNoteId = res.body.id;
        });
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/notes')
        .send({
          title: '',
        })
        .expect(400);
    });
  });

  describe('/notes (GET)', () => {
    it('should return all notes without content', () => {
      return request(app.getHttpServer())
        .get('/notes')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).not.toHaveProperty('content');
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('title');
            expect(res.body[0]).toHaveProperty('createdAt');
            expect(res.body[0]).toHaveProperty('modifiedAt');
          }
        });
    });

    it('should support sorting by title', () => {
      return request(app.getHttpServer())
        .get('/notes?orderBy=title&order=asc')
        .expect(200);
    });

    it('should support sorting by createdAt', () => {
      return request(app.getHttpServer())
        .get('/notes?orderBy=createdAt&order=desc')
        .expect(200);
    });
  });

  describe('/notes/:id (GET)', () => {
    it('should return a note with all details including content', () => {
      return request(app.getHttpServer())
        .get(`/notes/${createdNoteId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdNoteId);
          expect(res.body).toHaveProperty('title');
          expect(res.body).toHaveProperty('content');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('modifiedAt');
        });
    });

    it('should return 404 for non-existent note', () => {
      return request(app.getHttpServer())
        .get('/notes/non-existent-id')
        .expect(404);
    });
  });

  describe('/notes/:id (PATCH)', () => {
    it('should update a note', () => {
      return request(app.getHttpServer())
        .patch(`/notes/${createdNoteId}`)
        .send({
          title: 'Updated Title',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated Title');
          expect(new Date(res.body.modifiedAt).getTime()).toBeGreaterThan(
            new Date(res.body.createdAt).getTime(),
          );
        });
    });

    it('should return 404 for non-existent note', () => {
      return request(app.getHttpServer())
        .patch('/notes/non-existent-id')
        .send({ title: 'Updated' })
        .expect(404);
    });
  });

  describe('/notes/:id (DELETE)', () => {
    it('should delete a note by URL parameter', () => {
      return request(app.getHttpServer())
        .delete(`/notes/${createdNoteId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('deletedCount');
          expect(res.body.deletedCount).toBeGreaterThanOrEqual(0);
        });
    });
  });

  describe('/notes (DELETE with body)', () => {
    it('should delete multiple notes by body IDs', async () => {
      // Create multiple notes first
      const note1 = await request(app.getHttpServer())
        .post('/notes')
        .send({ title: 'Note 1', content: 'Content 1' })
        .expect(201);

      const note2 = await request(app.getHttpServer())
        .post('/notes')
        .send({ title: 'Note 2', content: 'Content 2' })
        .expect(201);

      const ids = [note1.body.id, note2.body.id];

      return request(app.getHttpServer())
        .delete('/notes')
        .send({ ids })
        .expect(200)
        .expect((res) => {
          expect(res.body.deletedCount).toBeGreaterThanOrEqual(1);
        });
    });

    it('should return 0 deleted count if no IDs provided', () => {
      return request(app.getHttpServer())
        .delete('/notes')
        .send({ ids: [] })
        .expect(200)
        .expect((res) => {
          expect(res.body.deletedCount).toBe(0);
        });
    });
  });
});
