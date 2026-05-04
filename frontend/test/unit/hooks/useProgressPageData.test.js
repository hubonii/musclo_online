// Unit tests for useProgressPageData — aggregation of transformation metrics.
import { act, renderHook } from '@testing-library/react';
import { useProgressPageData } from '../../../src/hooks/useProgressPageData';
import {
  useMeasurements,
  useAddMeasurement,
  useUpdateMeasurement,
} from '../../../src/hooks/useMeasurements';
import {
  useProgressPhotos,
  useUploadProgressPhoto,
  useDeleteProgressPhoto,
} from '../../../src/hooks/useProgressPhotos';
import { useToast } from '../../../src/components/ui/Toast';
import { getTodayString, groupPhotosByDate } from '../../../src/lib/utils';

jest.mock('../../../src/hooks/useMeasurements', () => ({
  useMeasurements: jest.fn(),
  useAddMeasurement: jest.fn(),
  useUpdateMeasurement: jest.fn(),
}));

jest.mock('../../../src/hooks/useProgressPhotos', () => ({
  useProgressPhotos: jest.fn(),
  useUploadProgressPhoto: jest.fn(),
  useDeleteProgressPhoto: jest.fn(),
}));

jest.mock('../../../src/components/ui/Toast', () => ({
  useToast: jest.fn(),
}));

jest.mock('../../../src/lib/utils', () => ({
  getTodayString: jest.fn(),
  groupPhotosByDate: jest.fn(),
}));

describe('useProgressPageData', () => {
  const toast = jest.fn();
  const addMeasurement = jest.fn();
  const updateMeasurement = jest.fn();
  const uploadPhoto = jest.fn();
  const deletePhoto = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.confirm = jest.fn();

    getTodayString.mockReturnValue('2026-04-19');
    groupPhotosByDate.mockReturnValue({ sessionsByDate: {}, sortedDates: [] });
    useToast.mockReturnValue({ toast });

    useMeasurements.mockReturnValue({
      data: [],
      isLoading: false,
    });
    useAddMeasurement.mockReturnValue({ mutateAsync: addMeasurement, isPending: false });
    useUpdateMeasurement.mockReturnValue({ mutateAsync: updateMeasurement, isPending: false });

    useProgressPhotos.mockReturnValue({ data: [], isLoading: false });
    useUploadProgressPhoto.mockReturnValue({ mutateAsync: uploadPhoto, isPending: false });
    useDeleteProgressPhoto.mockReturnValue({ mutateAsync: deletePhoto });
  });

  test('blocks empty measurement submit with an error toast', async () => {
    const { result } = renderHook(() => useProgressPageData());

    await act(async () => {
      await result.current.handleSaveMeasurements({ preventDefault: jest.fn() });
    });

    expect(toast).toHaveBeenCalledWith('error', 'Empty Form', 'Please enter at least one measurement.');
    expect(addMeasurement).not.toHaveBeenCalled();
  });

  test('creates a new daily measurement and resets form state', async () => {
    addMeasurement.mockResolvedValue({ id: 99 });
    const { result } = renderHook(() => useProgressPageData());

    act(() => {
      result.current.setIsMeasurementsOpen(true);
      result.current.setMeasurementForm((prev) => ({ ...prev, weight_kg: '82', notes: 'steady progress' }));
    });

    await act(async () => {
      await result.current.handleSaveMeasurements({ preventDefault: jest.fn() });
    });

    expect(addMeasurement).toHaveBeenCalledWith({
      date: '2026-04-19',
      weight_kg: 82,
      notes: 'steady progress',
    });
    expect(updateMeasurement).not.toHaveBeenCalled();
    expect(result.current.isMeasurementsOpen).toBe(false);
    expect(toast).toHaveBeenCalledWith('success', 'Measurements Logged', 'Body measurements saved.');
  });

  test('updates existing same-day measurement when one already exists', async () => {
    useMeasurements.mockReturnValue({
      data: [{ id: 7, date: '2026-04-19' }],
      isLoading: false,
    });

    const { result } = renderHook(() => useProgressPageData());

    act(() => {
      result.current.setMeasurementForm((prev) => ({ ...prev, waist_cm: '88' }));
    });

    await act(async () => {
      await result.current.handleSaveMeasurements({ preventDefault: jest.fn() });
    });

    expect(updateMeasurement).toHaveBeenCalledWith({ id: 7, date: '2026-04-19', waist_cm: 88 });
    expect(addMeasurement).not.toHaveBeenCalled();
  });

  test('rejects oversized upload before mutation', async () => {
    const { result } = renderHook(() => useProgressPageData());
    const file = new File(['abc'], 'big.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 });

    await act(async () => {
      await result.current.handleFileChange({ target: { files: [file] } });
    });

    expect(toast).toHaveBeenCalledWith('error', 'File too large', 'Maximum photo size is 5MB.');
    expect(uploadPhoto).not.toHaveBeenCalled();
  });

  test('deletes photo only after confirmation', async () => {
    global.confirm.mockReturnValue(false);
    const { result } = renderHook(() => useProgressPageData());

    await act(async () => {
      await result.current.handleDeletePhoto(41);
    });

    expect(deletePhoto).not.toHaveBeenCalled();

    global.confirm.mockReturnValue(true);
    await act(async () => {
      await result.current.handleDeletePhoto(41);
    });

    expect(deletePhoto).toHaveBeenCalledWith(41);
    expect(toast).toHaveBeenCalledWith('success', 'Photo Deleted', 'The photo has been removed.');
  });
});

