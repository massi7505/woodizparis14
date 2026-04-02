import { put, del } from '@vercel/blob';

export async function uploadToBlob(
  file: File,
  folder: string = 'uploads'
): Promise<string> {
  const filename = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const blob = await put(filename, file, {
    access: 'public',
  });
  return blob.url;
}

export async function deleteFromBlob(url: string): Promise<void> {
  try {
    await del(url);
  } catch {
    console.error('Failed to delete blob:', url);
  }
}

export function isVercelBlob(url: string): boolean {
  return url.includes('vercel-storage.com') || url.includes('blob.vercel-storage.com');
}
