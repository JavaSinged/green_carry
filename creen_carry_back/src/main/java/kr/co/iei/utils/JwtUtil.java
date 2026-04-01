package kr.co.iei.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {
    // ⚠️ 실제 서비스 시에는 아주 길고 복잡한 문자열을 사용해야 합니다.
    private String secret = "your-very-secure-and-long-secret-key-for-greencarry-project";
    private SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());
    private long expire = 1000L * 60 * 60; // 유효시간 1시간

    public String createToken(String memberId, int memberGrade) {
        return Jwts.builder()
                .subject(memberId) // 토큰 주인
                .claim("memberGrade", memberGrade) // 커스텀 데이터(등급)
                .issuedAt(new Date()) // 생성 시간
                .expiration(new Date(System.currentTimeMillis() + expire)) // 만료 시간
                .signWith(key) // 서명
                .compact();
    }
}