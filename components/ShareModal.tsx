"use client";

import {
  captureCardBlob,
  downloadBlob,
  type ShareCardPayload,
} from "@/lib/export-card-image";
import type { PublishedShareUrls } from "@/lib/publish-share-card";
import type { ShareTweetInput } from "@/lib/share-card-text";
import { copyPngToClipboard, copyTextToClipboard } from "@/lib/share-clipboard";
import {
  buildEmailShareUrl,
  buildLinkedInShareUrl,
  buildRedditShareUrl,
  buildShareIdentityText,
  buildWhatsAppShareUrl,
  nativeShare,
  openXShare,
} from "@/lib/share-links";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

export interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  cardRef: RefObject<HTMLDivElement | null>;
  serverPayload: ShareCardPayload;
  name: string;
  username?: string;
  persona: string;
  personaDescription?: string;
  skills: string[];
  appUrl: string;
  shareUrls: PublishedShareUrls | null;
  shareLinkLoading: boolean;
  tweetInput: ShareTweetInput;
}

type ActionId =
  | "copy-identity"
  | "copy-link"
  | "png"
  | "x"
  | "linkedin"
  | "whatsapp"
  | "reddit"
  | "email"
  | "native";

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "dev"
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        d="M10 13a5 5 0 007.07 0l1.41-1.41a5 5 0 00-7.07-7.07L10 5"
      />
      <path
        strokeLinecap="round"
        d="M14 11a5 5 0 00-7.07 0L5.52 12.41a5 5 0 007.07 7.07L14 19"
      />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.127 0 2.061 2.061 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.03 4.87-7.004 4.87-3.974 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}

const ICON_ACCENTS = {
  copy: {
    icon: "bg-fuchsia-500/20 text-fuchsia-300 ring-1 ring-fuchsia-400/30",
    hover: "hover:border-fuchsia-400/35",
  },
  link: {
    icon: "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/30",
    hover: "hover:border-cyan-400/35",
  },
  download: {
    icon: "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30",
    hover: "hover:border-emerald-400/35",
  },
  x: {
    icon: "bg-zinc-100/15 text-zinc-100 ring-1 ring-zinc-300/35",
    hover: "hover:border-zinc-300/40",
  },
  linkedin: {
    icon: "bg-[#0a66c2]/25 text-[#7cb9ff] ring-1 ring-[#0a66c2]/45",
    hover: "hover:border-[#0a66c2]/50",
  },
  whatsapp: {
    icon: "bg-[#25d366]/20 text-[#86efac] ring-1 ring-[#25d366]/40",
    hover: "hover:border-[#25d366]/45",
  },
  reddit: {
    icon: "bg-orange-500/20 text-orange-300 ring-1 ring-orange-400/35",
    hover: "hover:border-orange-400/40",
  },
  email: {
    icon: "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30",
    hover: "hover:border-amber-400/35",
  },
  native: {
    icon: "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/30",
    hover: "hover:border-indigo-400/35",
  },
} as const;

type IconAccent = keyof typeof ICON_ACCENTS;

