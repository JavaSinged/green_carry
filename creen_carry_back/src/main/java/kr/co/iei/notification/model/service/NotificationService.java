package kr.co.iei.notification.model.service; // 이 경로가 실제 폴더 구조와 맞아야 합니다!

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationService {

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String memberId) {
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

    public void sendNotification(String memberId, String eventName, String message) {
        SseEmitter emitter = emitters.get(memberId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(message));
            } catch (IOException e) {
                emitters.remove(memberId); 
            }
        }
    }
}