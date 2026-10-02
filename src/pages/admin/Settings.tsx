import { useEffect, useState } from "react";
import {
  User,
  Building2,
  Wallet,
  Landmark,
  Bell,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { apiClient } from "@/api/client";
import { usePassword } from "@/api/hooks/usePassword";

/* =====================================================
   TYPES
===================================================== */

type SettingsTab =
  | "profile"
  | "company"
  | "payroll"
  | "bankAccount"
  | "notifications"
  | "security";

type PayrollCycle =
  | "Monthly"
  | "Bi-Weekly"
  | "Weekly";

type Currency =
  | "INR"
  | "USD"
  | "EUR";

interface SettingsData {
  key?: string;

  profile: {
    fullName: string;
    email: string;
    phone: string;
  };

  company: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };

  payroll: {
    cycle: PayrollCycle;
    payrollDate: number;
    currency: Currency;
  };

  bankAccount: {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    branch: string;
  };

  notifications: {
    payrollReminder: boolean;
    paymentNotification: boolean;
    employeeNotification: boolean;
    monthlyReport: boolean;
  };
}

/* =====================================================
   DEFAULT SETTINGS
===================================================== */

const DEFAULT_SETTINGS: SettingsData = {
  key: "global",

  profile: {
    fullName: "Admin User",
    email: "admin@2starllp.com",
    phone: "",
  },

  company: {
    name: "2STAR STAFFING",
    email: "admin@2starllp.com",
    phone: "",
    address: "",
  },

  payroll: {
    cycle: "Monthly",
    payrollDate: 31,
    currency: "INR",
  },

  bankAccount: {
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    branch: "",
  },

  notifications: {
    payrollReminder: true,
    paymentNotification: true,
    employeeNotification: true,
    monthlyReport: false,
  },
};

/* =====================================================
   SETTINGS TABS
===================================================== */

const settingsTabs = [
  {
    id: "profile" as SettingsTab,
    name: "Profile",
    icon: User,
  },
  {
    id: "company" as SettingsTab,
    name: "Company",
    icon: Building2,
  },
  {
    id: "payroll" as SettingsTab,
    name: "Payroll",
    icon: Wallet,
  },
  {
    id: "bankAccount" as SettingsTab,
    name: "Bank Account",
    icon: Landmark,
  },
  {
    id: "notifications" as SettingsTab,
    name: "Notifications",
    icon: Bell,
  },
  {
    id: "security" as SettingsTab,
    name: "Security",
    icon: Shield,
  },
];

/* =====================================================
   RESPONSE HELPERS
===================================================== */

function extractSettings(payload: unknown): SettingsData | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const response = payload as {
    data?: SettingsData;
    settings?: SettingsData;
  };

  if (response.data) {
    return response.data;
  }

  if (response.settings) {
    return response.settings;
  }

  return payload as SettingsData;
}

/* =====================================================
   PAGE
===================================================== */

