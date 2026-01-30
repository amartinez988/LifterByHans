"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ExternalLink, 
  Copy, 
  Link2, 
  Mail, 
  User, 
  Calendar,
  Trash2,
  Plus,
  Check,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { generatePortalLink, revokePortalAccess } from "./portal-actions";

interface PortalAccess {
  id: string;
  token: string;
  contactEmail: string;
  contactName: string;
  expiresAt: Date;
  lastAccessedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}

interface PortalManagerProps {
  managementCompanyId: string;
  managementCompanyName: string;
  portalAccesses: PortalAccess[];
}

export function PortalManager({ 
  managementCompanyId, 
  managementCompanyName,
  portalAccesses 
}: PortalManagerProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [daysValid, setDaysValid] = useState(30);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    const result = await generatePortalLink(
      managementCompanyId,
      email,
      name,
      daysValid
    );

    if (result.error) {
      setError(result.error);
      setIsCreating(false);
      return;
    }

    setGeneratedUrl(result.portalUrl!);
    setIsCreating(false);
    router.refresh();
  };

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this portal access?")) {
      return;
    }

    const result = await revokePortalAccess(id);
    if (result.error) {
      alert(result.error);
      return;
    }
    router.refresh();
  };

  const activeAccesses = portalAccesses.filter(p => p.isActive && new Date(p.expiresAt) > new Date());

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
              <Link2 className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Customer Portal</h3>
              <p className="text-sm text-slate-500">
                Share a portal link with building managers
              </p>
            </div>
          </div>
          {!showForm && (
            <Button 
              size="sm" 
              onClick={() => setShowForm(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Generate Link
            </Button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Generation Form */}
        {showForm && (
          <div className="mb-6 rounded-xl border border-brand-100 bg-brand-50/50 p-4">
            {generatedUrl ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-success-600">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Portal link generated!</span>
                </div>
                <p className="text-sm text-slate-600">
                  An email has been sent to {email}. You can also share this link directly:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedUrl}
                    readOnly
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(generatedUrl)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(generatedUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setGeneratedUrl(null);
                    setEmail("");
                    setName("");
                  }}
                >
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleGenerate} className="space-y-4">
                <h4 className="font-medium text-slate-900">Generate New Portal Link</h4>
                
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-700">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Contact Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Smith"
                        required
                        className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                        className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Link Valid For
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={daysValid}
                      onChange={(e) => setDaysValid(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value={7}>7 days</option>
                      <option value={30}>30 days</option>
                      <option value={90}>90 days</option>
                      <option value={365}>1 year</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isCreating}
                  >
                    {isCreating ? "Generating..." : "Generate & Send"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Active Portal Links */}
        {activeAccesses.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-700">Active Portal Links</h4>
            {activeAccesses.map((access) => (
              <div
                key={access.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                    <User className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{access.contactName}</p>
                    <p className="text-sm text-slate-500">{access.contactEmail}</p>
                    <p className="text-xs text-slate-400">
                      Expires {new Date(access.expiresAt).toLocaleDateString()}
                      {access.lastAccessedAt && ` • Last accessed ${new Date(access.lastAccessedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(`${window.location.origin}/portal/${access.token}`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/portal/${access.token}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger-600 hover:bg-danger-50 hover:text-danger-700"
                    onClick={() => handleRevoke(access.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : !showForm && (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Link2 className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-slate-600">No active portal links</p>
            <p className="text-sm text-slate-500">
              Generate a portal link to share with building managers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
