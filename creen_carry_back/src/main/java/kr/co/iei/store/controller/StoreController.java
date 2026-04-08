package kr.co.iei.store.controller;

import kr.co.iei.store.model.service.StoreService;
import kr.co.iei.store.model.vo.Menu;
import kr.co.iei.store.model.vo.MenuOption;
import kr.co.iei.store.model.vo.MenuSaveRequest;
import kr.co.iei.store.model.vo.Order;
import kr.co.iei.store.model.vo.OrderItem;
import kr.co.iei.store.model.vo.OrderListResponse;
import kr.co.iei.store.model.vo.OrderResponse;
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
        return  ResponseEntity.ok(store);
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
    @GetMapping("/orders/owner/{storeId}")
    public ResponseEntity<?> getStoreOrders(@PathVariable Integer storeId) {
        List<OrderResponse> list = storeService.getOrdersByStoreId(storeId);
        return ResponseEntity.ok(list);
    }
    
    @GetMapping("/orders/{memberId}")
    public ResponseEntity<?> searchOrderList(@PathVariable String memberId){
        List<OrderResponse> list = storeService.searchOrderList(memberId);
        return ResponseEntity.ok(list);
    }
    @GetMapping("/orders/itemImg/{menuId}")
    public ResponseEntity<String> getMenuImage(@PathVariable int menuId) {
        String imagePath = storeService.getMenuImageById(menuId);
        return ResponseEntity.ok(imagePath);
    }
    @GetMapping("/reviews/{storeId}")
    public ResponseEntity<?> getStoreReviews(@PathVariable Integer storeId) {
        List<StoreReviewResponse> list = storeService.selectStoreReviews(storeId);
        return ResponseEntity.ok(list);
    }
    
    @PatchMapping("/order/{orderId}/status")
    public ResponseEntity<?> changeOrderStatus(
            @PathVariable Integer orderId, 
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
            return ResponseEntity.ok("상태 변경 성공");
        } else {
            return ResponseEntity.internalServerError().body("상태 변경 실패");
        }
    }
}