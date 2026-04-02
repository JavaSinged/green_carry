package kr.co.iei.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 로컬에서 접근할 때와 마찬가지로 네트워크 경로를 매핑합니다.
        registry.addResourceHandler("/project/**")
                .addResourceLocations("file://192.168.31.26/project/");
    }
}