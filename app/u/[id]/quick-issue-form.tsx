"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickIssueFormProps {
  unitId: string;
  buildingName: string;
  unitIdentifier: string;
}

const issueTypes = [
  { id: "stuck", label: "Elevator stuck", emoji: "🚫" },
  { id: "noise", label: "Strange noise", emoji: "🔊" },
  { id: "door", label: "Door issue", emoji: "🚪" },
  { id: "button", label: "Button not working", emoji: "🔘" },
  { id: "light", label: "Light out", emoji: "💡" },
  { id: "other", label: "Other issue", emoji: "❓" },
];

export function QuickIssueForm({ unitId, buildingName, unitIdentifier }: QuickIssueFormProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedType) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/public/report-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          issueType: selectedType,
          description,
          contactInfo,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError("Failed to submit. Please try again or call the building.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-1">Report Submitted!</h3>
        <p className="text-sm text-slate-600">
          Thank you for reporting this issue. The service team has been notified.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Issue Type Selection */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          What&apos;s the issue?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {issueTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setSelectedType(type.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedType === type.id
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span className="text-lg mr-2">{type.emoji}</span>
              <span className="text-sm text-slate-700">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description (optional) */}
      <div>
        <label htmlFor="description" className="text-sm font-medium text-slate-700 mb-1 block">
          Details (optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Any additional details about the issue..."
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      </div>

      {/* Contact Info (optional) */}
      <div>
        <label htmlFor="contact" className="text-sm font-medium text-slate-700 mb-1 block">
          Your phone or email (optional)
        </label>
        <input
          id="contact"
          type="text"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          placeholder="For follow-up questions"
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!selectedType || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit Report
          </>
        )}
      </Button>

      <p className="text-xs text-slate-500 text-center">
        For emergencies, please call building security directly.
      </p>
    </form>
  );
}
