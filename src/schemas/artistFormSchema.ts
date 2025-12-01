import * as yup from "yup";

export const artistFormValidationSchema = yup.object({
  first_name: yup
    .string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  last_name: yup
    .string()
    .min(2, "Last name must be at least 2 characters")
    .optional(),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  location: yup
    .string()
    .optional(),
  tier: yup
    .string()
    .required("Tier is required"),
});
