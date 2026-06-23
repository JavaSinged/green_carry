package kr.co.iei.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class BrevoConfig {

    @Bean
    public RestClient brevoRestClient(
            RestClient.Builder builder,
            @Value("${brevo.api-key}") String apiKey
    ) {
        return builder
                .baseUrl("https://api.brevo.com/v3")
                .defaultHeader("accept", "application/json")
                .defaultHeader("api-key", apiKey)
                .defaultHeader("content-type", "application/json")
                .build();
    }
}
