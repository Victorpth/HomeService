import "server-only";

import { ownsStoragePath, storagePublicUrl } from "@/lib/cook-application";
import { imageKind, type ImageExtension } from "@/lib/validation";

export async function isStoredImage(
  bucket: "cook-photos" | "dish-photos",
  path: string,
  userId: string,
) {
  const extension = pathExtension(path);
  const url = storagePublicUrl(bucket, path);

  if (!extension || !url || !ownsStoragePath(path, userId)) {
    return false;
  }

  const response = await fetch(url, {
    headers: { Range: "bytes=0-15" },
    cache: "no-store",
  });

  if (!response.ok) {
    return false;
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  return imageKind(bytes) === extension;
}

function pathExtension(path: string): ImageExtension | null {
  if (path.endsWith(".jpg")) {
    return "jpg";
  }

  if (path.endsWith(".png")) {
    return "png";
  }

  if (path.endsWith(".webp")) {
    return "webp";
  }

  return null;
}
