/* eslint-disable import/first */
jest.mock('../src/lib/supabase', () => {
  const mockUpload = jest.fn();
  const mockGetPublicUrl = jest
    .fn()
    .mockReturnValue({ data: { publicUrl: 'https://example.com/weekly.jpg' } });
  return {
    supabase: {
      storage: {
        from: jest.fn().mockReturnValue({ upload: mockUpload, getPublicUrl: mockGetPublicUrl }),
      },
    },
    __mockUpload: mockUpload,
  };
});

import { uploadWeeklyPhoto } from '../src/features/reviews/upload-weekly-photo';
/* eslint-enable import/first */

const mockBlob = new Blob(['test'], { type: 'image/jpeg' });

function mockFetchSuccess() {
  jest.spyOn(globalThis, 'fetch').mockResolvedValue({
    blob: () => Promise.resolve(mockBlob),
  } as unknown as Response);
}

function mockFetchFailure() {
  jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('URI cleared by OS'));
}

function getMocks() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('../src/lib/supabase') as { __mockUpload: jest.Mock };
  return { upload: mod.__mockUpload };
}

describe('uploadWeeklyPhoto', () => {
  beforeEach(() => {
    getMocks().upload.mockReset();
  });

  it('returns public URL on success', async () => {
    mockFetchSuccess();
    getMocks().upload.mockResolvedValue({ error: null });

    const result = await uploadWeeklyPhoto('user1', 'file://test.jpg', '2026-05-04');

    expect(result.data).toBe('https://example.com/weekly.jpg');
    expect(result.error).toBeNull();
  });

  it('returns error when storage upload fails', async () => {
    mockFetchSuccess();
    const uploadErr = new Error('Storage quota exceeded');
    getMocks().upload.mockResolvedValue({ error: uploadErr });

    const result = await uploadWeeklyPhoto('user1', 'file://test.jpg', '2026-05-04');

    expect(result.data).toBeNull();
    expect(result.error).toBe(uploadErr);
  });

  it('returns error when fetch fails', async () => {
    mockFetchFailure();

    const result = await uploadWeeklyPhoto('user1', 'file://stale.jpg', '2026-05-04');

    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
    expect((result.error as Error).message).toBe('URI cleared by OS');
  });
});
