// Unit tests for SettingsController — user preferences and theme management.
const { getSettings, updateSettings } = require('../../../controllers/settingsController');
const { UserSetting } = require('../../../models');
const { createRes } = require('../../helpers/express');

// --- Module Mocks ---
jest.mock('../../../models', () => ({
  UserSetting: {
    findOrCreate: jest.fn(),
  }
}));



describe('SettingsController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    test('returns defaults when no row exists', async () => {
      const mockSettings = { unit_system: 'metric', theme: 'system' };
      UserSetting.findOrCreate.mockResolvedValue([mockSettings, true]);

      const req = { user: { id: 1 } };
      const res = createRes();

      await getSettings(req, res);

      expect(UserSetting.findOrCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 1 },
          defaults: expect.objectContaining({ theme: 'system' })
        })
      );
      expect(res.json).toHaveBeenCalledWith({ data: mockSettings });
    });

    test('returns 500 on database error', async () => {
      UserSetting.findOrCreate.mockRejectedValue(new Error('DB Error'));
      const req = { user: { id: 1 } };
      const res = createRes();

      await getSettings(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
    });
  });

  describe('updateSettings', () => {
    test('writes partial update fields', async () => {
      const mockSettings = {
        unit_system: 'metric',
        update: jest.fn().mockResolvedValue()
      };
      UserSetting.findOrCreate.mockResolvedValue([mockSettings, false]);

      const req = {
        user: { id: 1 },
        body: { theme: 'dark' }
      };
      const res = createRes();

      await updateSettings(req, res);

      expect(UserSetting.findOrCreate).toHaveBeenCalledWith({ where: { user_id: 1 } });
      expect(mockSettings.update).toHaveBeenCalledWith({ theme: 'dark' });
      expect(res.json).toHaveBeenCalledWith({ data: mockSettings });
    });
  });
});
