package kr.co.iei.store.controller;

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

    @GetMapping("/{memberId}")
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
    
    
    //대시보드용 (memberId 로 storeId조회)
    @GetMapping(value="/id")
    public ResponseEntity<?> selectStoreId(@RequestParam String memberId){
    	StoreIdResponse storeId = storeService.selectStoreId(memberId);
    	if (storeId != null && storeId.getStoreId() != null) {
    		return ResponseEntity.ok(storeId);
          } else {
            return ResponseEntity.notFound().build();
          }
    }
   
    @GetMapping(value="/stats/order")
    public ResponseEntity<?> selectStatsOrderInfo(@RequestParam Integer storeId,@RequestParam String yearMonth ){
    	System.out.println("주문 통계 요청 - 상점ID: " + storeId + ", 조회월: " + yearMonth);
    	List<StatsOrderInfo> list = storeService.selectStatsOrderInfo(storeId,yearMonth );
    	if (list != null && !list.isEmpty()) {
            return ResponseEntity.ok(list); 
        } else {
            return ResponseEntity.noContent().build();
        }
    }
}

