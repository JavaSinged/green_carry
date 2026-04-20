package kr.co.iei.notification.controller; 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import kr.co.iei.notification.model.service.NotificationService;

@RestController
@RequestMapping("/api/notification")
@CrossOrigin(origins = "https://greencarry.vercel.app")
public class NotificationController {

	@Autowired
	private NotificationService notificationService;

	@GetMapping(value = "/subscribe", produces = "text/event-stream;charset=UTF-8")
	public SseEmitter subscribe(@RequestParam String memberId) {
		return notificationService.subscribe(memberId);
	}
}
