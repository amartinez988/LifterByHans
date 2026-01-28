"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { attachExistingContactAction } from "./actions";

type ContactOption = {
  id: string;
  firstName: string;
  lastName: string;
};

type AddExistingContactFormProps = {
  companyId: string;
  contacts: ContactOption[];
};

export default function AddExistingContactForm({
  companyId,
  contacts
}: AddExistingContactFormProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await attachExistingContactAction(companyId, selectedId);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSelectedId("");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex-1 space-y-2">
        <label htmlFor="existingContactId" className="text-sm font-medium text-ink">
          Select contact
        </label>
        <select
          id="existingContactId"
          name="contactId"
          className="flex h-10 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          <option value="">Choose contact</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.firstName} {contact.lastName}
            </option>
          ))}
        </select>
      </div>
      <Button type="button" size="sm" disabled={!selectedId || isPending} onClick={handleSubmit}>
        {isPending ? "Adding..." : "Add contact"}
      </Button>
      {error ? <p className="text-sm text-ember">{error}</p> : null}
    </div>
  );
}
