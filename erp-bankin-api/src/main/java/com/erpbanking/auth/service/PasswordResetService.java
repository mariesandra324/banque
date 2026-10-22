package com.erpbanking.auth.service;

import com.erpbanking.auth.dto.*;

public interface PasswordResetService {
    MobileForgotPasswordResponse forgotPassword(MobileForgotPasswordRequest request);
    MobileVerifyOtpResponse verifyOtp(MobileVerifyOtpRequest request);
    MobileResetPasswordOtpResponse resetPassword(MobileResetPasswordOtpRequest request);
}
