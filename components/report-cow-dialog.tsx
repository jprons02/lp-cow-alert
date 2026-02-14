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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, Loader2, CheckCircle2, MapPin } from "lucide-react";
import {
  PREDEFINED_LOCATIONS,
  OTHER_LOCATION_ID,
  getLocationById,
} from "@/lib/locations";
import dynamic from "next/dynamic";

const LocationMap = dynamic(
  () => import("@/components/location-map").then((mod) => mod.LocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] w-full bg-muted flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

type FormState = "idle" | "submitting" | "success" | "error";

export function ReportCowDialog({
  onReportSubmitted,
}: {
  onReportSubmitted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [locationId, setLocationId] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedLocation = getLocationById(locationId);
  const isOtherSelected = locationId === OTHER_LOCATION_ID;

  async function handleSubmit() {
    setFormState("submitting");
    setErrorMessage("");

    // Determine final location string
    let finalLocation: string | null = null;
    if (isOtherSelected) {
      finalLocation = customLocation.trim() || null;
    } else if (selectedLocation) {
      finalLocation = selectedLocation.name;
    }

    if (!finalLocation) {
      setErrorMessage("Please select a location");
      setFormState("error");
      return;
    }

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim() || null,
          location: finalLocation,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 409) {
          setErrorMessage(data.error);
          setFormState("error");
          return;
        }
        throw new Error(data.error || "Failed to submit report");
      }

      setFormState("success");

      // Reset and close after a short delay
      setTimeout(() => {
        setOpen(false);
        setDescription("");
        setLocationId("");
        setCustomLocation("");
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
      setLocationId("");
      setCustomLocation("");
      setFormState("idle");
      setErrorMessage("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="w-full text-base gap-2 h-14 rounded-xl cursor-pointer shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:shadow-md transition-all"
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
          <div className="flex flex-col gap-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="flex flex-col gap-2">
              <label htmlFor="location" className="text-sm font-medium">
                Where did you see it?
              </label>
              <Select
                value={locationId}
                onValueChange={setLocationId}
                disabled={formState === "submitting"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_LOCATIONS.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3" />
                        {loc.name}
                      </div>
                    </SelectItem>
                  ))}
                  {/*
                  <SelectItem value={OTHER_LOCATION_ID}>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3" />
                      Other location
                    </div>
                  </SelectItem>
                */}
                </SelectContent>
              </Select>
            </div>

            {/* Show map preview for predefined locations */}
            {selectedLocation && (
              <div className="rounded-lg border overflow-hidden h-[200px] min-h-[200px]">
                <LocationMap key={locationId} location={selectedLocation} />
              </div>
            )}

            {/* Show custom location text input if "Other" is selected */}
            {isOtherSelected && (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="custom-location"
                  className="text-sm font-medium"
                >
                  Enter location
                </label>
                <input
                  id="custom-location"
                  type="text"
                  placeholder="e.g. Near the park entrance on Laureate Blvd"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  disabled={formState === "submitting"}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            )}

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
