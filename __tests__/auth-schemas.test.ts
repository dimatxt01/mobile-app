import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../src/features/auth/schemas/auth-schemas';

describe('signInSchema', () => {
  it('accepts valid credentials', () => {
    expect(signInSchema.safeParse({ email: 'a@b.com', password: 'secret1' }).success).toBe(true);
  });

  it('rejects bad email', () => {
    const r = signInSchema.safeParse({ email: 'not-email', password: 'secret1' });
    expect(r.success).toBe(false);
  });

  it('rejects short password', () => {
    const r = signInSchema.safeParse({ email: 'a@b.com', password: '123' });
    expect(r.success).toBe(false);
  });
});

describe('signUpSchema', () => {
  const valid = {
    fullName: 'Jane',
    email: 'jane@example.com',
    password: 'password1',
    confirmPassword: 'password1',
  };

  it('accepts valid input', () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const r = signUpSchema.safeParse({ ...valid, confirmPassword: 'different' });
    expect(r.success).toBe(false);
  });

  it('rejects empty full name', () => {
    const r = signUpSchema.safeParse({ ...valid, fullName: '' });
    expect(r.success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('accepts valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'a@b.com' }).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'bad' }).success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('accepts matching passwords', () => {
    expect(
      resetPasswordSchema.safeParse({ password: 'newpass1', confirmPassword: 'newpass1' }).success,
    ).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    expect(
      resetPasswordSchema.safeParse({ password: 'newpass1', confirmPassword: 'different' }).success,
    ).toBe(false);
  });
});
