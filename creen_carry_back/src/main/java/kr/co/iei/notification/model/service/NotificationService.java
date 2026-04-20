package kr.co.iei.notification.model.service; // 이 경로가 실제 폴더 구조와 맞아야 합니다!

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationService {

	private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

	public SseEmitter subscribe(String memberId) {
		// 1. 이미 연결된 정보가 있다면 종료시키고 새로 생성
		if (emitters.containsKey(memberId)) {
			emitters.get(memberId).complete();
			emitters.remove(memberId);
		}

		SseEmitter emitter = new SseEmitter(60 * 60 * 1000L);
		emitters.put(memberId, emitter);

		emitter.onCompletion(() -> emitters.remove(memberId));
		emitter.onTimeout(() -> emitters.remove(memberId));
		emitter.onError((e) -> emitters.remove(memberId));

		try {
			emitter.send(SseEmitter.event().name("connect").data("connected!"));
		} catch (IOException e) {
			emitters.remove(memberId);
		}

		return emitter;
	}

	public void sendNotification(String memberId, String eventName, String message, String navUrl) {
		SseEmitter emitter = emitters.get(memberId);
		Map<String, Object> data = new HashMap<>();
		data.put("message", message);
		data.put("navUrl", navUrl);
		if (emitter != null) {
			try {
				emitter.send(SseEmitter.event().name(eventName).data(data));
			} catch (IOException e) {
				emitters.remove(memberId);
			}
		}
	}

	@Scheduled(fixedRate = 30000)
	public void sendHeartbeat() {
		emitters.forEach((memberId, emitter) -> {
			try {
				emitter.send(SseEmitter.event().name("ping") // 이벤트 이름을 "ping" 혹은 "heartbeat"로
						.data("heartbeat"));
			} catch (IOException e) {
				emitters.remove(memberId);
			}
		});
	}
}