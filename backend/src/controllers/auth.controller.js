import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signupUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
        return next(new ApiError(400, 'Please provide all required fields'));
    }

    // Email regex validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        return next(new ApiError(400, 'Please provide a valid email'));
    }

    if (password.length < 6) {
        return next(new ApiError(400, 'Password must be at least 6 characters'));
    }

    if (!['admin', 'member'].includes(role)) {
        return next(new ApiError(400, 'Invalid role'));
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new ApiError(409, 'User already exists with this email'));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        needsPasswordChange: false
    });

    // Generate token
    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    // Return success and user without password
    const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        needsPasswordChange: user.needsPasswordChange,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            token,
            user: userResponse
        }
    });
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return next(new ApiError(400, 'Please provide email and password'));
    }

    // Check user existence
    const user = await User.findOne({ email });
    if (!user) {
        return next(new ApiError(401, 'Invalid credentials'));
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new ApiError(401, 'Invalid credentials'));
    }

    // Generate token
    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    // Return success and user without password
    const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        needsPasswordChange: user.needsPasswordChange,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };

    res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        data: {
            token,
            user: userResponse
        }
    });
});