const Settings = () => {
  const [activeTab, setActiveTab] =
    useState<SettingsTab>("profile");

  const [settings, setSettings] =
    useState<SettingsData>(DEFAULT_SETTINGS);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  /* ===================================================
     CHANGE PASSWORD
  =================================================== */

  const {
    changePassword,
    isChangingPassword,
  } = usePassword();

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const getUserId = (): string | null => {
    try {
      const user = localStorage.getItem("user");

      if (user) {
        const userData = JSON.parse(user);
        return userData.id || userData.userId || null;
      }

      return null;
    } catch {
      return null;
    }
  };

  const handleChangePassword = () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setErrorMessage(
        "Please fill in all password fields.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        "New password and confirm password do not match.",
      );
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage(
        "New password must be at least 6 characters.",
      );
      return;
    }

    const userId = getUserId();

    changePassword(
      {
        userId: userId ?? "",
        currentPassword,
        newPassword,
        confirmPassword,
      },
      {
        onSuccess: () => {
          setSuccessMessage(
            "Password changed successfully.",
          );
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (error: any) => {
          setErrorMessage(
            error?.message ||
              "Failed to change password.",
          );
        },
      },
    );
  };

  /* ===================================================
     LOAD SETTINGS
  =================================================== */

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response =
        await apiClient.get("/settings");

      const serverSettings =
        extractSettings(response.data);

      if (serverSettings) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...serverSettings,

          profile: {
            ...DEFAULT_SETTINGS.profile,
            ...serverSettings.profile,
          },

          company: {
            ...DEFAULT_SETTINGS.company,
            ...serverSettings.company,
          },

          payroll: {
            ...DEFAULT_SETTINGS.payroll,
            ...serverSettings.payroll,
          },

          bankAccount: {
            ...DEFAULT_SETTINGS.bankAccount,
            ...serverSettings.bankAccount,
          },

          notifications: {
            ...DEFAULT_SETTINGS.notifications,
            ...serverSettings.notifications,
          },
        });
      }
    } catch (error) {
      console.error(
        "Failed to load settings:",
        error,
      );

      setErrorMessage(
        "Failed to load settings from server.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* ===================================================
     LOAD ON PAGE OPEN
  =================================================== */

  useEffect(() => {
    loadSettings();
  }, []);

  /* ===================================================
     SAVE SETTINGS
  =================================================== */

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSuccessMessage("");
      setErrorMessage("");

      const payload: SettingsData = {
        key: "global",

        profile: {
          fullName:
            settings.profile.fullName.trim(),

          email:
            settings.profile.email.trim(),

          phone:
            settings.profile.phone.trim(),
        },

        company: {
          name:
            settings.company.name.trim(),

          email:
            settings.company.email.trim(),

          phone:
            settings.company.phone.trim(),

          address:
            settings.company.address.trim(),
        },

        payroll: {
          cycle:
            settings.payroll.cycle,

          payrollDate:
            Number(settings.payroll.payrollDate),

          currency:
            settings.payroll.currency,
        },

        bankAccount: {
          bankName:
            settings.bankAccount.bankName.trim(),

          accountHolderName:
            settings.bankAccount.accountHolderName.trim(),

          accountNumber:
            settings.bankAccount.accountNumber.trim(),

          ifscCode:
            settings.bankAccount.ifscCode.trim().toUpperCase(),

          branch:
            settings.bankAccount.branch.trim(),
        },

        notifications: {
          payrollReminder:
            settings.notifications
              .payrollReminder,

          paymentNotification:
            settings.notifications
              .paymentNotification,

          employeeNotification:
            settings.notifications
              .employeeNotification,

          monthlyReport:
            settings.notifications
              .monthlyReport,
        },
      };

      const response =
        await apiClient.put(
          "/settings",
          payload,
        );

      const updatedSettings =
        extractSettings(response.data);

      if (updatedSettings) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...updatedSettings,

          profile: {
            ...DEFAULT_SETTINGS.profile,
            ...updatedSettings.profile,
          },

          company: {
            ...DEFAULT_SETTINGS.company,
            ...updatedSettings.company,
          },

          payroll: {
            ...DEFAULT_SETTINGS.payroll,
            ...updatedSettings.payroll,
          },

          bankAccount: {
            ...DEFAULT_SETTINGS.bankAccount,
            ...updatedSettings.bankAccount,
          },

          notifications: {
            ...DEFAULT_SETTINGS.notifications,
            ...updatedSettings.notifications,
          },
        });
      }

      setSuccessMessage(
        "Settings saved successfully.",
      );
    } catch (error) {
      console.error(
        "Failed to save settings:",
        error,
      );

      setErrorMessage(
        "Failed to save settings. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* ===================================================
     SUCCESS / ERROR MESSAGE
  =================================================== */

  const MessageBox = () => {
    if (!successMessage && !errorMessage) {
      return null;
    }

    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border p-3 text-sm",
          successMessage
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-destructive/30 bg-destructive/5 text-destructive",
        )}
      >
        {successMessage ? (
          <CheckCircle className="h-4 w-4 shrink-0" />
        ) : (
          <AlertCircle className="h-4 w-4 shrink-0" />
        )}

        <span>
          {successMessage || errorMessage}
        </span>
      </div>
    );
  };

  /* ===================================================
     LOADING
  =================================================== */

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Settings
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage your account, company and payroll
            settings.
          </p>
        </div>

        <Card>
          <CardContent className="flex min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />

              <p className="text-sm text-muted-foreground">
                Loading settings...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="space-y-6">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Settings
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage your account, company and payroll
          settings.
        </p>
      </div>

      {/* =================================================
          MESSAGE
      ================================================= */}

      <MessageBox />

      {/* =================================================
          MAIN GRID
      ================================================= */}

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <Card className="h-fit">
          <CardContent className="p-2">
            <div className="space-y-1">

              {settingsTabs.map((tab) => {
                const Icon = tab.icon;

                const isActive =
                  activeTab === tab.id;

                return (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    onClick={() =>
                      setActiveTab(tab.id)
                    }
                    className={cn(
                      "w-full justify-start gap-3",
                      isActive &&
                        "bg-sidebar-accent text-sidebar-accent-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />

                    {tab.name}
                  </Button>
                );
              })}

            </div>
          </CardContent>
        </Card>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div>

          {/* =================================================
              PROFILE
          ================================================= */}

          {activeTab === "profile" && (
            <Card>

              <CardHeader>
                <CardTitle>
                  Profile Settings
                </CardTitle>

                <p className="text-sm text-muted-foreground">
                  Manage your personal account information.
                </p>
              </CardHeader>

              <CardContent className="space-y-5">

                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name
                  </Label>

                  <Input
                    id="fullName"
                    value={
                      settings.profile.fullName
                    }
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,

                        profile: {
                          ...prev.profile,
                          fullName:
                            e.target.value,
                        },
                      }))
                    }
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profileEmail">
                    Email
                  </Label>

                  <Input
                    id="profileEmail"
                    type="email"
                    value={
                      settings.profile.email
                    }
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,

                        profile: {
                          ...prev.profile,
                          email:
                            e.target.value,
                        },
                      }))
                    }
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profilePhone">
                    Phone
                  </Label>

                  <Input
                    id="profilePhone"
                    value={
                      settings.profile.phone
                    }
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,

                        profile: {
                          ...prev.profile,
                          phone:
                            e.target.value,
                        },
                      }))
                    }
                    placeholder="Enter your phone number"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}

                  {isSaving
                    ? "Saving..."
                    : "Save Changes"}
                </Button>

              </CardContent>
            </Card>
          )}

          {/* =================================================
              COMPANY
          ================================================= */}

          {activeTab === "company" && (
            <Card>

              <CardHeader>
                <CardTitle>
                  Company Settings
                </CardTitle>

                <p className="text-sm text-muted-foreground">
                  Manage your company information.
                </p>
              </CardHeader>

              <CardContent className="space-y-5">

                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Company Name
                  </Label>

                  <Input
                    id="companyName"
                    value={
                      settings.company.name
                    }
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,

                        company: {
                          ...prev.company,
                          name:
                            e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyEmail">
                    Company Email
                  </Label>

                  <Input
                    id="companyEmail"
                    type="email"
                    value={
                      settings.company.email
                    }
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,

                        company: {
                          ...prev.company,
                          email:
                            e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyPhone">
                    Phone
                  </Label>

                  <Input
                    id="companyPhone"
                    value={
                      settings.company.phone
                    }
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,

                        company: {
                          ...prev.company,
                          phone:
                            e.target.value,
                        },
                      }))
                    }
                    placeholder="Company phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">
                    Address
                  </Label>

                  <Input
                    id="companyAddress"
                    value={
                      settings.company.address
                    }
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,

                        company: {
                          ...prev.company,
                          address:
                            e.target.value,
                        },
                      }))
                    }
                    placeholder="Company address"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}

                  {isSaving
                    ? "Saving..."
                    : "Save Changes"}
                </Button>

              </CardContent>
            </Card>
          )}

          {/* =================================================
              PAYROLL
          ================================================= */}

          {activeTab === "payroll" && (
            <Card>

              <CardHeader>
                <CardTitle>
                  Payroll Settings
                </CardTitle>

                <p className="text-sm text-muted-foreground">
                  Configure your payroll preferences.
                </p>
              </CardHeader>

              <CardContent className="space-y-5">

                <div className="space-y-2">
                  <Label htmlFor="cycle">
                    Payroll Cycle
                  </Label>

                  <select
                    id="cycle"
                    value={
                      settings.payroll.cycle
                    }
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,

                        payroll: {
                          ...prev.payroll,
                          cycle:
                            e.target.value as PayrollCycle,
                        },
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Monthly">
                      Monthly
                    </option>

                    <option value="Bi-Weekly">
                      Bi-Weekly
                    </option>

                    <option value="Weekly">
                      Weekly
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payrollDate">
                    Payroll Date
                  </Label>

                  <Input
                    id="payrollDate"
                    type="number"
                    min="1"
                    max="31"
                    value={
                      settings.payroll.payrollDate
                    }
                    onChange={(e) => {
                      const value =
                        Number(e.target.value);

                      setSettings((prev) => ({
                        ...prev,

                        payroll: {
                          ...prev.payroll,
                          payrollDate:
                            value,
                        },
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">
                    Currency
                  </Label>

                  <select
                    id="currency"
                    value={
                      settings.payroll.currency
                    }
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,

                        payroll: {
                          ...prev.payroll,
                          currency:
                            e.target.value as Currency,
                        },
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="INR">
                      INR - Indian Rupee
                    </option>

                    <option value="USD">
                      USD - US Dollar
                    </option>

                    <option value="EUR">
                      EUR - Euro
                    </option>
                  </select>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}

                  {isSaving
                    ? "Saving..."
                    : "Save Changes"}
                </Button>

              </CardContent>
            </Card>
          )}

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          {activeTab === "notifications" && (
            <Card>

              <CardHeader>
                <CardTitle>
                  Notifications
                </CardTitle>

                <p className="text-sm text-muted-foreground">
                  Choose which notifications you want to
                  receive.
                </p>
              </CardHeader>

              <CardContent className="space-y-6">

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      Payroll Reminder
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Receive reminders before payroll
                      processing.
                    </p>
                  </div>

                  <Switch
                    checked={
                      settings.notifications
                        .payrollReminder
                    }
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,

                        notifications: {
                          ...prev.notifications,
                          payrollReminder:
                            checked,
                        },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      Payment Notifications
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Get notified about payroll payments.
                    </p>
                  </div>

                  <Switch
                    checked={
                      settings.notifications
                        .paymentNotification
                    }
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,

                        notifications: {
                          ...prev.notifications,
                          paymentNotification:
                            checked,
                        },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      Employee Notifications
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Receive important employee updates.
                    </p>
                  </div>

                  <Switch
                    checked={
                      settings.notifications
                        .employeeNotification
                    }
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,

                        notifications: {
                          ...prev.notifications,
                          employeeNotification:
                            checked,
                        },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      Monthly Reports
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Receive monthly payroll reports.
                    </p>
                  </div>

                  <Switch
                    checked={
                      settings.notifications
                        .monthlyReport
                    }
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,

                        notifications: {
                          ...prev.notifications,
                          monthlyReport:
                            checked,
                        },
                      }))
                    }
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}

                  {isSaving
                    ? "Saving..."
                    : "Save Changes"}
                </Button>

              </CardContent>
            </Card>
          )}

          {/* =================================================
              SECURITY
          ================================================= */}

          {activeTab === "security" && (
            <Card>

              <CardHeader>
                <CardTitle>
                  Security
                </CardTitle>

                <p className="text-sm text-muted-foreground">
                  Manage your account security.
                </p>
              </CardHeader>

              <CardContent className="space-y-5">

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">
                    Current Password
                  </Label>

                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) =>
                        setCurrentPassword(
                          e.target.value,
                        )
                      }
                      className="pr-10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(
                          (prev) => !prev,
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">
                    New Password
                  </Label>

                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(
                          e.target.value,
                        )
                      }
                      className="pr-10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          (prev) => !prev,
                        )
                      }
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
                  <Label htmlFor="confirmPassword">
                    Confirm Password
                  </Label>

                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value,
                        )
                      }
                      className="pr-10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) => !prev,
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isChangingPassword
                    ? "Updating..."
                    : "Update Password"}
                </Button>

              </CardContent>
            </Card>
          )}

          {/* =================================================
              BANK ACCOUNT
          ================================================= */}

          {activeTab === "bankAccount" && (
            <Card>

              <CardHeader>
                <CardTitle>
                  Bank Account
                </CardTitle>

                <p className="text-sm text-muted-foreground">
                  This is the company account that employee salaries
                  will be transferred from. Keep it accurate — it's
                  used on the bank transfer file generated for
                  each payroll.
                </p>
              </CardHeader>

              <CardContent className="space-y-5">

                <div className="grid gap-5 md:grid-cols-2">

                  <div className="space-y-2">
                    <Label htmlFor="bankName">
                      Bank Name
                    </Label>

                    <Input
                      id="bankName"
                      placeholder="HDFC Bank"
                      value={
                        settings.bankAccount.bankName
                      }
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          bankAccount: {
                            ...prev.bankAccount,
                            bankName: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountHolderName">
                      Account Holder Name
                    </Label>

                    <Input
                      id="accountHolderName"
                      placeholder="2Star Staffing Pvt Ltd"
                      value={
                        settings.bankAccount
                          .accountHolderName
                      }
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          bankAccount: {
                            ...prev.bankAccount,
                            accountHolderName:
                              e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">
                      Account Number
                    </Label>

                    <Input
                      id="accountNumber"
                      placeholder="123456789012"
                      value={
                        settings.bankAccount
                          .accountNumber
                      }
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          bankAccount: {
                            ...prev.bankAccount,
                            accountNumber:
                              e.target.value.replace(
                                /\D/g,
                                "",
                              ),
                          },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ifscCode">
                      IFSC Code
                    </Label>

                    <Input
                      id="ifscCode"
                      placeholder="HDFC0001234"
                      value={
                        settings.bankAccount.ifscCode
                      }
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          bankAccount: {
                            ...prev.bankAccount,
                            ifscCode:
                              e.target.value.toUpperCase(),
                          },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="branch">
                      Branch
                    </Label>

                    <Input
                      id="branch"
                      placeholder="MG Road, Bhopal"
                      value={
                        settings.bankAccount.branch
                      }
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          bankAccount: {
                            ...prev.bankAccount,
                            branch: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}

                  {isSaving
                    ? "Saving..."
                    : "Save Changes"}
                </Button>

              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;