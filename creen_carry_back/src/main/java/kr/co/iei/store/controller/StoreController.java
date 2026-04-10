package kr.co.iei.store.controller;

import kr.co.iei.notification.model.service.NotificationService;
import kr.co.iei.store.model.service.StoreService;
import kr.co.iei.store.model.vo.Menu;
import kr.co.iei.store.model.vo.MenuOption;
import kr.co.iei.store.model.vo.MenuSaveRequest;
import kr.co.iei.store.model.vo.Order;
import kr.co.iei.store.model.vo.OrderItem;
import kr.co.iei.store.model.vo.OrderListResponse;
import kr.co.iei.store.model.vo.OrderResponse;
import kr.co.iei.store.model.vo.StatsOrderInfo;
import kr.co.iei.store.model.vo.Store;

import kr.co.iei.store.model.vo.StoreIdResponse;

import kr.co.iei.store.model.vo.StoreReviewResponse;

import org.apache.ibatis.type.Alias;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/stores")
@CrossOrigin("*")
public class StoreController {
	@Autowired
	private StoreService storeService;

	@Autowired
	private NotificationService notificationService;

	@GetMapping
	public ResponseEntity<?> getStores() {
		List<Store> list = storeService.selectAllStore();
		return ResponseEntity.ok(list);
	}

