import { promises as fs } from 'fs';
import path from 'path';

export async function saveProfilePhoto(file: File, userId: bigint | number) {
  const extension = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeExt = extension || 'jpg';
  const timestamp = Date.now();
  const filename = `user-${String(userId)}-${timestamp}.${safeExt}`;

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
  await fs.mkdir(uploadDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fullPath = path.join(uploadDir, filename);

  await fs.writeFile(fullPath, buffer);

  return `/uploads/profiles/${filename}`;
}
