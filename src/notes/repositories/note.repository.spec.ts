import { Test, TestingModule } from '@nestjs/testing';
import { NoteRepository } from './note.repository';
import { INote } from '../interfaces/note.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Unit tests for NoteRepository
 */
describe('NoteRepository', () => {
  let repository: NoteRepository;
  let testDataDir: string;
  let testNotesFile: string;

  const mockNote: INote = {
    id: 'test-id-1',
    title: 'Test Note',
    content: 'Test Content',
    createdAt: new Date('2024-01-01'),
    modifiedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    // Use a temporary directory for testing
    testDataDir = path.join(process.cwd(), 'test-data');
    testNotesFile = path.join(testDataDir, 'notes.json');

    const module: TestingModule = await Test.createTestingModule({
      providers: [NoteRepository],
    }).compile();

    repository = module.get<NoteRepository>(NoteRepository);

    // Mock the data directory for testing
    (repository as any).dataDir = testDataDir;
    (repository as any).notesFile = testNotesFile;

    // Clean up test directory
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch { }

    await repository.onModuleInit();
  });

  afterEach(async () => {
    // Clean up test directory after each test
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch { }
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all notes', async () => {
      await repository.create({ title: 'Note 1', content: 'Content 1' });
      await repository.create({ title: 'Note 2', content: 'Content 2' });

      const result = await repository.findAll();

      expect(result.length).toBe(2);
    });

    it('should apply sorting when filters are provided', async () => {
      await repository.create({ title: 'B Note', content: 'Content' });
      await repository.create({ title: 'A Note', content: 'Content' });

      const result = await repository.findAll({ orderBy: 'title', order: 'asc' });

      expect(result.length).toBe(2);
      expect(result[0].title).toBe('A Note');
      expect(result[1].title).toBe('B Note');
    });
  });

  describe('findOne', () => {
    it('should return a note by id', async () => {
      const created = await repository.create({ title: 'Test', content: 'Content' });

      const result = await repository.findOne(created.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(created.id);
      expect(result?.title).toBe('Test');
    });

    it('should return null if note not found', async () => {
      const result = await repository.findOne('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new note', async () => {
      const createDto = {
        title: 'New Note',
        content: 'New Content',
      };

      const result = await repository.create(createDto);

      expect(result).toHaveProperty('id');
      expect(result.title).toBe(createDto.title);
      expect(result.content).toBe(createDto.content);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.modifiedAt).toBeInstanceOf(Date);
    });
  });

  describe('update', () => {
    it('should update an existing note', async () => {
      const created = await repository.create({ title: 'Original', content: 'Content' });

      const result = await repository.update(created.id, {
        title: 'Updated Title',
      });

      expect(result).toBeDefined();
      expect(result?.title).toBe('Updated Title');
      expect(result?.modifiedAt.getTime()).toBeGreaterThan(created.modifiedAt.getTime());
    });

    it('should return null if note not found', async () => {
      const result = await repository.update('non-existent', {
        title: 'Updated',
      });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete notes by ids', async () => {
      const note1 = await repository.create({ title: 'Note 1', content: 'Content 1' });
      const note2 = await repository.create({ title: 'Note 2', content: 'Content 2' });

      const result = await repository.delete([note1.id, note2.id]);

      expect(result.deletedCount).toBe(2);
    });

    it('should return 0 if no notes found to delete', async () => {
      const result = await repository.delete(['non-existent-id']);

      expect(result.deletedCount).toBe(0);
    });
  });
});
