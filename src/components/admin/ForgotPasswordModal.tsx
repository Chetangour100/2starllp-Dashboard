import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Eye, EyeOff, Check, X, MailCheck } from "lucide-react";

import { apiClient } from "@/api/client";
import { API_CONFIG } from "@/api/config";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "email" | "otp" | "newPassword" | "success";

export function ForgotPasswordModal({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Only present in non-production API responses, purely for local testing
  // convenience since no email/SMTP service is configured yet.
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const resetState = () => {
    setStep("email");
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setDevOtp(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  /* =======================================================
     STEP 1 — SEND OTP
  ======================================================= */

  const handleSendOtp = async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.PASSWORD.FORGOT,
        { email: email.trim() }
      );

      if (!response.success) {
        throw new Error(
          response.message || "Failed to send OTP"
        );
      }

      if (response.data?.devOtp) {
        setDevOtp(response.data.devOtp);
      }

      setStep("otp");
    } catch (err: any) {
      setError(
        err?.message ||
          "Failed to send OTP. Please check the email and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     STEP 2 — VERIFY OTP
  ======================================================= */

  const handleVerifyOtp = async () => {
    setError("");

    if (otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.PASSWORD.VERIFY_OTP,
        { email: email.trim(), otp: otp.trim() }
      );

      if (!response.success) {
        throw new Error(
          response.message || "Invalid OTP"
        );
      }

      setStep("newPassword");
    } catch (err: any) {
      setError(
        err?.message ||
          "Invalid or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     STEP 3 — SET NEW PASSWORD
  ======================================================= */

  const handleResetPassword = async () => {
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.PASSWORD.RESET,
        {
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
          confirmPassword,
        }
      );

      if (!response.success) {
        throw new Error(
          response.message || "Failed to reset password"
        );
      }

      setStep("success");
    } catch (err: any) {
      setError(
        err?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<Step, string> = {
    email: "Forgot Password",
    otp: "Verify OTP",
    newPassword: "Set New Password",
    success: "Password Reset",
  };

  const descriptions: Record<Step, string> = {
    email:
      "Enter your account email — we'll send a 6-digit OTP to verify it's you.",
    otp: `Enter the 6-digit OTP sent to ${email}. It's valid for 10 minutes.`,
    newPassword: "Choose a new password for your account.",
    success: "Your password has been changed. You can now log in.",
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titles[step]}</DialogTitle>
          <DialogDescription>{descriptions[step]}</DialogDescription>
        </DialogHeader>

        {error && (
          <p className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            <X className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        {/* -------------------------------------------------
            STEP 1 — EMAIL
        ------------------------------------------------- */}

        {step === "email" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fp-email">Email</Label>
              <Input
                id="fp-email"
                type="email"
                placeholder="admin@2starllp.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendOtp();
                }}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* -------------------------------------------------
            STEP 2 — OTP
        ------------------------------------------------- */}

        {step === "otp" && (
          <div className="space-y-4">
            {devOtp && (
              <p className="flex items-center gap-1.5 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                <MailCheck className="h-3.5 w-3.5 shrink-0" />
                Email sending isn't configured yet — for now, your OTP is:{" "}
                <span className="font-mono font-semibold">{devOtp}</span>
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="fp-otp">Enter OTP</Label>
              <Input
                id="fp-otp"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  if (error) setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleVerifyOtp();
                }}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("email")}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
              >
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* -------------------------------------------------
            STEP 3 — NEW PASSWORD
        ------------------------------------------------- */}

        {step === "newPassword" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fp-new">New Password</Label>
              <div className="relative">
                <Input
                  id="fp-new"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (error) setError("");
                  }}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fp-confirm">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="fp-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleResetPassword();
                  }}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                {confirmPassword &&
                  newPassword &&
                  confirmPassword === newPassword && (
                    <Check className="absolute right-10 top-1/2 h-4 w-4 -translate-y-1/2 text-green-600" />
                  )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("otp")}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleResetPassword}
                disabled={loading}
              >
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* -------------------------------------------------
            STEP 4 — SUCCESS
        ------------------------------------------------- */}

        {step === "success" && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-600">
                Password Reset Successful
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You can now log in with your new password.
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              Back to Login
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ForgotPasswordModal;
