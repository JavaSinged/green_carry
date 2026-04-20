package kr.co.iei.common.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {



	@Bean
	public BCryptPasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.cors(cors -> {
		}) // WebConfig의 CORS 설정을 따름
				.csrf(csrf -> csrf.disable())
				// 🌟 1. JWT를 사용하므로 서버에서 세션을 생성하거나 유지하지 않음
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/member/login", "/member/userSignup", "/member/findId", "/member/checkMember",
								"/member/resetPw", "/member/sendAuthCode", "/member/verifyCode", "/member/exists","/member/email-verification",
								"/member/storeDupCheck","/member/emailDupCheck","/member/signupManager", "/member/community-carbon", "/member",
								"/project/**")
						.permitAll() // 누구나
						// 접근
						// 가능
						.anyRequest().authenticated() // 그 외 모든 요청은 인증 필요
				).formLogin(form -> form.disable()).httpBasic(basic -> basic.disable());
				// 🌟 2. 우리가 만든 중복 로그인 체크 필터를 시큐리티 필터 체인에 추가
				//.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}
