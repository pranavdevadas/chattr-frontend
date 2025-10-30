const validation = {
  validateName: (name: string): string => {
    if (!name.trim()) return '';
    if (/[0-9]/.test(name)) return 'Name should not contain numbers';
    if (/[^a-zA-Z\s]/.test(name)) return 'Name should only contain letters';
    if (name.trim().length < 3) return 'Name should be at least 3 characters';
    return '';
  },

  validateEmail: (email: string): string => {
    if (!email.trim()) return '';
    const strongEmailRegex =
      /^(?=.*[a-zA-Z])[a-zA-Z0-9._%+-]+@[a-zA-Z]+(\.[a-zA-Z]{2,})+$/;
    if (!strongEmailRegex.test(email)) {
      return 'Please enter a valid email address';
    }

    return '';
  },

  validateOtp: (otp: string): string => {
    if (!otp) return '';
    if (otp.length !== 6) return 'OTP must be 6 digits';
    if (!/^\d+$/.test(otp)) return 'OTP should contain only numbers';
    return '';
  },

  validateUsername: (username: string): string => {
    if (!username.trim()) return 'Username is required';
    const usernameRegex = /^[A-Za-z0-9]{5,}$/;
    if (!usernameRegex.test(username)) return 'Invalid username';
    return '';
  },
};

export default validation;
