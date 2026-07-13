package com.erpbanking;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {

    public static void main(String[] args) {

        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();

        String password = "sandra@01";

        String hash = encoder.encode(password);

        System.out.println(hash);
    }
}