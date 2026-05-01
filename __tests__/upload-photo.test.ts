/* eslint-disable import/first */
// jest.mock must appear before imports so Jest can hoist it correctly.
jest.mock('../src/lib/supabase', () => {
  const mockUpload = jest.fn();
  const mockGetPublicUrl = jest
    .fn()
    .mockReturnValue({ data: { publicUrl: 'https://example.com/photo.jpg' } });
  const mockSingle = jest.fn();
  return {
    supabase: {
      storage: {
        from: jest.fn().mockReturnValue({ upload: mockUpload, getPublicUrl: mockGetPublicUrl }),
      },
      from: jest.fn().mockReturnValue({
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({ single: mockSingle }),
        }),
      }),
    },
    __mockUpload: mockUpload,
    __mockSingle: mockSingle,
  };
});

import { uploadMirrorPhoto } from '../src/features/mirror/upload-photo';
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
  const mod = require('../src/lib/supabase') as { __mockUpload: jest.Mock; __mockSingle: jest.Mock };
  return {
    upload: mod.__mockUpload,
    single: mod.__mockSingle,
  };
}

describe('uploadMirrorPhoto', () => {
  beforeEach(() => {
    const m = getMocks();
    m.upload.mockReset();
    m.single.mockReset();
  });

  it('returns { data: null, error } when storage upload fails', async () => {
    mockFetchSuccess();
    const { upload } = getMocks();
    const uploadErr = new Error('Storage quota exceeded');
    upload.mockResolvedValue({ error: uploadErr });

    const result = await uploadMirrorPhoto('user1', 'file://test.jpg', '2026-05-01', 1);

    expect(result.data).toBeNull();
    expect(result.error).toBe(uploadErr);
  });

  it('returns { data: null, error } when DB upsert fails', async () => {
    mockFetchSuccess();
    const { upload, single } = getMocks();
    upload.mockResolvedValue({ error: null });
    const dbErr = new Error('Unique constraint violation');
    single.mockResolvedValue({ data: null, error: dbErr });

    const result = await uploadMirrorPhoto('user1', 'file://test.jpg', '2026-05-01', 1);

    expect(result.data).toBeNull();
    expect(result.error).toBe(dbErr);
  });

  it('returns { data: null, error } when fetch fails', async () => {
    mockFetchFailure();

    const result = await uploadMirrorPhoto('user1', 'file://stale.jpg', '2026-05-01', 1);

    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
    expect((result.error as Error).message).toBe('Failed to read image file');
  });

  it('returns photo data on success', async () => {
    mockFetchSuccess();
    const { upload, single } = getMocks();
    const photo = {
      id: 'p1',
      user_id: 'user1',
      date: '2026-05-01',
      day_number: 1,
      photo_url: 'https://example.com/photo.jpg',
    };
    upload.mockResolvedValue({ error: null });
    single.mockResolvedValue({ data: photo, error: null });

    const result = await uploadMirrorPhoto('user1', 'file://test.jpg', '2026-05-01', 1);

    expect(result.data).toEqual(photo);
    expect(result.error).toBeNull();
  });
});
