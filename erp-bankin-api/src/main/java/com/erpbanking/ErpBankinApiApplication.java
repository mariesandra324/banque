package com.erpbanking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;


@SpringBootApplication
@EnableAsync
public class ErpBankinApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(ErpBankinApiApplication.class, args);
	}
	
}
