import React, { useState } from 'react'
import { Fingerprint, ChevronLeft, Database, QrCode, RefreshCw, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Hero from "./Hero";
import ActionTile from "./ActionTile";
import { useNavigate } from 'react-router-dom';

export default function HomeScreen({
  role,
  roleName,
  RoleIcon,
  onBack,
}) {

  const navigate = useNavigate();
  const [showChangeRoleDialog, setShowChangeRoleDialog] = useState(false);

  const handleChangeRole = () => {
    setShowChangeRoleDialog(true);
  };

  const confirmChangeRole = () => {
    // Clear all localStorage data
    localStorage.clear();
    
    // Close dialog
    setShowChangeRoleDialog(false);
    
    // Navigate to role selection
    navigate('/user/select-role');
  };

  const cancelChangeRole = () => {
    setShowChangeRoleDialog(false);
  };

  return (
    <div className="mx-auto grid min-h-dvh max-w-5xl grid-rows-[auto_1fr_auto]">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3 md:px-6">
          

          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-full bg-black text-white">
              <Fingerprint className="h-4 w-4" />
            </div>
            <div className="text-base font-semibold">CredifyU</div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Change Role Button */}
            <Badge
              variant="outline"
              size="sm"
              onClick={handleChangeRole}
              className="flex items-center gap-1.5 rounded-full border border-black bg-white text-black cursor-pointer"
            >
              <RefreshCw className="h-0.5 w-0.5" />
              <span className="text-xs font-medium">Change Role</span>
            </Badge>

            <Badge
              variant="secondary"
              className="flex items-center gap-1.5 rounded-full border border-black bg-white text-black"
              aria-label={`Current role: ${roleName}`}
            >
              <RoleIcon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{roleName}</span>
            </Badge>
          </div>
        </div>
      </header>

      <section className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-4xl">
          <Hero roleName={roleName} />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ActionTile
              title="Your Data"
              description="View and manage your identity documents"
              icon={Database}
              onClick={() => {
                navigate("/student/saved-info");
              }}
            />
            
            <ActionTile
              title="Scan QR"
              description="Share or verify identity via QR"
              icon={QrCode}
              onClick={() => {
                navigate("/student/college-name");
              }}
            />
          </div>
        </div>
      </section>

      <footer className="px-4 pb-4 pt-2 text-center text-xs text-muted-foreground md:px-6">
        Secure by CredifyU • v1.0
      </footer>

      {/* Change Role Confirmation Dialog */}
      <Dialog open={showChangeRoleDialog} onOpenChange={setShowChangeRoleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Change Role
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to change your role?
            </DialogDescription>
          </DialogHeader>
          
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Warning:</strong> Changing your role will permanently delete all your stored data, including:
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>Saved credentials and documents</li>
                <li>Personal information</li>
                <li>Application preferences</li>
                <li>Login sessions</li>
              </ul>
              This action cannot be undone.
            </AlertDescription>
          </Alert>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={cancelChangeRole}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              No, Keep Current Role
            </Button>
            <Button
              variant="destructive"
              onClick={confirmChangeRole}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yes, Change Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}