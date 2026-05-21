/** Copy PNG to clipboard (Chrome needs Promise resolver for image blobs). */
export async function copyPngToClipboard(blob: Blob): Promise<boolean> {
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    return false;
  }

  try {
    const item = new ClipboardItem({
      "image/png":
        blob.type === "image/png"
          ? blob
          : new Promise<Blob>((resolve, reject) => {
              if (blob.type === "image/png") resolve(blob);
              else reject(new Error("Not a PNG blob"));
            }),
    });
    await navigator.clipboard.write([item]);
    return true;
  } catch {
    return false;
  }
}
