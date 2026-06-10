package com.bolt.clientmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ClientManagerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ClientManagerApplication.class, args);
	}

	@org.springframework.context.annotation.Bean
	public org.springframework.web.client.RestTemplate restTemplate() {
		return new org.springframework.web.client.RestTemplate();
	}

}
