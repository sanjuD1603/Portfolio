"use client";

import { Check, Copy, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { profile } from "@/lib/data";

const EMAIL = profile.email;

export default function ContactPopup() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Contact me</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Get in touch</DialogTitle>
          <DialogDescription>
            Send me an email and I&apos;ll get back to you.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
          <span className="truncate">{EMAIL}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={copy}
            aria-label="Copy email"
          >
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>
        {/* biome-ignore lint/a11y/useAnchorContent: content is supplied via Button's children through the render prop */}
        <Button render={<a href={`mailto:${EMAIL}`} />} nativeButton={false}>
          <Mail />
          Open in mail app
        </Button>
      </DialogContent>
    </Dialog>
  );
}
