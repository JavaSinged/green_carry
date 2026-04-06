package kr.co.iei.store.model.service;

import kr.co.iei.store.model.dao.StoreDao;
import kr.co.iei.store.model.vo.Menu;
import kr.co.iei.store.model.vo.MenuOption;
import kr.co.iei.store.model.vo.MenuSaveRequestDto;
import kr.co.iei.store.model.vo.Order;
import kr.co.iei.store.model.vo.OrderItem;
import kr.co.iei.store.model.vo.OrderListResponse;
import kr.co.iei.store.model.vo.OrderResponse;
import kr.co.iei.store.model.vo.Store;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class StoreService {
    @Autowired
    private StoreDao storeDao;

    public List<Store> selectAllStore() {
        return storeDao.selectAllStore();
    }

    public Store getStoreById(Integer storeId) {
        return storeDao.findStoreById(storeId);
    }
    public List<Menu> selectAllMenu(Long storeId) {
        return storeDao.selectAllMenu(storeId);
    }

    public List<MenuOption> getMenuOptions(Long menuId){
        return storeDao.getMenuOptions(menuId);
    }

    @Transactional
    public int insertOrder(Order order) {
        int result = storeDao.insertOrder(order);

        if (result != 1) {
            return 0;
        }

        int orderId = order.getOrderId();
        String memberId = order.getMemberId();

        List<OrderItem> list = order.getItems();

        // 1. 주문 상세
        if (list != null && !list.isEmpty()) {
            for (OrderItem orderItem : list) {
                int detailResult = storeDao.insertOrderDetail(orderItem, orderId);
                if (detailResult != 1) {
                    throw new RuntimeException("주문 상세 실패");
                }
            }
            int setPoint = storeDao.updatePoint(order);
            int addReduceCarbon = storeDao.addReduceCarbon(orderId);
        }

        // 2. 주문 이력
        int historyResult = storeDao.insertOrderHistory(orderId, memberId);
        if (historyResult != 1) {
            throw new RuntimeException("주문 이력 저장 실패");
        }

        return orderId;
    }

    public OrderResponse searchOrder(Integer orderId) {
        OrderResponse orderResponse = storeDao.searchOrderInfo(orderId);
        List<OrderItem> items = storeDao.searchOrderItems(orderId);
        if(orderResponse.getOrderStatus() == 0) {
        	int result = storeDao.updateOrderStatus(orderId);
        }
        orderResponse.setItems(items);
        return orderResponse;
    }

	public List<OrderListResponse> searchOrdersByMemberId(String memberId) {
		List<OrderListResponse> list = storeDao.searchOrdersByMemberId(memberId);
		return list;
	}

	public List<OrderResponse> searchOrderList(String memberId){
	    return storeDao.searchOrderList(memberId);
	}

	public Integer getStoreId(String memberId) {
		Integer storeId = storeDao.getStoreId(memberId);
		return storeId;
	}

	public List<MenuOption> getAllMenuOptions() {
		List<MenuOption> options = storeDao.getAllMenuOptions();
		return options;
	}

	@Transactional
	public int updateMenu(MenuSaveRequestDto dto) {
	    // 1. 메뉴 기본 정보 업데이트 (정상이라면 1 반환)
	    int updateResult = storeDao.updateMenu(dto);

	    // 업데이트할 메뉴가 없거나 실패했다면 바로 0 리턴 후 종료
	    if (updateResult == 0) {
	        return 0; 
	    }

	    // 2. 기존 매핑 정보 날리기 
	    
	    storeDao.deleteMenuOptions(dto.getMenuId());

	    // 3. 새로 입력한 옵션들(newOptions)이 있다면 DB에 넣고 ID 챙기기
	    if (dto.getNewOptions() != null && !dto.getNewOptions().isEmpty()) {
	        List<Long> newOptionIds = new ArrayList<>();
	        
	        for (MenuOption newOpt : dto.getNewOptions()) {
	            storeDao.insertNewOption(newOpt); 
	            newOptionIds.add(newOpt.getOptionNo());
	        }

	        // 기존 리스트와 병합
	        if (dto.getOptionIds() == null) {
	            dto.setOptionIds(new ArrayList<>());
	        }
	        dto.getOptionIds().addAll(newOptionIds);
	    }

	    // 4. 합쳐진 모든 옵션 ID들을 매핑 테이블에 저장
	    if (dto.getOptionIds() != null && !dto.getOptionIds().isEmpty()) {
	        
	        storeDao.insertMenuOptions(dto.getMenuId(), dto.getOptionIds());
	    }

	    
	    return 1;
	}

	public Menu getMenuById(Long menuId) {
		Menu menu = storeDao.getMenuById(menuId);
		return menu;
	}

	@Transactional
	public int insertMenu(MenuSaveRequestDto dto) {
	    // 1. 메뉴 기본 정보 저장
	    // insertMenu 실행 후 MyBatis의 selectKey에 의해 dto.menuId에 값이 채워집니다.
	    int result = storeDao.insertMenu(dto);
	    
	    if (result <= 0) return 0;

	    Long newMenuId = dto.getMenuId();

	    // 2. 신규 입력 옵션 처리 (newOptions)
	    if (dto.getNewOptions() != null && !dto.getNewOptions().isEmpty()) {
	        if (dto.getOptionIds() == null) {
	            dto.setOptionIds(new ArrayList<>());
	        }
	        
	        for (MenuOption newOpt : dto.getNewOptions()) {
	            storeDao.insertNewOption(newOpt); // option_tbl에 저장 (optionNo 생성됨)
	            dto.getOptionIds().add(newOpt.getOptionNo()); // 생성된 번호를 ID 리스트에 추가
	        }
	    }

	    // 3. 기존 옵션 + 신규 옵션들 매핑 테이블 저장
	    if (dto.getOptionIds() != null && !dto.getOptionIds().isEmpty()) {
	        storeDao.insertMenuOptions(newMenuId, dto.getOptionIds());
	    }

	    return 1;
	}

}
