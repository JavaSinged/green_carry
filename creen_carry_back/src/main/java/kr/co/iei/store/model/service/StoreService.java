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

import kr.co.iei.store.model.vo.StoreReviewResponse;


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
            Long totalSales = storeDao.selectTotalSales(store.getStoreId());
            store.setSaleMonth(monthlySalesList);
            System.out.println(totalSales);
            store.setTotalSale(totalSales);
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
        // 1. 주문 메인 저장
        int result = storeDao.insertOrder(order);
        if (result != 1) return 0;

        int orderId = order.getOrderId();
        String memberId = order.getMemberId();
        List<OrderItem> list = order.getItems();

        // 2. 주문 상세 저장
        if (list != null && !list.isEmpty()) {
            for (OrderItem orderItem : list) {
                int detailResult = storeDao.insertOrderDetail(orderItem, orderId);
                if (detailResult != 1) {
                    throw new RuntimeException("주문 상세 저장 중 오류 발생");
                }
            }
        }

        // 3. 🌟 포인트 적립 및 사용 (가장 중요!)
        // 이 부분은 상세 내역 저장 여부와 상관없이 주문이 성공했다면 실행되어야 합니다.
        int setPoint = storeDao.updatePoint(order);
        if (setPoint != 1) {
            throw new RuntimeException("포인트 적립/사용 처리 실패");
        }

        // 4. 탄소 절감량(명예 점수) 누적 업데이트
        storeDao.addReduceCarbon(orderId);

        // 5. 주문 이력 저장
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


	public List<OrderResponse> getOrdersByStoreId(Integer storeId) {
		List<OrderResponse> list = storeDao.getOrdersByStoreId(storeId);
        return list;

	}

	public List<StoreReviewResponse> selectStoreReviews(Integer storeId) {
		List<StoreReviewResponse> list = storeDao.selectStoreReviews(storeId);
		return list;
	}

	public int changeOrderStatus(Integer orderId, int status, Integer expectedTime) {
		int result = storeDao.changeOrderStatus(orderId, status, expectedTime);
		return result;
	}
}
