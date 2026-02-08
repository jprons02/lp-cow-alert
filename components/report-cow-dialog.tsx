"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, Loader2, CheckCircle2 } from "lucide-react";

type FormState = "idle" | "submitting" | "success" | "error";

export function ReportCowDialog({
  onReportSubmitted,
}: {
  onReportSubmitted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    setFormState("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim() || null,
          location: location.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit report");
      }

      setFormState("success");

      // Reset and close after a short delay
      setTimeout(() => {
        setOpen(false);
        setDescription("");
        setLocation("");
        setFormState("idle");
        onReportSubmitted?.();
      }, 1500);
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong",
      );
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && formState === "submitting") return; // don't close while submitting
    setOpen(nextOpen);
    if (!nextOpen) {
      // Reset when closing
      setDescription("");
      setLocation("");
      setFormState("idle");
      setErrorMessage("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="w-full text-base gap-2 h-14 rounded-xl cursor-pointer"
        >
          <Megaphone className="size-5" />
          Report a Loose Cow
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report a Loose Cow</DialogTitle>
          <DialogDescription>
            Let the ranger know there&apos;s a cow on the loose. No account
            needed.
          </DialogDescription>
        </DialogHeader>

        {formState === "success" ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="size-12 text-green-500" />
            <p className="text-lg font-medium">Report submitted!</p>
            <p className="text-sm text-muted-foreground">
              The ranger has been notified.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="location" className="text-sm font-medium">
                Where did you see it?
              </label>
              <input
                id="location"
                type="text"
                placeholder="e.g. Near the park entrance on Laureate Blvd"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={formState === "submitting"}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Any other details?{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <Textarea
                id="description"
                placeholder="e.g. Two cows near the sidewalk, one brown, one black"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={formState === "submitting"}
                rows={3}
              />
            </div>

            {formState === "error" && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}

            <DialogFooter className="flex flex-col gap-2 sm:flex-row">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  disabled={formState === "submitting"}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleSubmit}
                disabled={formState === "submitting"}
                className="gap-2 cursor-pointer"
              >
                {formState === "submitting" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
