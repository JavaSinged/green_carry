package kr.co.iei.store.controller;

import kr.co.iei.store.model.service.StoreService;
import kr.co.iei.store.model.vo.Menu;
import kr.co.iei.store.model.vo.MenuOption;
import kr.co.iei.store.model.vo.MenuSaveRequestDto;
import kr.co.iei.store.model.vo.Order;
import kr.co.iei.store.model.vo.OrderItem;
import kr.co.iei.store.model.vo.OrderListResponse;
import kr.co.iei.store.model.vo.OrderResponse;
import kr.co.iei.store.model.vo.ReviewComment;
import kr.co.iei.store.model.vo.Store;
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

    
    @GetMapping
    public ResponseEntity<?> getStores() {
        List<Store> list = storeService.selectAllStore();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{storeId}")
    public ResponseEntity<Store> getStoreDetail(@PathVariable Integer storeId) {
        Store store = storeService.getStoreById(storeId);

        if (store == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(store);
    }

    @GetMapping("/{storeId}/menus")
    public ResponseEntity<List<Menu>> getMenuList(@PathVariable Long storeId) {
        // 서비스 호출
        List<Menu> menuList = storeService.selectAllMenu(storeId);

        // 데이터가 없어도 빈 배열([])을 담아 200 OK 응답 (프론트 에러 방지)
        return ResponseEntity.ok(menuList);
    }
    @GetMapping("/options/all")
    public ResponseEntity<?> getAllOptions(){
    	List<MenuOption> options = storeService.getAllMenuOptions();
    	System.out.println(options);
    	return ResponseEntity.ok(options);
    }
    
    @GetMapping("/{menuId}/options")
    public ResponseEntity<List<MenuOption>> getOptionsByMenu(@PathVariable Long menuId) {
        List<MenuOption> options = storeService.getMenuOptions(menuId);
        return ResponseEntity.ok(options);
    }

    @PostMapping("/order")
    public ResponseEntity<?> insertOrder(@RequestBody Order orderData){
    	System.out.println(orderData);
    	int orderId = storeService.insertOrder(orderData);
    	return ResponseEntity.ok(orderId);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> searchOrder(@PathVariable Integer orderId){
        OrderResponse orderResponse = storeService.searchOrder(orderId);
        return ResponseEntity.ok(orderResponse);
    }
    
    @GetMapping("/orders/{memberId}")
    public ResponseEntity<?> searchOrderList(@PathVariable String memberId){
        List<OrderResponse> list = storeService.searchOrderList(memberId);
        return ResponseEntity.ok(list);
    }
    @GetMapping("/myStore")
    public ResponseEntity<?> getStoreId(@RequestParam("memberId") String memberId){
    	Integer storeId = storeService.getStoreId(memberId);
    	System.out.println(storeId);
    	if (storeId == null) {
            return ResponseEntity.ok(null); 
        }
    	Store store = storeService.getStoreById(storeId);
    	return ResponseEntity.ok(store);
    }
    @PutMapping("/menus/{menuId}")
    public ResponseEntity<?> updateMenu(@PathVariable Long menuId,@RequestBody MenuSaveRequestDto dto){
    	dto.setMenuId(menuId);
		int result = storeService.updateMenu(dto);
    	
    	return ResponseEntity.ok(result);
    	
    }
 // 1. 신규 메뉴 등록 (POST)
    @PostMapping
    public ResponseEntity<?> insertMenu(@RequestBody MenuSaveRequestDto dto) {
        try {
            // 새 메뉴 저장 로직
            storeService.insertMenu(dto);
            return ResponseEntity.ok("메뉴가 등록되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("등록 실패: " + e.getMessage());
        }
    }
    
    @GetMapping("/menu/{menuId}")
    public ResponseEntity<?> getMenuById(@PathVariable Long menuId) {
        // DB에서 menuId가 1인 메뉴 정보를 1줄 가져오는 로직 (기존 dao나 xml에 추가 필요)
        Menu menu = storeService.getMenuById(menuId); 
        
        if (menu == null) {
            return ResponseEntity.notFound().build(); // 없으면 404 리턴
        }
        return ResponseEntity.ok(menu); // 있으면 200 OK와 함께 데이터 리턴
    }
    
    @GetMapping("/reviews/{storeId}")
    public ResponseEntity<?> getStoreReviews(@PathVariable int storeId) {
    	System.out.println("리뷰 조회 시도...");
        try {
            List<StoreReviewResponse> list = storeService.selectStoreReviews(storeId);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("SERVER_ERROR");
        }
    }

    // 2. 사장님 답글 등록
    @PostMapping("/review/comment")
    public ResponseEntity<?> insertReviewComment(@RequestBody ReviewComment comment) {
        System.out.println("도착한 사장님 답글 데이터: " + comment); // 데이터 확인용

        try {
            int result = storeService.insertReviewComment(comment);
            if (result > 0) {
                return ResponseEntity.ok("SUCCESS");
            } else {
                return ResponseEntity.badRequest().body("FAIL");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("SERVER_ERROR");
        }
    }
    
 // 사장님(매장) 주문 목록 불러오기 API
    @GetMapping("/owner/orders/{storeId}")
    public ResponseEntity<List<OrderResponse>> getStoreOrders(@PathVariable int storeId) {
        List<OrderResponse> list = storeService.getOrdersByStoreId(storeId);
        return ResponseEntity.ok(list);
    }

    // 주문 상태 변경 API (접수, 조리중, 취소 등)
    @PatchMapping("/order/{orderId}/status")
    public ResponseEntity<String> changeOrderStatus(
            @PathVariable int orderId, 
            @RequestBody Map<String, Object> requestBody) { // Integer 대신 Object로 변경 (다양한 타입 대응)
        
    	// 1. status 꺼내기 (숫자로 안전하게 변환)
        int status = Integer.parseInt(String.valueOf(requestBody.get("status")));
        
        // 2. expectedTime 꺼내기 (문자열 "24"를 숫자 24로 변환)
        Integer expectedTime = null;
        if (requestBody.containsKey("expectedTime") && requestBody.get("expectedTime") != null) {
            // String.valueOf를 거쳐 Integer.parseInt를 쓰면 "24"와 24 모두 안전하게 처리됩니다.
            expectedTime = Integer.parseInt(String.valueOf(requestBody.get("expectedTime")));
        }
        
        int result = storeService.changeOrderStatus(orderId, status, expectedTime);
        
        if(result > 0) {
            return ResponseEntity.ok("success");
        } else {
            return ResponseEntity.badRequest().body("fail");
        }
    }
}
