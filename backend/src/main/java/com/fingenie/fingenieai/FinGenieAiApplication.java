package com.fingenie.fingenieai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class FinGenieAiApplication {

	public static void main(String[] args) {
		SpringApplication.run(FinGenieAiApplication.class, args);
	}

}
