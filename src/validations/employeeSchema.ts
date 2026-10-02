import { z } from "zod";

const indianPhoneRegex = /^[6-9]\d{9}$/;

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

// IFSC format:
// 4 letters + 0 + 6 alphanumeric characters
// Example: SBIN0001234
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const employeeSchema = z
  .object({
    // =====================================================
    // EMPLOYEE ID
    // =====================================================

    id: z
      .string()
      .trim()
      .refine(
        (value) =>
          value === "" ||
          /^EMP-\d+$/.test(value),
        {
          message:
            "Employee ID must be like EMP-129",
        }
      ),

    // =====================================================
    // NAME
    // =====================================================

    name: z
      .string()
      .trim()
      .min(
        2,
        "Name must be at least 2 characters"
      )
      .max(
        100,
        "Name is too long"
      )
      .regex(
        /^[A-Za-z\s.'-]+$/,
        "Name can contain only letters"
      ),

    // =====================================================
    // EMAIL
    // =====================================================

    email: z
      .string()
      .trim()
      .email(
        "Enter a valid email address"
      ),

    // =====================================================
    // PHONE
    // =====================================================

    phone: z
      .string()
      .regex(
        indianPhoneRegex,
        "Enter a valid 10-digit mobile number"
      ),

    // =====================================================
    // DEPARTMENT
    // =====================================================

    department: z
      .string()
      .trim()
      .min(
        1,
        "Please select a department"
      ),

    // =====================================================
    // DESIGNATION
    // =====================================================

    designation: z
      .string()
      .trim()
      .min(
        2,
        "Designation is required"
      )
      .max(
        100,
        "Designation is too long"
      ),

    // =====================================================
    // JOINING DATE
    // =====================================================

    joiningDate: z
      .string()
      .min(
        1,
        "Joining date is required"
      ),

    // =====================================================
    // SALARY
    // =====================================================

    salary: z
      .union([
        z.number(),
        z.string(),
      ])
      .transform((value) => {
        if (
          typeof value === "number"
        ) {
          return value;
        }

        const cleanedValue =
          value
            .trim()
            .replace(/\D/g, "");

        if (
          cleanedValue === ""
        ) {
          return 0;
        }

        return Number(
          cleanedValue
        );
      })
      .refine(
        (value) =>
          Number.isFinite(value) &&
          value > 0,
        {
          message:
            "Salary must be greater than 0",
        }
      )
      .refine(
        (value) =>
          value <= 100000000,
        {
          message:
            "Please enter a valid salary",
        }
      ),

    // =====================================================
    // PAID LEAVE QUOTA (per month)
    // =====================================================

    paidLeaveQuota: z
      .union([
        z.number(),
        z.string(),
      ])
      .transform((value) => {
        if (
          typeof value === "number"
        ) {
          return value;
        }

        const cleanedValue =
          value
            .trim()
            .replace(/\D/g, "");

        if (
          cleanedValue === ""
        ) {
          return 2;
        }

        return Number(
          cleanedValue
        );
      })
      .refine(
        (value) =>
          Number.isFinite(value) &&
          value >= 0,
        {
          message:
            "Paid leave quota cannot be negative",
        }
      ),

    // =====================================================
    // STATUS
    // =====================================================

    status: z.enum([
      "Active",
      "Inactive",
      "On Leave",
    ]),

    // =====================================================
    // ADDRESS
    // =====================================================

    address: z
      .string()
      .trim()
      .min(
        5,
        "Address is required"
      )
      .max(
        500,
        "Address is too long"
      ),

    // =====================================================
    // CITY
    // =====================================================

    city: z
      .string()
      .trim()
      .min(
        2,
        "City is required"
      )
      .max(
        100,
        "City is too long"
      )
      .regex(
        /^[A-Za-z\s.'-]+$/,
        "City can contain only letters"
      ),

    // =====================================================
    // STATE
    // =====================================================

    state: z
      .string()
      .trim()
      .min(
        1,
        "Please select a state"
      ),

    // =====================================================
    // EMERGENCY CONTACT
    // =====================================================

    emergencyContact: z
      .string()
      .regex(
        indianPhoneRegex,
        "Enter a valid 10-digit emergency number"
      ),

    // =====================================================
    // BANK NAME
    // =====================================================

    bankName: z
      .string()
      .trim()
      .min(
        2,
        "Bank name is required"
      )
      .max(
        100,
        "Bank name is too long"
      )
      .regex(
        /^[A-Za-z\s.&'-]+$/,
        "Bank name can contain only letters"
      ),

    // =====================================================
    // BANK ACCOUNT
    // =====================================================

    bankAccount: z
      .string()
      .trim()
      .min(
        9,
        "Bank account number is too short"
      )
      .max(
        18,
        "Bank account number is too long"
      )
      .regex(
        /^\d+$/,
        "Bank account must contain digits only"
      ),

    // =====================================================
    // IFSC CODE
    // =====================================================

    ifscCode: z
      .string()
      .trim()
      .toUpperCase()
      .length(
        11,
        "IFSC code must be exactly 11 characters"
      )
      .regex(
        ifscRegex,
        "Enter a valid IFSC code"
      ),

    // =====================================================
    // PAN NUMBER
    // =====================================================

    panNumber: z
      .string()
      .trim()
      .toUpperCase()
      .regex(
        panRegex,
        "Enter a valid PAN number"
      ),

    // =====================================================
    // GENDER
    // =====================================================

    gender: z.enum([
      "Male",
      "Female",
      "Other",
    ]),

    // =====================================================
    // DATE OF BIRTH
    // =====================================================

    dateOfBirth: z
      .string()
      .min(
        1,
        "Date of birth is required"
      ),
  })

  // =====================================================
  // DATE VALIDATION
  // =====================================================

  .superRefine(
    (data, ctx) => {
      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      // -------------------------------------------------
      // DOB FUTURE CHECK
      // -------------------------------------------------

      if (
        data.dateOfBirth
      ) {
        const dob =
          new Date(
            `${data.dateOfBirth}T00:00:00`
          );

        if (
          !Number.isNaN(
            dob.getTime()
          ) &&
          dob > today
        ) {
          ctx.addIssue({
            code: "custom",
            path: [
              "dateOfBirth",
            ],
            message:
              "Date of birth cannot be in the future",
          });
        }
      }

      // -------------------------------------------------
      // JOINING DATE FUTURE CHECK
      // -------------------------------------------------

      if (
        data.joiningDate
      ) {
        const joiningDate =
          new Date(
            `${data.joiningDate}T00:00:00`
          );

        if (
          !Number.isNaN(
            joiningDate.getTime()
          ) &&
          joiningDate > today
        ) {
          ctx.addIssue({
            code: "custom",
            path: [
              "joiningDate",
            ],
            message:
              "Joining date cannot be in the future",
          });
        }
      }

      // -------------------------------------------------
      // DOB BEFORE JOINING DATE
      // -------------------------------------------------

      if (
        data.dateOfBirth &&
        data.joiningDate
      ) {
        const dob =
          new Date(
            `${data.dateOfBirth}T00:00:00`
          );

        const joiningDate =
          new Date(
            `${data.joiningDate}T00:00:00`
          );

        if (
          !Number.isNaN(
            dob.getTime()
          ) &&
          !Number.isNaN(
            joiningDate.getTime()
          ) &&
          dob >= joiningDate
        ) {
          ctx.addIssue({
            code: "custom",
            path: [
              "joiningDate",
            ],
            message:
              "Joining date must be after date of birth",
          });
        }
      }
    }
  );

// =========================================================
// TYPE
// =========================================================

export type EmployeeFormValues =
  z.infer<
    typeof employeeSchema
  >;