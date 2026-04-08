package kr.co.iei.store.model.dao;

import kr.co.iei.store.model.vo.Menu;
import kr.co.iei.store.model.vo.MenuOption;
import kr.co.iei.store.model.vo.MenuSaveRequest;
import kr.co.iei.store.model.vo.Order;
import kr.co.iei.store.model.vo.OrderItem;
import kr.co.iei.store.model.vo.OrderListObject;
import kr.co.iei.store.model.vo.OrderListResponse;
import kr.co.iei.store.model.vo.OrderResponse;
import kr.co.iei.store.model.vo.StatsOrderInfo;
import kr.co.iei.store.model.vo.Store;
import kr.co.iei.store.model.vo.StoreIdResponse;
import kr.co.iei.store.model.vo.ReviewComment;
import kr.co.iei.store.model.vo.SaleMonth;
import kr.co.iei.store.model.vo.Store;
import kr.co.iei.store.model.vo.StoreReviewResponse;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface StoreDao {
	List<Store> selectAllStore();

	Store findStoreById(Integer storeId);

	List<Menu> selectAllMenu(Long storeId);

	List<MenuOption> getMenuOptions(Long menuId);

	int insertOrder(Order order);


	int insertOrderHistory(@Param("orderId") int orderId, @Param("memberId") String memberId);

	OrderResponse searchOrderInfo(Integer orderId);

	List<OrderItem> searchOrderItems(Integer orderId);

	List<OrderListResponse> searchOrdersByMemberId(String memberId);

	List<OrderResponse> searchOrderList(String memberId);

	int insertOrderDetail(
		    @Param("orderItem") OrderItem orderItem,
		    @Param("orderId") int orderId
		);
	int getTotalCarbonPoint(String memberId);


	int cancelOrder(Integer orderId);

	OrderListObject selectOrderListObject(String memberId);

	int[] selectOrderList(String memberId);


	int updatePoint(Order order);

	int addReduceCarbon(int orderId);

	int updateOrderStatus(Integer orderId);

    Store findStoreByMemberId(String memberId);
    
    String getMenuImageById(int menuId);

    StoreIdResponse selectStoreId(String memberId);

	List<StatsOrderInfo> selectStatsOrderInfo(Integer storeId, String yearMonth);




	List<StoreReviewResponse> selectStoreReviews(int storeId);

	int insertReviewComment(ReviewComment comment);

	List<OrderResponse> getOrdersByStoreId(int storeId);

	int changeOrderStatus(Map<String, Object> params);

	List<SaleMonth> selectMonthlySalesByStoreId(Integer storeId);


	
}

