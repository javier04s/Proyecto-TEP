import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NoteRepository } from './repositories/note.repository';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { INote } from './interfaces/note.interface';

/**
 * Unit tests for NotesService
 */
describe('NotesService', () => {
  let service: NotesService;
  let repository: NoteRepository;

  const mockNote: INote = {
    id: 'test-id-1',
    title: 'Test Note',
    content: 'Test Content',
    createdAt: new Date('2024-01-01'),
    modifiedAt: new Date('2024-01-01'),
  };

  const mockRepository = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: NoteRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    repository = module.get<NoteRepository>(NoteRepository);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of notes without content', async () => {
      mockRepository.findAll.mockResolvedValue([mockNote]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('content');
      expect(result[0]).toHaveProperty('id', mockNote.id);
      expect(result[0]).toHaveProperty('title', mockNote.title);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should pass filters to repository', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      await service.findAll('title', 'desc');

      expect(mockRepository.findAll).toHaveBeenCalledWith({
        orderBy: 'title',
        order: 'desc',
      });
    });
  });

  describe('findOne', () => {
    it('should return a note with all details including content', async () => {
      mockRepository.findOne.mockResolvedValue(mockNote);

      const result = await service.findOne('test-id-1');

      expect(result).toHaveProperty('content', mockNote.content);
      expect(result).toHaveProperty('id', mockNote.id);
      expect(mockRepository.findOne).toHaveBeenCalledWith('test-id-1');
    });

    it('should throw NotFoundException if note does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new note', async () => {
      const createDto: CreateNoteDto = {
        title: 'New Note',
        content: 'New Content',
      };

      mockRepository.create.mockResolvedValue(mockNote);

      const result = await service.create(createDto);

      expect(result).toHaveProperty('id', mockNote.id);
      expect(result).toHaveProperty('content', mockNote.content);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update an existing note', async () => {
      const updateDto: UpdateNoteDto = {
        title: 'Updated Title',
      };

      const updatedNote = { ...mockNote, title: 'Updated Title' };
      mockRepository.update.mockResolvedValue(updatedNote);

      const result = await service.update('test-id-1', updateDto);

      expect(result.title).toBe('Updated Title');
      expect(mockRepository.update).toHaveBeenCalledWith('test-id-1', updateDto);
    });

    it('should throw NotFoundException if note does not exist', async () => {
      mockRepository.update.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a single note', async () => {
      mockRepository.delete.mockResolvedValue({ deletedCount: 1 });

      const result = await service.remove('test-id-1');

      expect(result.deletedCount).toBe(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(['test-id-1']);
    });

    it('should delete multiple notes', async () => {
      mockRepository.delete.mockResolvedValue({ deletedCount: 2 });

      const result = await service.remove(['id-1', 'id-2']);

      expect(result.deletedCount).toBe(2);
      expect(mockRepository.delete).toHaveBeenCalledWith(['id-1', 'id-2']);
    });
  });
});
