"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  MoreVertical, 
  Shield, 
  ShieldOff, 
  Clock, 
  Users, 
  Building2,
  Loader2 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { setTesterStatusAction, extendTrialAction, createSubscriptionAction } from "./actions";

type Company = {
  id: string;
  name: string;
  createdAt: Date;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  subscription: {
    id: string;
    status: string;
    plan: string;
    isTester: boolean;
    trialEndsAt: Date | null;
    trialExtendedDays: number | null;
  } | null;
  _count: {
    members: number;
    units: number;
  };
};

type Props = {
  companies: Company[];
};

export function CompanyList({ companies }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [extendDays, setExtendDays] = useState("14");
  const [showExtendDialog, setShowExtendDialog] = useState(false);

  const handleToggleTester = (company: Company) => {
    const newStatus = !company.subscription?.isTester;
    startTransition(async () => {
      await setTesterStatusAction(company.id, newStatus);
      router.refresh();
    });
  };

  const handleExtendTrial = () => {
    if (!selectedCompany) return;
    
    startTransition(async () => {
      await extendTrialAction(selectedCompany.id, parseInt(extendDays));
      setShowExtendDialog(false);
      setSelectedCompany(null);
      router.refresh();
    });
  };

  const handleCreateSubscription = (companyId: string) => {
    startTransition(async () => {
      await createSubscriptionAction(companyId);
      router.refresh();
    });
  };

  const getStatusBadge = (subscription: Company["subscription"]) => {
    if (!subscription) {
      return <span className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded-full">No Sub</span>;
    }
    if (subscription.isTester) {
      return <span className="px-2 py-1 text-xs bg-accent-100 text-accent-700 rounded-full">Tester</span>;
    }
    switch (subscription.status) {
      case "TRIALING":
        return <span className="px-2 py-1 text-xs bg-warning-100 text-warning-700 rounded-full">Trial</span>;
      case "ACTIVE":
        return <span className="px-2 py-1 text-xs bg-success-100 text-success-700 rounded-full">Active</span>;
      case "PAST_DUE":
        return <span className="px-2 py-1 text-xs bg-danger-100 text-danger-700 rounded-full">Past Due</span>;
      case "CANCELED":
        return <span className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded-full">Canceled</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded-full">{subscription.status}</span>;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  return (
    <>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Trial Ends</th>
              <th className="px-4 py-3 text-center">
                <Users className="h-4 w-4 inline" />
              </th>
              <th className="px-4 py-3 text-center">
                <Building2 className="h-4 w-4 inline" />
              </th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="border-b hover:bg-muted/50">
                <td className="px-4 py-3 font-medium">{company.name}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{company.owner.name}</p>
                    <p className="text-xs text-muted-foreground">{company.owner.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">{getStatusBadge(company.subscription)}</td>
                <td className="px-4 py-3">{company.subscription?.plan || "-"}</td>
                <td className="px-4 py-3">
                  {company.subscription?.trialEndsAt ? (
                    <div>
                      <p>{formatDate(company.subscription.trialEndsAt)}</p>
                      {company.subscription.trialExtendedDays && (
                        <p className="text-xs text-muted-foreground">
                          +{company.subscription.trialExtendedDays} days extended
                        </p>
                      )}
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3 text-center">{company._count.members}</td>
                <td className="px-4 py-3 text-center">{company._count.units}</td>
                <td className="px-4 py-3">{formatDate(company.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={isPending}>
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!company.subscription && (
                        <DropdownMenuItem onClick={() => handleCreateSubscription(company.id)}>
                          <Clock className="mr-2 h-4 w-4" />
                          Create Trial Subscription
                        </DropdownMenuItem>
                      )}
                      {company.subscription && (
                        <>
                          <DropdownMenuItem onClick={() => handleToggleTester(company)}>
                            {company.subscription.isTester ? (
                              <>
                                <ShieldOff className="mr-2 h-4 w-4" />
                                Remove Tester Status
                              </>
                            ) : (
                              <>
                                <Shield className="mr-2 h-4 w-4" />
                                Make Tester (Free Access)
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCompany(company);
                              setShowExtendDialog(true);
                            }}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Extend Trial
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Extend Trial Dialog */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Trial</DialogTitle>
            <DialogDescription>
              Extend the trial period for {selectedCompany?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="days">Additional days</Label>
            <Input
              id="days"
              type="number"
              value={extendDays}
              onChange={(e) => setExtendDays(e.target.value)}
              min="1"
              max="365"
              className="mt-2"
            />
            {selectedCompany?.subscription?.trialEndsAt && (
              <p className="text-sm text-muted-foreground mt-2">
                Current trial ends: {formatDate(selectedCompany.subscription.trialEndsAt)}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExtendTrial} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Extend Trial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
