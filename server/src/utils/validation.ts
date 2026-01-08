export const isEmailValid = (email: string) => {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
};

export const isPasswordValid = (password: string) => {
    if (!password || password.length < 8) return false;
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLetter && hasNumber;
};

export const isNameValid = (name: string) => {
    if (!name) return false;
    return name.trim().length >= 2;
};

export const sanitize = (s: string | undefined) => (s || '').trim();
