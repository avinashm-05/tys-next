import { z } from "zod";

// Client + server schema for the /contact-us/support form (POST /api/contact).
export const contactSupportSchema = z.object({
  name: z.string({ error: () => "Please enter your name." }).max(255).regex(/\S/, "Please enter your name."),
  email: z
    .string({ error: () => "Please enter your email address." })
    .max(255)
    .email("Please enter a valid email address."),
  country_code: z.string({ error: () => "Please select a country code." }).max(10).min(1),
  phone: z
    .string({ error: () => "Please enter your phone number." })
    .min(7, "Phone number must be at least 7 characters.")
    .max(20)
    .regex(/^[0-9\s\-()]+$/, "Phone number can only contain numbers, spaces, hyphens, and parentheses."),
  message: z
    .string({ error: () => "Please enter a message." })
    .min(10, "Please enter at least 10 characters.")
    .max(4000),
  agree: z.literal(true, { error: () => "Please agree to the privacy policy." }),
});

export type ContactSupportInput = z.infer<typeof contactSupportSchema>;
