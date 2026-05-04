/* eslint-disable import/first */
const mockUpload = jest.fn();
const mockGetPublicUrl = jest.fn();

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      })),
    },
  },
}));

// Mock global fetch for blob conversion
const mockFetch = jest.fn();
globalThis.fetch = mockFetch as unknown as typeof fetch;

import { uploadWeeklyPhoto } from '../src/features/weekly-review/upload-weekly-photo';
/* eslint-enable import/first */

describe('uploadWeeklyPhoto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uploads blob and returns public URL on success', async () => {
    const fakeBlob = new Blob(['test']);
    mockFetch.mockResolvedValue({ blob: () => Promise.resolve(fakeBlob) });
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/photo.jpg' } });

    const result = await uploadWeeklyPhoto('user-123', 'file:///photo.jpg', '2026-05-03', 0);

    expect(result).toEqual({ data: 'https://cdn.example.com/photo.jpg', error: null });
    expect(mockUpload).toHaveBeenCalledWith('user-123/2026-05-03-0.jpg', fakeBlob, {
      contentType: 'image/jpeg',
      upsert: true,
    });
  });

  it('returns error when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await uploadWeeklyPhoto('user-123', 'file:///photo.jpg', '2026-05-03', 0);

    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error!.message).toBe('Network error');
  });

  it('returns error when storage upload fails', async () => {
    const fakeBlob = new Blob(['test']);
    mockFetch.mockResolvedValue({ blob: () => Promise.resolve(fakeBlob) });
    mockUpload.mockResolvedValue({ error: new Error('Bucket not found') });

    const result = await uploadWeeklyPhoto('user-123', 'file:///photo.jpg', '2026-05-03', 0);

    expect(result.data).toBeNull();
    expect(result.error!.message).toBe('Bucket not found');
  });

  it('constructs correct storage path with index', async () => {
    const fakeBlob = new Blob(['test']);
    mockFetch.mockResolvedValue({ blob: () => Promise.resolve(fakeBlob) });
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/photo.jpg' } });

    await uploadWeeklyPhoto('user-456', 'file:///img.jpg', '2026-04-27', 3);

    expect(mockUpload).toHaveBeenCalledWith(
      'user-456/2026-04-27-3.jpg',
      expect.any(Blob),
      expect.any(Object),
    );
  });
});
