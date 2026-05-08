const mailService = require('../../../services/mailService');
const { Resend } = require('resend');

/**
 * Unit tests for MailService — email dispatch and verification.
 */
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn()
      }
    }))
  };
});

describe('MailService', () => {
  let mockSend;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSend = mailService.resend.emails.send;
  });

  test('sendMail returns null and logs error on API failure', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'API Down' } });

    const result = await mailService.sendMail('to@example.com', 'Sub', '<p>Hi</p>');

    expect(result).toBeNull();
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      to: ['to@example.com'],
      subject: 'Sub'
    }));
  });

  test('sendMail returns data on success', async () => {
    mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });

    const result = await mailService.sendMail('to@example.com', 'Sub', '<p>Hi</p>');

    expect(result).toEqual({ id: 'email-123' });
  });

  test('sendVerificationCode formats HTML correctly', async () => {
    mockSend.mockResolvedValue({ data: { id: 'v-123' }, error: null });

    await mailService.sendVerificationCode('user@example.com', '123456');

    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      to: ['user@example.com'],
      subject: 'Verify your Musclo account',
      html: expect.stringContaining('123456')
    }));
  });

  test('sendResetCode formats HTML correctly', async () => {
    mockSend.mockResolvedValue({ data: { id: 'r-123' }, error: null });

    await mailService.sendResetCode('user@example.com', '654321');

    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      to: ['user@example.com'],
      subject: 'Reset your Musclo password',
      html: expect.stringContaining('654321')
    }));
  });
});