function ShareActionButton({
  icon,
  label,
  sub,
  accent,
  disabled,
  onClick,
  fullWidth,
}: {
  icon: ReactNode;
  label: string;
  sub: string;
  accent: IconAccent;
  disabled?: boolean;
  onClick: () => void;
  fullWidth?: boolean;
}) {
  const styles = ICON_ACCENTS[accent];
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-left transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-45 ${styles.hover} ${fullWidth ? "w-full" : ""}`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-white">{label}</span>
        <span className="block truncate text-[11px] text-zinc-500">{sub}</span>
      </span>
    </button>
  );
}

export function ShareModal({
  open,
  onClose,
  cardRef,
  serverPayload,
  name,
  username,
  persona,
  personaDescription,
  skills,
  appUrl,
  shareUrls,
  shareLinkLoading,
  tweetInput,
}: ShareModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const xLock = useRef(false);
  const [busy, setBusy] = useState<ActionId | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const pageUrl = shareUrls?.pageUrl ?? "";
  const linkReady = !!pageUrl && !shareLinkLoading;

  const identityInput = useMemo(
    () => ({
      name,
      username,
      persona,
      personaDescription,
      skills,
      appUrl,
      pageUrl: pageUrl || undefined,
    }),
    [name, username, persona, personaDescription, skills, appUrl, pageUrl],
  );

  const identityText = useMemo(
    () => buildShareIdentityText(identityInput),
    [identityInput],
  );

  const previewText = useMemo(() => {
    const oneLine = identityText.replace(/\n+/g, " ").trim();
    return oneLine.length > 220 ? `${oneLine.slice(0, 219)}…` : oneLine;
  }, [identityText]);

  const appHost = useMemo(() => {
    try {
      return new URL(appUrl).host;
    } catch {
      return "dailydevmatch.dev";
    }
  }, [appUrl]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const requireLink = useCallback(() => {
    if (linkReady) return true;
    showToast(
      shareLinkLoading
        ? "Share link is still loading…"
        : "Could not create share link — refresh and try again.",
    );
    return false;
  }, [linkReady, shareLinkLoading, showToast]);

  const handleCopyIdentity = useCallback(async () => {
    setBusy("copy-identity");
    const ok = await copyTextToClipboard(identityText);
    showToast(ok ? "Identity text copied." : "Could not copy text.");
    setBusy(null);
  }, [identityText, showToast]);

  const handleCopyLink = useCallback(async () => {
    if (!requireLink()) return;
    setBusy("copy-link");
    const ok = await copyTextToClipboard(pageUrl);
    showToast(ok ? "Card link copied." : "Could not copy link.");
    setBusy(null);
  }, [pageUrl, requireLink, showToast]);

  const handleDownloadPng = useCallback(async () => {
    const node = cardRef.current;
    if (!node) return;
    setBusy("png");
    try {
      const blob = await captureCardBlob(node, "png", serverPayload, {
        preferClient: true,
      });
      downloadBlob(blob, `tech-identity-${slugify(username ?? name)}.png`);
      showToast("PNG downloaded.");
    } catch {
      showToast("Download failed — try again.");
    } finally {
      setBusy(null);
    }
  }, [cardRef, serverPayload, username, name, showToast]);

  const handleX = useCallback(() => {
    if (!requireLink() || xLock.current) return;
    const node = cardRef.current;
    if (!node) return;

    xLock.current = true;
    setBusy("x");

    const win = openXShare({
      ...tweetInput,
      pageUrl: pageUrl || tweetInput.pageUrl,
    });
    if (!win) {
      showToast("Allow pop-ups to open X.");
      xLock.current = false;
      setBusy(null);
      return;
    }

    void (async () => {
      try {
        const blob = await captureCardBlob(node, "png", serverPayload, {
          preferClient: true,
        });
        const copied = await copyPngToClipboard(blob);
        showToast(
          copied
            ? "X opened — PNG copied. Paste with ⌘V / Ctrl+V."
            : "X opened with your card link.",
        );
      } catch {
        showToast("X opened with your card link.");
      } finally {
        xLock.current = false;
        setBusy(null);
      }
    })();
  }, [requireLink, tweetInput, pageUrl, cardRef, serverPayload, showToast]);

  const handleLinkedIn = useCallback(() => {
    if (!requireLink()) return;
    window.open(
      buildLinkedInShareUrl(pageUrl, identityText),
      "_blank",
      "noopener,noreferrer",
    );
    showToast("LinkedIn share opened with your message.");
  }, [pageUrl, identityText, requireLink, showToast]);

  const handleWhatsApp = useCallback(() => {
    if (!requireLink()) return;
    window.open(
      buildWhatsAppShareUrl(identityText),
      "_blank",
      "noopener,noreferrer",
    );
    showToast("WhatsApp opened.");
  }, [identityText, requireLink, showToast]);

  const handleReddit = useCallback(() => {
    if (!requireLink()) return;
    window.open(
      buildRedditShareUrl(pageUrl, identityText),
      "_blank",
      "noopener,noreferrer",
    );
    showToast("Reddit submit opened with your message.");
  }, [pageUrl, identityText, requireLink, showToast]);

  const handleEmail = useCallback(() => {
    if (!requireLink()) return;
    const subject = `My Tech Identity — ${persona}`;
    window.location.href = buildEmailShareUrl(subject, identityText);
    showToast("Email client opened.");
  }, [persona, identityText, requireLink, showToast]);

  const handleNative = useCallback(async () => {
    if (!requireLink()) return;
    setBusy("native");
    const result = await nativeShare({
      title: `Tech Identity — ${persona}`,
      text: identityText,
      url: pageUrl,
    });
    if (result === "shared") showToast("Shared.");
    else if (result === "unsupported")
      showToast("Native share not supported on this browser.");
    else if (result === "failed")
      showToast("Share failed — try another option.");
    setBusy(null);
  }, [requireLink, persona, identityText, pageUrl, showToast]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-black/75 backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        className="pointer-events-auto relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-violet-500/20 bg-[#0a0a12] shadow-2xl shadow-violet-950/50"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-violet-600/25 to-transparent" />

        <div className="relative border-b border-white/10 px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300/90">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                dailydevmatch.dev
              </p>
              <h2
                id="share-modal-title"
                className="mt-2 text-xl font-bold text-white"
              >
                Share Your Tech Identity
              </h2>
              <p className="mt-0.5 text-sm text-zinc-400">{persona}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative max-h-[min(70vh,520px)] overflow-y-auto px-5 pb-5">
          <div className="rounded-xl border border-white/10 bg-black/40 p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Share preview
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-300">
              {shareLinkLoading ? "Preparing your share link…" : previewText}
            </p>
          </div>

          {toast ? (
            <p className="mt-3 text-center text-xs text-cyan-300/95">{toast}</p>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <ShareActionButton
              accent="copy"
              icon={<CopyIcon className="h-4 w-4" />}
              label="Copy identity"
              sub="Full card text"
              disabled={busy !== null}
              onClick={() => void handleCopyIdentity()}
            />
            <ShareActionButton
              accent="link"
              icon={<LinkIcon className="h-4 w-4" />}
              label="Copy link"
              sub={shareLinkLoading ? "Loading…" : "Card page URL"}
              disabled={busy !== null || !linkReady}
              onClick={() => void handleCopyLink()}
            />
            <ShareActionButton
              accent="download"
              icon={<DownloadIcon className="h-4 w-4" />}
              label="Download PNG"
              sub="High-res card image"
              disabled={busy !== null}
              onClick={() => void handleDownloadPng()}
            />
            <ShareActionButton
              accent="x"
              icon={<XIcon className="h-4 w-4" />}
              label="X / Twitter"
              sub="Post your card"
              disabled={busy !== null || !linkReady}
              onClick={handleX}
            />
            <ShareActionButton
              accent="linkedin"
              icon={<LinkedInIcon className="h-4 w-4" />}
              label="LinkedIn"
              sub="Share professionally"
              disabled={busy !== null || !linkReady}
              onClick={handleLinkedIn}
            />
            <ShareActionButton
              accent="whatsapp"
              icon={<WhatsAppIcon className="h-4 w-4" />}
              label="WhatsApp"
              sub="Send to contacts"
              disabled={busy !== null || !linkReady}
              onClick={handleWhatsApp}
            />
            <ShareActionButton
              accent="reddit"
              icon={<RedditIcon className="h-4 w-4" />}
              label="Reddit"
              sub="Share on Reddit"
              disabled={busy !== null || !linkReady}
              onClick={handleReddit}
            />
            <ShareActionButton
              accent="email"
              icon={<EmailIcon className="h-4 w-4" />}
              label="Email"
              sub="Send by email"
              disabled={busy !== null || !linkReady}
              onClick={handleEmail}
            />
          </div>

          <div className="mt-2">
            <ShareActionButton
              accent="native"
              fullWidth
              icon={<ShareIcon className="h-4 w-4" />}
              label={busy === "native" ? "Opening…" : "Native share"}
              sub="Use system share sheet"
              disabled={busy !== null || !linkReady}
              onClick={() => void handleNative()}
            />
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            <span className="text-violet-500/80">●</span> dailydevmatch.dev{" "}
            <span className="text-cyan-500/80">●</span> {appHost}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
