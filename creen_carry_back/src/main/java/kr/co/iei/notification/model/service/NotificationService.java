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

	//sse emitter연결
	public SseEmitter subscribe(String memberId) {
		
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

	//noti sender
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

	//ping sender (신호없는 연결 프록시가 끊는걸 방지)
	@Scheduled(fixedRate = 30000)
	public void sendPing() {
		emitters.forEach((memberId, emitter) -> {
			try {
				emitter.send(SseEmitter.event().name("ping") 
						.data("heartbeat"));
			} catch (IOException e) {
				emitters.remove(memberId);
			}
		});
	}
}