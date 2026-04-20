package kr.co.iei.common.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.co.iei.utils.JwtUtil;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	@Autowired
	private JwtUtil jwtUtil;

	@Autowired
	private StringRedisTemplate redisTemplate;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		// 1. 헤더에서 토큰 추출
		String authHeader = request.getHeader("Authorization");
		String token = null;
		String memberId = null;

		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			token = authHeader.substring(7);
			if (jwtUtil.validateToken(token)) {
				memberId = jwtUtil.getMemberIdFromToken(token);
			}
		}

		// 2. 중복 로그인 체크 핵심 로직
		if (memberId != null) {
			// Redis에서 해당 유저의 '최신' 토큰 조회
			String latestToken = redisTemplate.opsForValue().get("AUTH:" + memberId);

			// Redis에 토큰이 있는데 현재 토큰과 다르다면? -> 누군가 새로 로그인해서 내 토큰이 밀려남
			if (latestToken != null && !token.equals(latestToken)) {
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 에러
				response.setContentType("application/json;charset=UTF-8");
				response.getWriter().write("{\"code\":\"DUPLICATE_LOGIN\"}");
				return; // 여기서 차단! (다음 필터나 컨트롤러로 안 보냄)
			}
		}

		filterChain.doFilter(request, response);
	}
}
