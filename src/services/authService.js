import prisma from "../models/prisma.js"
import { comparePasswords } from "../utils/passwords.js";
import { generateToken } from "../utils/token.js";
import { hashPassword } from "../utils/passwords.js";

const login = async ({ email, password }) => {
    // Find if user exist
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    // Compare passwords
    const isPasswordValid = await comparePasswords(password, user.password);

    if (!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken(user.id);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        token,
    }    
};

const register = async ({ email, name, password }) => {

    // verifier si l'email existe deja 
    const existingUser = await prisma.user.findUnique({
        where:{ email }
    });

    if ( existingUser ) {
        const error = new Error ("Email already in use");
        error.statusCode = 409;
        throw error;
    }

    
    const hashePassword = await hashPassword (password);
     const user = await prisma.user.create({
        data:{ email, name, password: hashePassword }
     })

    const token = generateToken(user.id);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        token,
    }
}

    const me = async (userId) => {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        };
    };



export {
    login,
    register,
    me,
}