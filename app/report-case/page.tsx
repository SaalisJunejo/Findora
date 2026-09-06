"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/db/supabase";

export default function ReportCasePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth state
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [lastSeenLocation, setLastSeenLocation] = useState("");
  const [lastSeenDate, setLastSeenDate] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [contactShareEnabled, setContactShareEnabled] = useState(false);

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
      setError("You must be logged in to submit a case.");
      return;
    }
    if (!photoFile) {
      setError("Please select a photo of the missing person.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload photo to Supabase Storage "case-photos" bucket
      const timestamp = Date.now();
      const sanitizedName = photoFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `${userId}/${timestamp}_${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from("case-photos")
        .upload(filePath, photoFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setError("Photo upload failed: " + uploadError.message);
        return;
      }

      // 2. Get the public URL of the uploaded photo
      const { data: urlData } = supabase.storage
        .from("case-photos")
        .getPublicUrl(filePath);

      const photoUrl = urlData.publicUrl;

      // 3. Insert the case into the database
      const { error: insertError } = await supabase.from("cases").insert({
        reporter_id: userId,
        name,
        age: parseInt(age, 10),
        description,
        last_seen_location: lastSeenLocation,
        last_seen_date: lastSeenDate,
        photo_url: photoUrl,
        contact_share_enabled: contactShareEnabled,
      });

      if (insertError) {
        setError("Failed to create case: " + insertError.message);
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
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Case submitted
          </h1>
          <p className="mt-2 text-neutral-600">
            Your missing person report has been created and is now active in the
            matching system.
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
          Report a Missing Person
        </h1>
        <p className="mt-2 text-neutral-500">
          Fill in the details below. The photo you provide will be used by the
          AI matching engine to compare against sightings.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label
            htmlFor="case-name"
            className="block text-sm font-medium text-neutral-700"
          >
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            id="case-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Jane Doe"
            className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>

        {/* Age */}
        <div>
          <label
            htmlFor="case-age"
            className="block text-sm font-medium text-neutral-700"
          >
            Age <span className="text-red-500">*</span>
          </label>
          <input
            id="case-age"
            type="number"
            min={0}
            max={150}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            placeholder="e.g. 34"
            className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="case-description"
            className="block text-sm font-medium text-neutral-700"
          >
            Physical description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="case-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Height, build, hair color, distinguishing features..."
            className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>

        {/* Last seen location */}
        <div>
          <label
            htmlFor="case-location"
            className="block text-sm font-medium text-neutral-700"
          >
            Last seen location <span className="text-red-500">*</span>
          </label>
          <input
            id="case-location"
            type="text"
            value={lastSeenLocation}
            onChange={(e) => setLastSeenLocation(e.target.value)}
            required
            placeholder="e.g. Central Park, New York"
            className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>

        {/* Last seen date */}
        <div>
          <label
            htmlFor="case-date"
            className="block text-sm font-medium text-neutral-700"
          >
            Last seen date <span className="text-red-500">*</span>
          </label>
          <input
            id="case-date"
            type="date"
            value={lastSeenDate}
            onChange={(e) => setLastSeenDate(e.target.value)}
            required
            max={new Date().toISOString().split("T")[0]}
            className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>

        {/* Photo upload */}
        <div>
          <label
            htmlFor="case-photo"
            className="block text-sm font-medium text-neutral-700"
          >
            Photo <span className="text-red-500">*</span>
          </label>
          <p className="mt-1 text-xs text-neutral-500">
            A clear, front-facing photo works best for matching.
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
            id="case-photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            required={!photoFile}
            className="mt-3 block w-full text-sm text-neutral-500 file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-neutral-700 hover:file:bg-neutral-200"
          />
        </div>

        {/* Contact sharing preference */}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={contactShareEnabled}
              onChange={(e) => setContactShareEnabled(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-500"
            />
            <div>
              <span className="text-sm font-medium text-neutral-900">
                Automatically share my contact info if there&apos;s a strong
                match
              </span>
              <p className="mt-0.5 text-xs text-neutral-500">
                When enabled, a finder who submits a strong-match sighting
                (&ge; 85% confidence) will automatically receive your contact
                details.
              </p>
            </div>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit report"}
        </button>
      </form>
    </main>
  );
}
