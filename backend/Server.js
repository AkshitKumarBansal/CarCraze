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
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:58899', 'http://127.0.0.1:59600'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple file-based storage (replace with database in production)
const DATA_DIR = path.join(__dirname, 'Data');
const CUSTOMER_FILE = path.join(DATA_DIR, 'customer.json');
const SELLER_FILE = path.join(DATA_DIR, 'seller.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');
const CARS_FILE = path.join(DATA_DIR, 'cars.json');

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

// Read cars from cars file
async function readCars() {
  try {
    const data = await fs.readFile(CARS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write cars to cars file
async function writeCars(cars) {
  try {
    await fs.writeFile(CARS_FILE, JSON.stringify(cars, null, 2));
  } catch (error) {
    console.error('Error writing cars to file:', error);
    throw new Error(`Failed to save cars data: ${error.message}`);
  }
}

// Write users to role-specific file
async function writeUsersByRole(role, users) {
  try {
    const filePath = getFilePathByRole(role);
    await fs.writeFile(filePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error(`Error writing users to ${role} file:`, error);
    throw new Error(`Failed to save ${role} data: ${error.message}`);
  }
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

// Test endpoint to create a seller with known password (for development only)
app.post('/api/test/create-seller', async (req, res) => {
  try {
    const testSeller = {
      id: `seller_test_${Date.now()}`,
      firstName: 'Test',
      lastName: 'Seller',
      email: 'testseller@carcraze.com',
      password: await bcrypt.hash('password123', 12),
      phone: '1234567890',
      role: 'seller',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true,
      businessInfo: {
        businessName: 'Test Auto Sales',
        businessAddress: '123 Test Street',
        businessPhone: '1234567890',
        businessLicense: '',
        taxId: ''
      },
      inventory: [],
      salesHistory: [],
      rating: { average: 0, totalReviews: 0 },
      verification: { isVerified: false, documents: [] }
    };

    const sellers = await readUsersByRole('seller');
    
    // Check if test seller already exists
    const existingSeller = sellers.find(s => s.email === 'testseller@carcraze.com');
    if (existingSeller) {
      return res.json({ message: 'Test seller already exists', email: 'testseller@carcraze.com', password: 'password123' });
    }
    
    sellers.push(testSeller);
    await writeUsersByRole('seller', sellers);
    
    res.json({ 
      message: 'Test seller created successfully',
      email: 'testseller@carcraze.com',
      password: 'password123'
    });
  } catch (error) {
    console.error('Error creating test seller:', error);
    res.status(500).json({ error: 'Failed to create test seller' });
  }
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
    const allUsers = await readAllUsers();
    const user = allUsers.find(u => u.id === req.user.userId);
    
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

// Seller Dashboard - Get seller's cars
app.get('/api/seller/cars', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Seller access required'
      });
    }

    const cars = await readCars();
    const sellerCars = cars.filter(car => car.sellerId === req.user.userId);
    
    res.json({ cars: sellerCars });

  } catch (error) {
    console.error('Seller cars error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch seller cars'
    });
  }
});

// Add new car (seller only)
app.post('/api/seller/cars', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Seller access required'
      });
    }

    const {
      model,
      brand,
      year,
      capacity,
      fuelType,
      transmission,
      description,
      listingType, // 'sale_new', 'sale_old', or 'rent'
      price,
      availability,
      color,
      mileage,
      images,
      location
    } = req.body;

    // Validation
    if (!model || !brand || !year || !capacity || !fuelType || !transmission || !listingType || !price) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Model, brand, year, capacity, fuel type, transmission, listing type, and price are required'
      });
    }

    // Validate listing type
    const validListingTypes = ['sale_new', 'sale_old', 'rent'];
    if (!validListingTypes.includes(listingType)) {
      return res.status(400).json({ 
        error: 'Invalid listing type',
        message: 'Listing type must be sale_new, sale_old, or rent'
      });
    }

    if (listingType === 'rent' && !availability) {
      return res.status(400).json({ 
        error: 'Missing availability',
        message: 'Availability is required for rental cars'
      });
    }

    // Create new car object
    const newCar = {
      id: `car_${Date.now()}`,
      sellerId: req.user.userId,
      model,
      brand,
      year: parseInt(year),
      capacity: parseInt(capacity),
      fuelType,
      transmission,
      description: description || '',
      listingType,
      price: parseFloat(price),
      availability: listingType === 'rent' ? availability : null,
      color: color || '',
      mileage: mileage ? parseInt(mileage) : 0,
      images: images || [],
      location: location || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Read existing cars and add new car
    const cars = await readCars();
    cars.push(newCar);
    await writeCars(cars);

    // Update seller's inventory
    const sellers = await readUsersByRole('seller');
    const sellerIndex = sellers.findIndex(s => s.id === req.user.userId);
    if (sellerIndex !== -1) {
      sellers[sellerIndex].inventory.push(newCar.id);
      await writeUsersByRole('seller', sellers);
    }

    res.status(201).json({
      message: 'Car added successfully',
      car: newCar
    });

  } catch (error) {
    console.error('Add car error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to add car. Please try again.'
    });
  }
});

// Update car (seller only)
app.put('/api/seller/cars/:carId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Seller access required'
      });
    }

    const { carId } = req.params;
    const updateData = req.body;

    const cars = await readCars();
    const carIndex = cars.findIndex(car => car.id === carId && car.sellerId === req.user.userId);
    
    if (carIndex === -1) {
      return res.status(404).json({ 
        error: 'Car not found',
        message: 'Car not found or you do not have permission to update it'
      });
    }

    // Update car data
    cars[carIndex] = {
      ...cars[carIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await writeCars(cars);

    res.json({
      message: 'Car updated successfully',
      car: cars[carIndex]
    });

  } catch (error) {
    console.error('Update car error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update car. Please try again.'
    });
  }
});

// Delete car (seller only)
app.delete('/api/seller/cars/:carId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Seller access required'
      });
    }

    const { carId } = req.params;

    const cars = await readCars();
    const carIndex = cars.findIndex(car => car.id === carId && car.sellerId === req.user.userId);
    
    if (carIndex === -1) {
      return res.status(404).json({ 
        error: 'Car not found',
        message: 'Car not found or you do not have permission to delete it'
      });
    }

    // Remove car from cars array
    cars.splice(carIndex, 1);
    await writeCars(cars);

    // Remove car from seller's inventory
    const sellers = await readUsersByRole('seller');
    const sellerIndex = sellers.findIndex(s => s.id === req.user.userId);
    if (sellerIndex !== -1) {
      sellers[sellerIndex].inventory = sellers[sellerIndex].inventory.filter(id => id !== carId);
      await writeUsersByRole('seller', sellers);
    }

    res.json({
      message: 'Car deleted successfully'
    });

  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete car. Please try again.'
    });
  }
});

// Get all cars (public route for browsing)
app.get('/api/cars', async (req, res) => {
  try {
    const cars = await readCars();
    const activeCars = cars.filter(car => car.status === 'active');
    
    res.json({ cars: activeCars });

  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch cars'
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

    const users = await readAllUsers();
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
