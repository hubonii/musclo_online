// Unit tests for ProgressPhotoController — visual transformation tracking.
const { getPhotos, createPhoto, deletePhoto, showFile } = require('../../../controllers/progressPhotoController');
const { ProgressPhoto } = require('../../../models');
const fs = require('fs');
const path = require('path');
const { createRes } = require('../../helpers/express');

// --- Module Mocks ---
jest.mock('../../../models', () => ({
  ProgressPhoto: {
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  }
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));



describe('ProgressPhotoController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPhotos', () => {
    test('returns paginated list with photo_url', async () => {
      ProgressPhoto.findAndCountAll.mockResolvedValue({
        count: 5,
        rows: [{ id: 10, toJSON: () => ({ id: 10 }) }]
      });

      const req = { user: { id: 1 }, query: { page: 1, per_page: 20 } };
      const res = createRes();

      await getPhotos(req, res);

      expect(ProgressPhoto.findAndCountAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        data: [{ id: 10, photo_url: '/api/progress-photos/10/file' }],
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

      const req = {
        user: { id: 1 },
        file: { path: '/tmp/image.jpg' },
        body: { pose: 'front' }
      };
      const res = createRes();

      await createPhoto(req, res);

      expect(ProgressPhoto.create).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 1, photo_path: '/tmp/image.jpg', pose: 'front' })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        data: { id: 10, photo_url: '/api/progress-photos/10/file' }
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
      const mockPhoto = { id: 10, photo_path: '/tmp/image.jpg', destroy: jest.fn().mockResolvedValue() };
      ProgressPhoto.findOne.mockResolvedValue(mockPhoto);
      fs.existsSync.mockReturnValue(true);

      const req = { user: { id: 1 }, params: { id: 10 } };
      const res = createRes();

      await deletePhoto(req, res);

      expect(fs.existsSync).toHaveBeenCalledWith('/tmp/image.jpg');
      expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/image.jpg');
      expect(mockPhoto.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('showFile', () => {
    test('sends absolute file path if valid', async () => {
      const mockPhoto = { id: 10, photo_path: '/absolute/tmp/image.jpg' };
      ProgressPhoto.findOne.mockResolvedValue(mockPhoto);
      
      // Force existsSync behavior so it uses the absolute path
      fs.existsSync.mockImplementation((p) => p === '/absolute/tmp/image.jpg');

      const req = { user: { id: 1 }, params: { id: 10 } };
      const res = createRes();

      await showFile(req, res);

      expect(res.sendFile).toHaveBeenCalledWith('/absolute/tmp/image.jpg');
    });

    test('returns 404 if file does not exist anywhere', async () => {
      const mockPhoto = { id: 10, photo_path: 'relative/image.jpg' };
      ProgressPhoto.findOne.mockResolvedValue(mockPhoto);
      fs.existsSync.mockReturnValue(false);

      const req = { user: { id: 1 }, params: { id: 10 } };
      const res = createRes();

      await showFile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Physical file not found' });
    });
  });
});
