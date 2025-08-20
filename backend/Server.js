import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'carcraze_secret_key_2024';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple file-based storage (replace with database in production)
const DATA_DIR = path.join(__dirname, 'data');
const CUSTOMER_FILE = path.join(DATA_DIR, 'customer.json');
const SELLER_FILE = path.join(DATA_DIR, 'seller.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Get file path based on role
function getFilePathByRole(role) {
  switch (role) {
    case 'customer': return CUSTOMER_FILE;
    case 'seller': return SELLER_FILE;
    case 'admin': return ADMIN_FILE;
    default: return CUSTOMER_FILE;
  }
}

// Read users from role-specific file
async function readUsersByRole(role) {
  try {
    const filePath = getFilePathByRole(role);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write users to role-specific file
async function writeUsersByRole(role, users) {
  const filePath = getFilePathByRole(role);
  await fs.writeFile(filePath, JSON.stringify(users, null, 2));
}

// Read all users from all files
async function readAllUsers() {
  const customers = await readUsersByRole('customer');
  const sellers = await readUsersByRole('seller');
  const admins = await readUsersByRole('admin');
  return [...customers, ...sellers, ...admins];
}

// Find user by email across all files
async function findUserByEmail(email) {
  const allUsers = await readAllUsers();
  return allUsers.find(user => user.email === email);
}

// // OTP storage (in production, use Redis or database)
// const otpStorage = new Map();

// // Generate 6-digit OTP
// function generateOTP() {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }

// // Store OTP with expiration (5 minutes)
// function storeOTP(email, otp) {
//   const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
//   otpStorage.set(email, { otp, expiresAt });
// }

// // Verify OTP
// function verifyOTP(email, otp) {
//   const stored = otpStorage.get(email);
//   if (!stored) return false;
  
//   if (Date.now() > stored.expiresAt) {
//     otpStorage.delete(email);
//     return false;
//   }
  
//   if (stored.otp === otp) {
//     otpStorage.delete(email);
//     return true;
//   }
  
//   return false;
// }

// Helper function to detect role from email
function detectRoleFromEmail(email) {
  if (email.includes('admin') || email.startsWith('admin@') || email === 'admin@carcraze.com') {
    return 'admin';
  } else if (email.includes('seller') || email.startsWith('seller@') || email === 'seller@carcraze.com') {
    return 'seller';
  } else {
    return 'customer';
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CarCraze Server is running!' });
});

// User Registration
app.post('/api/auth/signup', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      businessName,
      businessAddress,
      businessPhone,
      adminCode
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'First name, last name, email, password, and phone are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password too short',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Role-specific validation
    if (role === 'seller') {
      if (!businessName || !businessAddress || !businessPhone) {
        return res.status(400).json({ 
          error: 'Missing business information',
          message: 'Business name, address, and phone are required for sellers'
        });
      }
    }

    if (role === 'admin') {
      if (!adminCode || adminCode !== 'CARCRAZE_ADMIN_2024') {
        return res.status(400).json({ 
          error: 'Invalid admin code',
          message: 'Valid admin code is required for admin registration'
        });
      }
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user with role-specific structure
    const newUser = {
      id: `${role}_${Date.now()}`,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true
    };

    // Add role-specific data
    if (role === 'customer') {
      newUser.preferences = {
        carTypes: [],
        priceRange: { min: 0, max: 100000 },
        location: ""
      };
      newUser.savedCars = [];
      newUser.purchaseHistory = [];
    } else if (role === 'seller') {
      newUser.businessInfo = {
        businessName,
        businessAddress,
        businessPhone,
        businessLicense: "",
        taxId: ""
      };
      newUser.inventory = [];
      newUser.salesHistory = [];
      newUser.rating = { average: 0, totalReviews: 0 };
      newUser.verification = { isVerified: false, documents: [] };
    } else if (role === 'admin') {
      newUser.permissions = [
        "user_management",
        "content_management", 
        "system_settings",
        "analytics_access",
        "security_management"
      ];
      newUser.adminLevel = "admin";
      newUser.department = "Operations";
      newUser.accessLogs = [];
      newUser.settings = {
        twoFactorEnabled: false,
        emailNotifications: true,
        systemAlerts: true
      };
    }

    // Read existing users for this role and add new user
    const roleUsers = await readUsersByRole(role);
    roleUsers.push(newUser);
    await writeUsersByRole(role, roleUsers);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response (don't send password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to register user. Please try again.'
    });
  }
});

// // Send OTP for login
// app.post('/api/auth/send-otp', async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ 
//         error: 'Missing email',
//         message: 'Email is required to send OTP'
//       });
//     }

//     // Find user
//     const user = await findUserByEmail(email);
//     if (!user) {
//       return res.status(404).json({ 
//         error: 'User not found',
//         message: 'No account found with this email'
//       });
//     }

//     if (!user.isActive) {
//       return res.status(401).json({ 
//         error: 'Account disabled',
//         message: 'Your account has been disabled. Please contact support.'
//       });
//     }

//     // Generate and store OTP
//     const otp = generateOTP();
//     storeOTP(email, otp);

//     // In production, send OTP via SMS/Email service
//     console.log(`OTP for ${email}: ${otp}`);

//     res.json({
//       message: 'OTP sent successfully',
//       // In production, don't send OTP in response
//       otp: otp // Only for development/testing
//     });

//   } catch (error) {
//     console.error('Send OTP error:', error);
//     res.status(500).json({ 
//       error: 'Internal server error',
//       message: 'Failed to send OTP. Please try again.'
//     });
//   }
// });

// // Verify OTP and login
// app.post('/api/auth/verify-otp', async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     if (!email || !otp) {
//       return res.status(400).json({ 
//         error: 'Missing credentials',
//         message: 'Email and OTP are required'
//       });
//     }

//     // Verify OTP
//     if (!verifyOTP(email, otp)) {
//       return res.status(401).json({ 
//         error: 'Invalid OTP',
//         message: 'OTP is invalid or expired'
//       });
//     }

//     // Find user
//     const user = await findUserByEmail(email);
//     if (!user) {
//       return res.status(404).json({ 
//         error: 'User not found',
//         message: 'No account found with this email'
//       });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { 
//         userId: user.id, 
//         email: user.email, 
//         role: user.role 
//       },
//       JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     // Update last login
//     user.lastLogin = new Date().toISOString();
//     const roleUsers = await readUsersByRole(user.role);
//     const userIndex = roleUsers.findIndex(u => u.id === user.id);
//     if (userIndex !== -1) {
//       roleUsers[userIndex] = user;
//       await writeUsersByRole(user.role, roleUsers);
//     }

//     // Return success response (don't send password)
//     const { password: _, ...userWithoutPassword } = user;
    
//     res.json({
//       message: 'Login successful',
//       user: userWithoutPassword,
//       token
//     });

//   } catch (error) {
//     console.error('OTP verification error:', error);
//     res.status(500).json({ 
//       error: 'Internal server error',
//       message: 'Failed to verify OTP. Please try again.'
//     });
//   }
// });

// User Login (Password-based)
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    // Auto-detect role from email
    const detectedRole = detectRoleFromEmail(email);

    // Find user
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account disabled',
        message: 'Your account has been disabled. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Verify role matches detected role
    if (user.role !== detectedRole) {
      return res.status(401).json({ 
        error: 'Role mismatch',
        message: `This email is registered as ${user.role}, not ${detectedRole}`
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    user.lastLogin = new Date().toISOString();
    const roleUsers = await readUsersByRole(user.role);
    const userIndex = roleUsers.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      roleUsers[userIndex] = user;
      await writeUsersByRole(user.role, roleUsers);
    }

    // Return success response (don't send password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to login. Please try again.'
    });
  }
});

// Get user profile (protected route)
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const users = await readUsers();
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch profile'
    });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied',
      message: 'No token provided'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'Token is invalid or expired'
      });
    }
    req.user = user;
    next();
  });
}

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Admin access required'
      });
    }

    const users = await readUsers();
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    
    res.json({ users: usersWithoutPasswords });

  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch users'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: 'API endpoint not found'
  });
});

// Start server
async function startServer() {
  try {
    await ensureDataDir();
    
    app.listen(PORT, () => {
      console.log(`🚗 CarCraze Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth endpoints:`);
      console.log(`   POST http://localhost:${PORT}/api/auth/signup`);
      console.log(`   POST http://localhost:${PORT}/api/auth/signin`);
      console.log(`   GET  http://localhost:${PORT}/api/auth/profile`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
