package kr.co.iei.store.model.service;

import kr.co.iei.store.model.dao.StoreDao;
import kr.co.iei.store.model.vo.Menu;
import kr.co.iei.store.model.vo.MenuOption;
import kr.co.iei.store.model.vo.MenuSaveRequest;
import kr.co.iei.store.model.vo.Order;
import kr.co.iei.store.model.vo.OrderItem;
import kr.co.iei.store.model.vo.OrderListObject;
import kr.co.iei.store.model.vo.OrderListResponse;
import kr.co.iei.store.model.vo.OrderResponse;
import kr.co.iei.store.model.vo.StatsOrderInfo;
import kr.co.iei.store.model.vo.ReviewComment;
import kr.co.iei.store.model.vo.SaleMonth;
import kr.co.iei.store.model.vo.Store;
import kr.co.iei.store.model.vo.StoreIdResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.ArrayList;
import java.util.List;

@Service
public class StoreService {
    @Autowired
    private StoreDao storeDao;

    public List<Store> selectAllStore() {
        List<Store> list = storeDao.selectAllStore();

        for (Store store : list) {
            List<SaleMonth> monthlySalesList = storeDao.selectMonthlySalesByStoreId(store.getStoreId());
            store.setSaleMonth(monthlySalesList);
        }

        return list;
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
            // 임시 주석
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
        return storeDao.searchOrdersByMemberId(memberId);
	}


	public List<OrderResponse> searchOrderList(String memberId){
		List<OrderResponse> list = storeDao.searchOrderList(memberId);
	System.out.println(list);
		return list;

	}

	public Store getStoreByMemberId(String memberId) {
		return storeDao.findStoreByMemberId(memberId);
	}

	public String getMenuImageById(int menuId) {
		String imagePath = storeDao.getMenuImageById(menuId);
        return imagePath;
	}
	
	public StoreIdResponse selectStoreId(String memberId) {
		StoreIdResponse storeId = storeDao.selectStoreId(memberId); 
		return storeId;
	}

	public List<StatsOrderInfo> selectStatsOrderInfo(Integer storeId, String yearMonth) {
		List<StatsOrderInfo> list = storeDao.selectStatsOrderInfo(storeId,yearMonth);
		
		if(list == null || list.isEmpty()) {
			return list;
		}
		System.out.println("list확인: "+ list);
		long totalAmount = list.stream().mapToLong(StatsOrderInfo::getSeriesAmount).sum();
		System.out.println(totalAmount);// 결과 예시: 1,178,909 
		
		for (StatsOrderInfo order : list) {
            // 배달 수단 코드에 따라 이름(label) 설정 (프로젝트 규칙에 맞게 수정)
            switch (order.getDeliveryType()) {
                case 1: order.setLabel("포장"); break; 
                case 2: order.setLabel("도보 & 자전거"); break; 
                case 3: order.setLabel("오토바이"); break; 
            }

            // 퍼센트 계산 (총 금액 대비 비율)
            if (totalAmount > 0) {
                double percent = (double) order.getSeriesAmount() / totalAmount * 100;
                // 소수점 첫째 자리까지 반올림 (예: 90.0)
                order.setPercent(Math.round(percent * 10) / 10.0);
            } else {
                order.setPercent(0.0);
            }
        }
		return list;
    
		
		
		
		
	}
}
