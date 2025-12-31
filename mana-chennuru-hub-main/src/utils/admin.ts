/**
 * Admin utility functions
 * Checks if a user is an admin based on their email
 */

/**
 * Check if a user is an admin
 * @param userEmail - The user's email address
 * @returns true if the user is an admin, false otherwise
 */
export const isAdmin = (userEmail: string | null | undefined): boolean => {
  if (!userEmail) return false;

  // Get admin emails from environment variable (comma-separated)
  // Or use a default list
  const adminEmailsEnv = import.meta.env.VITE_ADMIN_EMAILS;
  const adminEmails = adminEmailsEnv 
    ? adminEmailsEnv.split(',').map(email => email.trim().toLowerCase())
    : []; // Default: empty list - configure via environment variable

  // Check if user's email is in the admin list
  return adminEmails.includes(userEmail.toLowerCase());
};

