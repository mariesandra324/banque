package com.erpbanking;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordTest {
    public static void main(String[] args) {


        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();


        String password = "sandra@01";


        String hash = "$2a$10$aOUOZ9I6wo5KoASZwxbnguJvV79U07Kpq9D0Xk0Z65dUx3xqvzdxe";


        System.out.println(
                encoder.matches(password, hash)
        );

    }
}
