// Unit tests for ExportController — CSV data exports for workout history.
const { exportCsv } = require('../../../controllers/exportController');
const { WorkoutLog } = require('../../../models');
const { Parser } = require('json2csv');
const { createRes } = require('../../helpers/express');

// --- Module Mocks ---
jest.mock('../../../models', () => ({
  WorkoutLog: {
    findAll: jest.fn(),
  },
  SetData: {},
  Exercise: {}
}));

jest.mock('json2csv', () => ({
  Parser: jest.fn().mockImplementation(() => ({
    parse: jest.fn().mockReturnValue('csv,content\nline,1'),
  })),
}));



describe('ExportController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportCsv', () => {
    test('returns CSV content type with attachment header', async () => {
      WorkoutLog.findAll.mockResolvedValue([]);

      const req = { user: { id: 1 } };
      const res = createRes();

      await exportCsv(req, res);

      expect(res.header).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(res.attachment).toHaveBeenCalledWith(expect.stringContaining('musclo_export_'));
      expect(res.send).toHaveBeenCalledWith('csv,content\nline,1');
    });

    test('emits one row per set in flattened format', async () => {
      const mockLogs = [
        {
          started_at: new Date('2023-01-01T10:00:00Z'),
          name: 'Morning Routine',
          duration_seconds: 3600,
          total_volume: 5000,
          SetData: [
            {
              Exercise: { name: 'Squat' },
              set_number: 1,
              set_type: 'working',
              weight_kg: 100,
              reps: 10,
              rpe: 8,
              is_pr: true
            }
          ]
        },
        {
          started_at: new Date('2023-01-02T10:00:00Z'),
          name: 'Rest Day',
          duration_seconds: 0,
          total_volume: 0,
          SetData: [] // Empty log
        }
      ];

      WorkoutLog.findAll.mockResolvedValue(mockLogs);

      const req = { user: { id: 1 } };
      const res = createRes();

      await exportCsv(req, res);

      // Verify Parser was instantiated with correct fields
      expect(Parser).toHaveBeenCalledWith({
        fields: [
          'Workout Date', 'Workout Name', 'Duration (s)', 'Total Volume',
          'Exercise Name', 'Set Number', 'Type', 'Weight', 'Reps', 'RPE', 'Is PR'
        ]
      });

      // Verify the mock Parser's parse method was called with flattened data
      const mockParse = Parser.mock.results[0].value.parse;
      expect(mockParse).toHaveBeenCalled();
      
      const parsedData = mockParse.mock.calls[0][0];
      expect(parsedData).toHaveLength(2); // One set + one empty log
      
      // Verify data parsing logic for a row with sets
      expect(parsedData[0]).toEqual({
        'Workout Date': '2023-01-01',
        'Workout Name': 'Morning Routine',
        'Duration (s)': 3600,
        'Total Volume': 5000,
        'Exercise Name': 'Squat',
        'Set Number': 1,
        'Type': 'working',
        'Weight': 100,
        'Reps': 10,
        'RPE': 8,
        'Is PR': 'Yes'
      });

      // Verify placeholder logic for empty log
      expect(parsedData[1]).toEqual({
        'Workout Date': '2023-01-02',
        'Workout Name': 'Rest Day',
        'Duration (s)': 0,
        'Total Volume': 0,
        'Exercise Name': 'N/A',
        'Set Number': 'N/A',
        'Type': 'N/A',
        'Weight': 'N/A',
        'Reps': 'N/A',
        'RPE': 'N/A',
        'Is PR': 'N/A'
      });
    });
  });
});
