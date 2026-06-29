package kr.co.iei;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"CLOUDINARY_CLOUD_NAME=test-cloud",
		"CLOUDINARY_API_KEY=test-key",
		"CLOUDINARY_API_SECRET=test-secret",
		"BREVO_API_KEY=test-brevo-key",
		"BREVO_SENDER_EMAIL=test@example.com",
		"BREVO_SENDER_NAME=GreenCarry Test"
})
class CreenCarryBackApplicationTests {

    @Test
    void contextLoads() {
    }

}
