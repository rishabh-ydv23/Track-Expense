// Input validation and sanitization utilities
import validator from 'validator';
import mongoose from 'mongoose';

export const isValidObjectId = (id) => mongoose.isValidObjectId(id);

export const validateEmail = (email) => {
    if (!email) return { valid: false, error: 'Email is required' };
    if (!validator.isEmail(email)) return { valid: false, error: 'Invalid email format' };
    return { valid: true };
};

export const validatePassword = (password) => {
    if (!password) return { valid: false, error: 'Password is required' };
    if (password.length < 8) return { valid: false, error: 'Password must be at least 8 characters' };
    if (!/[A-Z]/.test(password)) return { valid: false, error: 'Password must contain uppercase letter' };
    if (!/[a-z]/.test(password)) return { valid: false, error: 'Password must contain lowercase letter' };
    if (!/[0-9]/.test(password)) return { valid: false, error: 'Password must contain a number' };
    return { valid: true };
};

export const validateName = (name) => {
    if (!name) return { valid: false, error: 'Name is required' };
    if (name.trim().length < 2) return { valid: false, error: 'Name must be at least 2 characters' };
    if (name.length > 100) return { valid: false, error: 'Name must not exceed 100 characters' };
    return { valid: true };
};

export const validateAmount = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return { valid: false, error: 'Amount must be a number' };
    if (num <= 0) return { valid: false, error: 'Amount must be greater than 0' };
    if (num > 999999.99) return { valid: false, error: 'Amount is too large' };
    return { valid: true };
};

export const validateDescription = (desc) => {
    if (!desc) return { valid: false, error: 'Description is required' };
    if (desc.trim().length < 2) return { valid: false, error: 'Description must be at least 2 characters' };
    if (desc.length > 500) return { valid: false, error: 'Description must not exceed 500 characters' };
    return { valid: true };
};

export const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
};
