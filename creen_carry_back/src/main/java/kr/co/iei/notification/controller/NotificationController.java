package kr.co.iei.notification.controller; // 이 경로가 실제 폴더 구조와 맞아야 합니다!

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import kr.co.iei.notification.model.service.NotificationService;


@RestController
@RequestMapping("/api/notification")
@CrossOrigin("*") 
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@RequestParam String memberId) {
        return notificationService.subscribe(memberId);
    }
}