"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/db/supabase";

// Dynamically import the Leaflet map to avoid SSR issues
// (Leaflet references `window` at import time)
const LocationMap = dynamic(() => import("@/components/LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
      <p className="text-sm text-neutral-400">Loading map...</p>
    </div>
  ),
});

export default function ReportSightingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth state
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Form state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [notes, setNotes] = useState("");

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Auth guard: check login on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);
      setAuthChecked(true);
    });
  }, [router]);

  // Handle photo selection and preview
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    } else {
      setPhotoPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!userId) {
      setError("You must be logged in to submit a sighting.");
      return;
    }
    if (!photoFile) {
      setError("Please select a photo of the person you saw.");
      return;
    }
    if (!mapPosition) {
      setError("Please click on the map to set the sighting location.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload photo to "sighting-photos" bucket
      const timestamp = Date.now();
      const sanitizedName = photoFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${userId}/${timestamp}_${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from("sighting-photos")
        .upload(filePath, photoFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setError("Photo upload failed: " + uploadError.message);
        return;
      }

      // 2. Get the public URL
      const { data: urlData } = supabase.storage
        .from("sighting-photos")
        .getPublicUrl(filePath);

      const photoUrl = urlData.publicUrl;

      // 3. Insert sighting into the database
      const { error: insertError } = await supabase.from("sightings").insert({
        finder_id: userId,
        photo_url: photoUrl,
        location_lat: mapPosition[0],
        location_lng: mapPosition[1],
        notes: notes || null,
      });

      if (insertError) {
        setError("Failed to submit sighting: " + insertError.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Loading state while checking auth
  if (!authChecked) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center">
        <p className="text-neutral-400">Loading...</p>
      </main>
    );
  }

  // Success state
  if (success) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Sighting reported
          </h1>
          <p className="mt-2 text-neutral-600">
            Thanks &mdash; we&apos;re checking this against active cases now.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-700"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900">
          Report a Sighting
        </h1>
        <p className="mt-2 text-neutral-500">
          Upload a photo and mark the location where you saw the person.
          Your report will be checked against active missing-person cases.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo upload */}
        <div>
          <label
            htmlFor="sighting-photo"
            className="block text-sm font-medium text-neutral-700"
          >
            Photo <span className="text-red-500">*</span>
          </label>
          <p className="mt-1 text-xs text-neutral-500">
            A clear photo of the person you believe you saw.
          </p>

          {photoPreview && (
            <div className="mt-3">
              <img
                src={photoPreview}
                alt="Preview"
                className="h-40 w-auto rounded-lg border border-neutral-200 object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="mt-2 text-xs text-neutral-500 hover:text-neutral-700"
              >
                Remove photo
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            id="sighting-photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            required={!photoFile}
            className="mt-3 block w-full text-sm text-neutral-500 file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-neutral-700 hover:file:bg-neutral-200"
          />
        </div>

        {/* Map for location */}
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Sighting location <span className="text-red-500">*</span>
          </label>
          <p className="mt-1 text-xs text-neutral-500">
            Click on the map to drop a pin where you saw the person.
          </p>

          <div className="mt-3">
            <LocationMap
              position={mapPosition}
              onPositionChange={setMapPosition}
            />
          </div>

          {mapPosition && (
            <p className="mt-2 text-xs text-neutral-500">
              Selected: {mapPosition[0].toFixed(5)}, {mapPosition[1].toFixed(5)}{" "}
              <button
                type="button"
                onClick={() => setMapPosition(null)}
                className="ml-1 text-neutral-400 hover:text-neutral-700"
              >
                (clear)
              </button>
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="sighting-notes"
            className="block text-sm font-medium text-neutral-700"
          >
            Notes{" "}
            <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <textarea
            id="sighting-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. wearing a blue jacket, appeared to be heading north, around 3pm..."
            className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !photoFile || !mapPosition}
          className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit sighting"}
        </button>

        {(!photoFile || !mapPosition) && !submitting && (
          <p className="text-center text-xs text-neutral-400">
            {!photoFile && !mapPosition
              ? "Add a photo and select a location to submit."
              : !photoFile
                ? "Add a photo to submit."
                : "Select a location on the map to submit."}
          </p>
        )}
      </form>
    </main>
  );
}
