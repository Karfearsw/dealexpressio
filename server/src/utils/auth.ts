import bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
    const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    const salt = await bcrypt.genSalt(rounds);
    return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
};
