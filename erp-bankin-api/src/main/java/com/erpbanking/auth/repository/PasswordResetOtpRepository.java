package com.erpbanking.auth.repository;

import com.erpbanking.auth.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {
    Optional<PasswordResetOtp> findTopByCinAndCodeAndUsedFalseOrderByCreatedAtDesc(String cin, String code);
    Optional<PasswordResetOtp> findTopByEmailAndCodeAndUsedFalseOrderByCreatedAtDesc(String email, String code);
    Optional<PasswordResetOtp> findTopByTelephoneAndCodeAndUsedFalseOrderByCreatedAtDesc(String telephone, String code);
    void deleteByCinOrEmailOrTelephone(String cin, String email, String telephone);
}
