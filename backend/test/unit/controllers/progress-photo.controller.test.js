// Unit tests for ProgressPhotoController — visual transformation tracking.

// --- Module Mocks ---
jest.mock('../../../models', () => ({
  ProgressPhoto: {
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  }
}));

jest.mock('@azure/storage-blob', () => ({
  ContainerClient: jest.fn().mockImplementation(() => ({
    getBlockBlobClient: jest.fn().mockImplementation(() => ({
      uploadData: jest.fn().mockResolvedValue({}),
      deleteIfExists: jest.fn().mockResolvedValue({}),
      url: 'https://azure.com/photo.jpg'
    }))
  }))
}));

jest.mock('../../../services/azureStorageService', () => ({
  uploadToAzure: jest.fn(),
  deleteFromAzure: jest.fn(),
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

const { ProgressPhoto } = require('../../../models');
const fs = require('fs');
const path = require('path');
const { createRes } = require('../../helpers/express');
const { getPhotos, createPhoto, deletePhoto } = require('../../../controllers/progressPhotoController');
const azureStorageService = require('../../../services/azureStorageService');

describe('ProgressPhotoController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPhotos', () => {
    test('returns paginated list with photo_url', async () => {
      ProgressPhoto.findAndCountAll.mockResolvedValue({
        count: 5,
        rows: [{ id: 10, photo_path: 'https://azure.com/photo.jpg', toJSON: () => ({ id: 10, photo_path: 'https://azure.com/photo.jpg' }) }]
      });

      const req = { user: { id: 1 }, query: { page: 1, per_page: 20 } };
      const res = createRes();

      await getPhotos(req, res);

      expect(ProgressPhoto.findAndCountAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        data: [{ id: 10, photo_path: 'https://azure.com/photo.jpg', photo_url: 'https://azure.com/photo.jpg' }],
        meta: expect.any(Object)
      });
    });
  });

  describe('createPhoto', () => {
    test('returns 400 when no file uploaded', async () => {
      const req = { user: { id: 1 }, body: {} }; // No req.file
      const res = createRes();

      await createPhoto(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Photo is required' });
    });

    test('creates photo row and returns 201', async () => {
      const mockPhoto = { id: 10, toJSON: () => ({ id: 10 }) };
      ProgressPhoto.create.mockResolvedValue(mockPhoto);
      azureStorageService.uploadToAzure.mockResolvedValue('https://azure.com/photo.jpg');

      const req = {
        user: { id: 1 },
        file: { path: '/tmp/image.jpg' },
        body: { pose: 'front' }
      };
      const res = createRes();

      await createPhoto(req, res);

      expect(azureStorageService.uploadToAzure).toHaveBeenCalledWith(req.file);
      expect(ProgressPhoto.create).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 1, photo_path: 'https://azure.com/photo.jpg', pose: 'front' })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        data: { id: 10, photo_url: 'https://azure.com/photo.jpg' }
      });
    });
  });

  describe('deletePhoto', () => {
    test('returns 404 for non-existent photo', async () => {
      ProgressPhoto.findOne.mockResolvedValue(null);

      const req = { user: { id: 1 }, params: { id: 99 } };
      const res = createRes();

      await deletePhoto(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Photo not found' });
    });

    test('deletes photo and unlinks file if exists', async () => {
      const mockPhoto = { id: 10, photo_path: 'https://azure.com/photo.jpg', destroy: jest.fn().mockResolvedValue() };
      ProgressPhoto.findOne.mockResolvedValue(mockPhoto);
      azureStorageService.deleteFromAzure.mockResolvedValue();

      const req = { user: { id: 1 }, params: { id: 10 } };
      const res = createRes();

      await deletePhoto(req, res);

      expect(azureStorageService.deleteFromAzure).toHaveBeenCalledWith('https://azure.com/photo.jpg');
      expect(mockPhoto.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
