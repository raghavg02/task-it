import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';

export const signupUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return next(new ApiError(400, 'Please provide all required fields'));
    }

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

    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new ApiError(409, 'User already exists with this email'));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        needsPasswordChange: false
    });

    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

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

export const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ApiError(400, 'Please provide email and password'));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new ApiError(401, 'Invalid credentials'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new ApiError(401, 'Invalid credentials'));
    }

    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

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
