import html2canvas from "html2canvas";
import { toJpeg, toPng } from "html-to-image";

export interface DnaEntry {
  label: string;
  value: number;
}

export interface TopMatchEntry {
  name: string;
  username: string;
  matchScore: number;
  matchReason: string;
}

export interface ShareCardPayload {
  name: string;
  username?: string;
  avatar?: string | null;
  persona: string;
  personaDescription?: string;
  skills: string[];
  techDna?: DnaEntry[];
  tags?: string[];
  topMatch?: TopMatchEntry;
}

/** Generate card image on the server (fallback). */
export async function fetchServerCardBlob(
  payload: ShareCardPayload,
  format: "png" | "jpeg" = "png",
): Promise<Blob> {
  const res = await fetch("/api/share-card-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Server render failed (${res.status})`);
  }

  const pngBlob = await res.blob();

  if (format === "png") return pngBlob;

  return pngBlobToJpeg(pngBlob);
}

async function pngBlobToJpeg(pngBlob: Blob): Promise<Blob> {
  const dataUrl = await blobToDataUrl(pngBlob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas unavailable"));
        return;
      }
      ctx.fillStyle = "#06060b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("JPEG conversion failed"))),
        "image/jpeg",
        0.92,
      );
    };
    img.onerror = () => reject(new Error("JPEG conversion failed"));
    img.src = dataUrl;
  });
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function urlToDataUrl(url: string): Promise<string> {
  if (url.startsWith("data:")) return url;
  const proxy = `/api/image-proxy?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxy);
  if (!res.ok) throw new Error(`Proxy failed: ${res.status}`);
  return blobToDataUrl(await res.blob());
}

async function embedImagesInPlace(root: HTMLElement): Promise<() => void> {
  const backups: { img: HTMLImageElement; src: string }[] = [];

  await Promise.all(
    Array.from(root.querySelectorAll("img")).map(async (img) => {
      const src = img.currentSrc || img.src;
      if (!src || src.startsWith("data:")) return;
      backups.push({ img, src });
      try {
        img.src = await urlToDataUrl(src);
        await img.decode().catch(() => undefined);
      } catch {
        backups.pop();
      }
    }),
  );

  return () => backups.forEach(({ img, src }) => { img.src = src; });
}

async function captureWithHtml2Canvas(
  node: HTMLElement,
  format: "png" | "jpeg",
): Promise<Blob> {
  const canvas = await html2canvas(node, {
    backgroundColor: "#06060b",
    scale: 2,
    logging: false,
    useCORS: true,
    allowTaint: false,
    onclone: (clonedDoc) => {
      clonedDoc.querySelectorAll("[data-export-hide]").forEach((el) => {
        if (el instanceof HTMLElement) el.style.display = "none";
      });
      clonedDoc.querySelectorAll("*").forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.filter = "none";
          el.style.backdropFilter = "none";
        }
      });
    },
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error(`${format.toUpperCase()} export failed`)),
      format === "png" ? "image/png" : "image/jpeg",
      format === "jpeg" ? 0.92 : undefined,
    );
  });
}

async function captureWithHtmlToImage(
  node: HTMLElement,
  format: "png" | "jpeg",
): Promise<Blob> {
  const options = {
    width: node.offsetWidth,
    height: node.offsetHeight,
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#06060b",
  };

  const dataUrl =
    format === "png"
      ? await toPng(node, options)
      : await toJpeg(node, { ...options, quality: 0.92 });

  return fetch(dataUrl).then((r) => r.blob());
}

/** Client DOM capture — matches on-screen card with full details. */
async function captureClientCardBlob(
  node: HTMLElement,
  format: "png" | "jpeg",
): Promise<Blob> {
  const width = node.offsetWidth;
  const height = node.offsetHeight;
  if (width < 10 || height < 10) {
    throw new Error("Card not visible");
  }

  const restoreImages = await embedImagesInPlace(node);
  node.querySelectorAll("[data-export-hide]").forEach((el) => {
    if (el instanceof HTMLElement) el.style.display = "none";
  });

  await new Promise((r) => setTimeout(r, 150));

  try {
    try {
      return await captureWithHtml2Canvas(node, format);
    } catch {
      return await captureWithHtmlToImage(node, format);
    }
  } finally {
    restoreImages();
    node.querySelectorAll("[data-export-hide]").forEach((el) => {
      if (el instanceof HTMLElement) el.style.display = "";
    });
  }
}

export async function captureCardBlob(
  node: HTMLElement,
  format: "png" | "jpeg",
  serverPayload?: ShareCardPayload,
  options?: { preferClient?: boolean },
): Promise<Blob> {
  if (options?.preferClient) {
    try {
      return await captureClientCardBlob(node, format);
    } catch (clientErr) {
      console.warn("[export] client capture failed, trying server:", clientErr);
      if (serverPayload) {
        return fetchServerCardBlob(serverPayload, format);
      }
      throw clientErr;
    }
  }

  if (serverPayload) {
    try {
      return await fetchServerCardBlob(serverPayload, format);
    } catch (serverErr) {
      console.warn("[export] server render failed, trying client:", serverErr);
    }
  }

  return captureClientCardBlob(node, format);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
