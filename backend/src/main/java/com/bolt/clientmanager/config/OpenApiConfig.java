package com.bolt.clientmanager.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Bolt Client Manager API")
                        .version("1.0.0")
                        .description("REST API for registration, update, soft deletion, and listing of clients.")
                        .contact(new Contact()
                                .name("Bolt Support")
                                .email("support@bolt.com")));
    }
}
