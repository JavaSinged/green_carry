package kr.co.iei.store.model.service;

import kr.co.iei.store.model.dao.StoreDao;
import kr.co.iei.store.model.vo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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

    public List<MenuOption> getMenuOptions(Long menuId) {
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


        // 5. 주문 이력 저장
        int historyResult = storeDao.insertOrderHistory(orderId, memberId);
        if (historyResult != 1) {
            throw new RuntimeException("주문 이력 저장 실패");
        }

        return orderId;
    }

    @Transactional
    public OrderResponse searchOrder(Integer orderId) {
        OrderResponse orderResponse = storeDao.searchOrderInfo(orderId);
        List<OrderItem> items = storeDao.searchOrderItems(orderId);
        if (orderResponse.getOrderStatus() == 0) {
            int result = storeDao.updateOrderStatus(orderId);
        }
        orderResponse.setItems(items);
        return orderResponse;
    }

    public List<OrderListResponse> searchOrdersByMemberId(String memberId) {
        return storeDao.searchOrdersByMemberId(memberId);
    }


    public List<OrderResponse> searchOrderList(String memberId) {
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
        List<StatsOrderInfo> list = storeDao.selectStatsOrderInfo(storeId, yearMonth);

        if (list == null || list.isEmpty()) {
            return list;
        }
        System.out.println("list확인: " + list);
        long totalAmount = list.stream().mapToLong(StatsOrderInfo::getSeriesAmount).sum();
        System.out.println(totalAmount);// 결과 예시: 1,178,909

        for (StatsOrderInfo order : list) {
            // 배달 수단 코드에 따라 이름(label) 설정 (프로젝트 규칙에 맞게 수정)
            switch (order.getDeliveryType()) {
                case 1:
                    order.setLabel("포장");
                    break;
                case 2:
                    order.setLabel("도보 & 자전거");
                    break;
                case 3:
                    order.setLabel("오토바이");
                    break;
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

	public int changeOrderStatus(Integer orderId, int status, Integer expectedTime) {
		int result;
		if(status == 9) {
			//주문 취소시 포인트 롤백
			int result1 = storeDao.rollbackPoint(orderId);
		    int result2 = storeDao.cancelOrder(orderId);
		    if(result2 == 2) {
		    	result = 1;
		    }else {
		    	result = 0;
		    }
		}else {
			//일반 주문 상태 변경
			result = storeDao.changeOrderStatus(orderId, status, expectedTime);
		}
		return result;
	}

	public Map<String, Object> selectStoreReviewStats(int storeId) {
		Map<String, Object> stats = storeDao.selectStoreReviewStats(storeId);
		return stats;
	}

	public int insertReviewComment(Map<String, Object> payload) {
		int result = storeDao.insertReviewComment(payload);
		return result;
    }
	public List<StoreOperating> getStoreOperatingHours(Integer storeId) {

		return storeDao.getStoreOperatingHours(storeId);
	}

	public String getMemberIdByOrderId(Integer orderId) {
	    
	    return storeDao.getMemberIdByOrderId(orderId);
	}
@Transactional
	public int updatePoint(Integer orderId) {
		// 3. 🌟 포인트 적립 및 사용 (가장 중요!)
        // 이 부분은 상세 내역 저장 여부와 상관없이 주문이 성공했다면 실행되어야 합니다.
        int setPoint = storeDao.updatePoint(orderId);
        if (setPoint != 1) {
            System.out.println("포인트 적립/사용 처리 실패");
            return 0;
        }else {
        	storeDao.pointReward(orderId);
        	storeDao.addReduceCarbon(orderId);
    		return setPoint;
        }

        // 4. 탄소 절감량(명예 점수) 누적 업데이트
        
	}

    public List<OrderResponse> getOrdersByStoreId(Integer storeId) {
        List<OrderResponse> list = storeDao.getOrdersByStoreId(storeId);
        return list;

    }

    public List<StoreReviewResponse> selectStoreReviews(Integer storeId) {
        List<StoreReviewResponse> list = storeDao.selectStoreReviews(storeId);
        return list;
    }


    @Transactional // 도중에 에러나면 롤백되도록 트랜잭션 처리
    public void updateStoreInfoAndHours(StoreSaveRequest req) {
        // 1. STORE_TBL 정보 업데이트
        storeDao.updateStore(req);

        // 2. 기존 OPERATING_HOURS_TBL 정보 전체 삭제 (초기화)
        storeDao.deleteOperatingHours(req.getStoreId());

        // 3. 새 영업시간 데이터 구성
        List<StoreOperating> hoursList = new ArrayList<>();
        HoursInfo hoursInfo = req.getHoursInfo();
        String[] allDays = {"mon", "tue", "wed", "thu", "fri", "sat", "sun"};

        // 3-1. 기본 영업시간 7일 세팅 (weekOfMonth = 0)
        for (String day : allDays) {
            StoreOperating dto = new StoreOperating();
            dto.setStoreId(req.getStoreId());
            dto.setDayOfWeek(day);
            dto.setWeekOfMonth(0); // 매주 기본값

            if (hoursInfo.getHoursType().equals("same")) {
                if (hoursInfo.is24h()) {
                    dto.setOpenTime("00:00");
                    dto.setCloseTime("24:00");
                    dto.setIsDayOff("N");
                } else {
                    dto.setOpenTime(hoursInfo.getSameTime().get("startH") + ":" + hoursInfo.getSameTime().get("startM"));
                    dto.setCloseTime(hoursInfo.getSameTime().get("endH") + ":" + hoursInfo.getSameTime().get("endM"));
                    dto.setIsDayOff("N");
                }
            } else {
                // 요일별 다름 (diff)
                DiffTime diffDay = hoursInfo.getDiffTimes().stream()
                        .filter(d -> d.getDay().equals(day)).findFirst().orElse(null);

                if (diffDay != null && diffDay.isOpen()) {
                    dto.setOpenTime(diffDay.getStartH() + ":" + diffDay.getStartM());
                    dto.setCloseTime(diffDay.getEndH() + ":" + diffDay.getEndM());
                    dto.setIsDayOff("N");
                } else {
                    // 체크 해제된 요일은 정기 휴무
                    dto.setIsDayOff("Y");
                }
            }
            hoursList.add(dto);
        }

        // 3-2. 정기 휴무일 추가 세팅 (restDays)
        if (hoursInfo.getRestDays() != null) {
            for (RestDay restDay : hoursInfo.getRestDays()) {
                StoreOperating dto = new StoreOperating();
                dto.setStoreId(req.getStoreId());
                dto.setDayOfWeek(restDay.getDay());
                dto.setIsDayOff("Y"); // 무조건 휴무

                // weekMonth 매핑 (week=0, month=0(특정 로직 필요시 조정), week2=1 등 프론트 값에 맞춰 파싱)
                int weekNum = parseWeekMonth(restDay.getWeekMonth());
                dto.setWeekOfMonth(weekNum);

                hoursList.add(dto);
            }
        }

        // 4. DB에 영업시간 리스트 반복 Insert
        for (StoreOperating hours : hoursList) {
            storeDao.insertOperatingHours(hours);
        }
    }

    private int parseWeekMonth(String val) {
        return switch (val) {
            case "week1" -> 1; // 첫째주
            case "week2" -> 2; // 둘째주
            case "week3" -> 3; // 셋째주
            case "week4" -> 4; // 넷째주
            default -> 0; // week(매주)
        };
    }

    // DAO의 매개변수가 Integer이므로 매개변수 타입을 Integer로 맞춥니다.
    public Store getStoreInfo(Integer storeId) {

        // 1. 가게 기본 정보 조회 (mapper의 findStoreById 사용)
        Store storeInfo = storeDao.findStoreById(storeId);

        if (storeInfo != null) {
            // 2. 해당 가게의 영업시간 및 휴무일 리스트 조회 (mapper의 getStoreOperatingHours 사용)
            List<StoreOperating> hoursList = storeDao.getStoreOperatingHours(storeId);

            // 3. 가게 정보 객체에 영업시간 리스트 삽입
            storeInfo.setOperatingHours(hoursList);
        }

        return storeInfo;
    }

	public Store getStoreLocation(Integer storeId) {
		Store store = storeDao.getStoreLocation(storeId);
		return store;
	}

}
