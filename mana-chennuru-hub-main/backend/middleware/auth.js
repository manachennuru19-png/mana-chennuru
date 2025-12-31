/**
 * Basic authentication middleware
 * For production, integrate with Firebase Admin SDK or JWT tokens
 * This is a placeholder that checks for admin email in request headers
 */

export const isAdmin = (req, res, next) => {
  try {
    // Get user email from request headers (set by frontend)
    // In production, verify JWT token or use Firebase Admin SDK
    const userEmail = req.headers['x-user-email'];
    
    if (!userEmail) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User email is required',
      });
    }

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS 
      ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim().toLowerCase())
      : [];

    if (!adminEmails.includes(userEmail.toLowerCase())) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required',
      });
    }

    // Attach user info to request
    req.user = {
      email: userEmail,
      isAdmin: true,
    };

    next();
  } catch (error) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authentication',
    });
  }
};

/**
 * Optional: Middleware to require any authenticated user
 * For now, we'll allow public access to GET endpoints
 */
export const requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'User ID is required',
    });
  }

  req.user = {
    id: userId,
  };

  next();
};