	@GetMapping("/{storeId:[0-9]+}")
	public ResponseEntity<?> getStoreDetail(@PathVariable Integer storeId) {
		Store store = storeService.getStoreById(storeId);

		if (store == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(store);
	}

	@GetMapping("/member/{memberId}")
	public ResponseEntity<?> getStoreByMemberId(@PathVariable String memberId) {
		Store store = storeService.getStoreByMemberId(memberId);
		return ResponseEntity.ok(store);
	}

	@GetMapping("/{storeId}/menus")
	public ResponseEntity<?> getMenuList(@PathVariable Long storeId) {
		// 서비스 호출
		List<Menu> menuList = storeService.selectAllMenu(storeId);

		// 데이터가 없어도 빈 배열([])을 담아 200 OK 응답 (프론트 에러 방지)
		return ResponseEntity.ok(menuList);
	}

	@GetMapping("/{menuId}/options")
	public ResponseEntity<List<MenuOption>> getOptionsByMenu(@PathVariable Long menuId) {
		List<MenuOption> options = storeService.getMenuOptions(menuId);
		return ResponseEntity.ok(options);
	}

	@PostMapping("/order")
	public ResponseEntity<?> insertOrder(@RequestBody Order orderData) {
		System.out.println(orderData);
		int orderId = storeService.insertOrder(orderData);
		return ResponseEntity.ok(orderId);
	}

	@GetMapping("/order/{orderId}")
	public ResponseEntity<?> searchOrder(@PathVariable Integer orderId) {
		OrderResponse orderResponse = storeService.searchOrder(orderId);
		return ResponseEntity.ok(orderResponse);
	}

	@GetMapping("/orders/owner/{storeId}")
	public ResponseEntity<?> getStoreOrders(@PathVariable Integer storeId) {
		List<OrderResponse> list = storeService.getOrdersByStoreId(storeId);
		return ResponseEntity.ok(list);
	}

	@GetMapping("/orders/{memberId}")
	public ResponseEntity<?> searchOrderList(@PathVariable String memberId) {
		List<OrderResponse> list = storeService.searchOrderList(memberId);
		return ResponseEntity.ok(list);
	}

	@GetMapping("/orders/itemImg/{menuId}")
	public ResponseEntity<String> getMenuImage(@PathVariable int menuId) {
		String imagePath = storeService.getMenuImageById(menuId);
		return ResponseEntity.ok(imagePath);
	}

	// 대시보드용 (memberId 로 storeId조회)
	@GetMapping(value = "/id")
	public ResponseEntity<?> selectStoreId(@RequestParam String memberId) {
		StoreIdResponse storeId = storeService.selectStoreId(memberId);
		if (storeId != null && storeId.getStoreId() != null) {
			return ResponseEntity.ok(storeId);
		} else {
			return ResponseEntity.notFound().build();
		}
	}

	@GetMapping(value = "/stats/order")
	public ResponseEntity<?> selectStatsOrderInfo(@RequestParam Integer storeId, @RequestParam String yearMonth) {
		System.out.println("주문 통계 요청 - 상점ID: " + storeId + ", 조회월: " + yearMonth);
		List<StatsOrderInfo> list = storeService.selectStatsOrderInfo(storeId, yearMonth);
		if (list != null && !list.isEmpty()) {
			return ResponseEntity.ok(list);
		} else {
			return ResponseEntity.noContent().build();
		}
	}

	@GetMapping("/stats/review")
	public ResponseEntity<Map<String, Object>> getReviewStats(@RequestParam int storeId) {
		// service -> dao를 거쳐 위에서 만든 selectStoreReviewStats 결과 반환
		Map<String, Object> stats = storeService.selectStoreReviewStats(storeId);
		return ResponseEntity.ok(stats);
	}

	@GetMapping("/reviews/{storeId}")
	public ResponseEntity<?> getStoreReviews(@PathVariable Integer storeId) {
		List<StoreReviewResponse> list = storeService.selectStoreReviews(storeId);
		return ResponseEntity.ok(list);
	}

	@PostMapping("/review/comment")
	public ResponseEntity<?> insertReviewComment(@RequestBody Map<String, Object> payload) {
		// 1. 프론트에서 보낸 데이터 꺼내기 (reviewId, commentContent 등)
		// 💡 VO(객체)를 따로 만드셨다면 @RequestBody ReviewCommentVO vo 형태로 받으셔도 됩니다.

		System.out.println("사장님 답글 요청 데이터: " + payload);

		// 2. 서비스 호출 (답글 저장 로직)
		// 예: int result = storeService.insertReviewComment(payload);
		int result = storeService.insertReviewComment(payload);

		if (result > 0) {
			return ResponseEntity.ok("답글이 등록되었습니다.");
		} else {
			return ResponseEntity.internalServerError().body("답글 등록 실패");
		}
	}

	@PatchMapping("/order/{orderId}/status")
	public ResponseEntity<?> changeOrderStatus(@PathVariable Integer orderId,
			@RequestBody Map<String, Object> payload) {

		// 리액트에서 보낸 status와 expectedTime 꺼내기
		int status = Integer.parseInt(payload.get("status").toString());

		// expectedTime은 수락 단계에서만 들어오므로 null 체크 필요
		Integer expectedTime = null;
		if (payload.get("expectedTime") != null) {
			expectedTime = Integer.parseInt(payload.get("expectedTime").toString());
		}

		// 서비스 호출 (상태값과 예상 시간을 넘겨줍니다)
		int result = storeService.changeOrderStatus(orderId, status, expectedTime);

		if (result > 0) {
			// 2. 🔥 여기서 마법 시작! orderId로 memberId를 직접 조회합니다.
			// storeService에 getMemberIdByOrderId 메서드를 하나 만드세요.
			String memberId = storeService.getMemberIdByOrderId(orderId);

			// 3. 알림 대상(4, 5, 9번 상태)이면 알림 발송
			if (memberId != null && (status == 2 || status == 4 || status == 5 || status == 9)) {
				String message = "";
				if(status == 2)
					message = "주문이 접수되었습니다. 약 "+expectedTime+"분 뒤 조리가 완료됩니다.";
				else if (status == 4)
					message = "메뉴가 준비되었습니다! 픽업/배달을 확인해주세요.";
				else if (status == 5)
					message = "맛있게 드셨나요? 픽업/배달이 완료되었습니다. 🌿";
				else if (status == 9)
					message = "주문이 취소되었습니다. 다시 확인 부탁드립니다.";

				notificationService.sendNotification(memberId, "orderUpdate", message);
			}
			return ResponseEntity.ok("상태 변경 성공");
		} else {
			return ResponseEntity.internalServerError().body("상태 변경 실패");
		}
	}
}
