"use client";

import { useState, useRef } from "react";
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
import {
  Megaphone,
  Loader2,
  CheckCircle2,
  MapPin,
  Camera,
  X,
  AlertCircle,
} from "lucide-react";
import {
  PREDEFINED_LOCATIONS,
  OTHER_LOCATION_ID,
  getLocationById,
  findClosestLocation,
  getDistancesToLocations,
} from "@/lib/locations";
import { compressImage } from "@/lib/image-utils";
import { getDistanceMiles, MAX_DISTANCE_MILES } from "@/lib/geolocation";
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

  // Photo states
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [cowDetected, setCowDetected] = useState<boolean | null>(null);
  const [verifyingPhoto, setVerifyingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GPS states
  const [gpsLocation, setGpsLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [suggestedLocationId, setSuggestedLocationId] = useState<string | null>(
    null,
  );
  const [locationDistances, setLocationDistances] = useState<Map<
    string,
    number
  > | null>(null);

  const selectedLocation = getLocationById(locationId);
  const isOtherSelected = locationId === OTHER_LOCATION_ID;

  const canSubmit =
    formState !== "submitting" &&
    locationId !== "" &&
    photoBase64 !== null &&
    cowDetected === true &&
    gpsLocation !== null &&
    !verifyingPhoto;

  // ─── GPS ──────────────────────────────────────────────

  function requestGpsLocation() {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setGpsLocation(coords);
        setGpsLoading(false);

        // Find and suggest the closest location
        const closest = findClosestLocation(coords.lat, coords.lng);
        if (closest) {
          setSuggestedLocationId(closest.location.id);
          // Auto-select if user hasn't picked one yet
          if (!locationId) {
            setLocationId(closest.location.id);
          }
        }

        // Calculate distances to all locations for display
        setLocationDistances(getDistancesToLocations(coords.lat, coords.lng));
      },
      () => {
        setGpsError(
          "Unable to get your location. Please enable location services and try again.",
        );
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  }

  // ─── Photo ────────────────────────────────────────────

  async function handlePhotoCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    setCowDetected(null);
    setVerifyingPhoto(true);

    try {
      const compressed = await compressImage(file, 800, 0.7);
      setPhotoBase64(compressed);

      // Verify with cow detection API
      const res = await fetch("/api/reports/verify-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: compressed }),
      });

      if (!res.ok) throw new Error("Failed to verify photo");

      const result = await res.json();
      setCowDetected(result.isCow);

      if (!result.isCow) {
        setPhotoError(
          "We couldn't detect a cow in this photo. Please try a clearer photo.",
        );
      }
    } catch {
      setPhotoError("Failed to verify photo. Please try again.");
      setCowDetected(null);
    } finally {
      setVerifyingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleRemovePhoto() {
    setPhotoBase64(null);
    setCowDetected(null);
    setPhotoError(null);
    setVerifyingPhoto(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ─── Fingerprint ──────────────────────────────────────

  async function getFingerprint(): Promise<string> {
    const FingerprintJS = (await import("@fingerprintjs/fingerprintjs"))
      .default;
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
  }

  // ─── Submit ───────────────────────────────────────────

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

    if (!photoBase64 || !cowDetected) {
      setErrorMessage("Please take a photo that clearly shows a cow");
      setFormState("error");
      return;
    }

    if (!gpsLocation) {
      setErrorMessage(
        "Location access is required. Please enable location services.",
      );
      setFormState("error");
      return;
    }

    // Client-side GPS proximity check
    if (selectedLocation) {
      const distance = getDistanceMiles(
        gpsLocation.lat,
        gpsLocation.lng,
        selectedLocation.lat,
        selectedLocation.lng,
      );
      if (distance > MAX_DISTANCE_MILES) {
        setErrorMessage(
          `You appear to be ${distance.toFixed(1)} miles from ${selectedLocation.name}. You must be within ${MAX_DISTANCE_MILES} mile to submit a report.`,
        );
        setFormState("error");
        return;
      }
    }

    try {
      // Quick client-side localStorage rate-limit check
      const lastReport = localStorage.getItem("cow_alert_last_report");
      if (lastReport) {
        const lastDate = new Date(lastReport).toDateString();
        const today = new Date().toDateString();
        if (lastDate === today) {
          setErrorMessage(
            "You have already submitted a report today. Please try again tomorrow.",
          );
          setFormState("error");
          return;
        }
      }

      // Get device fingerprint
      const fingerprint = await getFingerprint();

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim() || null,
          location: finalLocation,
          photo: photoBase64,
          fingerprint,
          reporterLat: gpsLocation.lat,
          reporterLng: gpsLocation.lng,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 429 || res.status === 409) {
          setErrorMessage(data.error);
          setFormState("error");
          return;
        }
        throw new Error(data.error || "Failed to submit report");
      }

      // Mark in localStorage
      localStorage.setItem("cow_alert_last_report", new Date().toISOString());

      setFormState("success");

      setTimeout(() => {
        setOpen(false);
        resetForm();
        onReportSubmitted?.();
      }, 1500);
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong",
      );
    }
  }

  // ─── Helpers ──────────────────────────────────────────

  function resetForm() {
    setDescription("");
    setLocationId("");
    setCustomLocation("");
    setFormState("idle");
    setErrorMessage("");
    setPhotoBase64(null);
    setCowDetected(null);
    setPhotoError(null);
    setVerifyingPhoto(false);
    setGpsLocation(null);
    setGpsError(null);
    setGpsLoading(false);
    setSuggestedLocationId(null);
    setLocationDistances(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && formState === "submitting") return;
    setOpen(nextOpen);
    if (nextOpen) {
      requestGpsLocation();
    }
    if (!nextOpen) {
      resetForm();
    }
  }

  // ─── Render ───────────────────────────────────────────

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

      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Report a Loose Cow</DialogTitle>
          <DialogDescription>
            Take a photo of the cow and select the location. No account needed.
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
          <div className="flex flex-col gap-4 py-2 min-w-0 overflow-hidden">
            {/* ── GPS status ── */}
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
              {gpsLoading ? (
                <>
                  <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Getting your location…
                  </span>
                </>
              ) : gpsLocation ? (
                <>
                  <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                  <span className="text-green-700 dark:text-green-400">
                    Location confirmed
                  </span>
                </>
              ) : gpsError ? (
                <div className="flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 text-destructive mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="text-destructive text-xs">{gpsError}</span>
                    <button
                      type="button"
                      onClick={requestGpsLocation}
                      className="text-xs text-primary underline text-left cursor-pointer"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* ── Photo capture ── */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Photo of the cow <span className="text-destructive">*</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoCapture}
                disabled={formState === "submitting"}
              />

              {!photoBase64 ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={formState === "submitting"}
                >
                  <Camera className="size-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Tap to take a photo
                  </span>
                </button>
              ) : (
                <div className="relative rounded-lg overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoBase64}
                    alt="Captured photo"
                    className="w-full h-48 object-cover"
                  />

                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors cursor-pointer"
                    disabled={formState === "submitting"}
                  >
                    <X className="size-4" />
                  </button>

                  {/* Detection status overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/70 to-transparent">
                    {verifyingPhoto ? (
                      <div className="flex items-center gap-2 text-white text-sm">
                        <Loader2 className="size-4 animate-spin" />
                        Analyzing photo…
                      </div>
                    ) : cowDetected === true ? (
                      <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                        <CheckCircle2 className="size-4" />
                        Cow detected!
                      </div>
                    ) : cowDetected === false ? (
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="size-4" />
                        No cow detected
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {photoError && (
                <p className="text-xs text-destructive">{photoError}</p>
              )}
            </div>

            {/* ── Location selection ── */}
            <div className="flex flex-col gap-2">
              <label htmlFor="location" className="text-sm font-medium">
                Where did you see it?{" "}
                <span className="text-destructive">*</span>
              </label>
              <Select
                value={locationId}
                onValueChange={setLocationId}
                disabled={formState === "submitting"}
              >
                <SelectTrigger className="min-w-0">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_LOCATIONS.map((loc) => {
                    const dist = locationDistances?.get(loc.id);
                    const isSuggested = loc.id === suggestedLocationId;
                    return (
                      <SelectItem key={loc.id} value={loc.id}>
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="size-3 shrink-0" />
                          <span className="truncate">{loc.name}</span>
                          {dist != null && (
                            <span
                              className={`text-xs shrink-0 ${
                                isSuggested
                                  ? "text-green-600 dark:text-green-400 font-medium"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {dist < 0.1
                                ? "< 0.1 mi"
                                : `${dist.toFixed(1)} mi`}
                              {isSuggested && " · Nearest"}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Map preview for predefined locations */}
            {selectedLocation && (
              <div className="rounded-lg border overflow-hidden h-[200px] min-h-[200px]">
                <LocationMap key={locationId} location={selectedLocation} />
              </div>
            )}

            {/* Custom location input */}
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

            {/* Description */}
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
                disabled={!canSubmit}
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
