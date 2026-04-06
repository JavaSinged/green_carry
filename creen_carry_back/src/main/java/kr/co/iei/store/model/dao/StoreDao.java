package kr.co.iei.store.model.dao;

import kr.co.iei.store.model.vo.Menu;
import kr.co.iei.store.model.vo.MenuOption;
import kr.co.iei.store.model.vo.MenuSaveRequestDto;
import kr.co.iei.store.model.vo.Order;
import kr.co.iei.store.model.vo.OrderItem;
import kr.co.iei.store.model.vo.OrderListObject;
import kr.co.iei.store.model.vo.OrderListResponse;
import kr.co.iei.store.model.vo.OrderResponse;
import kr.co.iei.store.model.vo.Store;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

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

	Integer getStoreId(String memberId);

	List<MenuOption> getAllMenuOptions();

	int updateMenu(MenuSaveRequestDto dto);

	
	int deleteMenuOptions(@Param("menuId") Long menuId); 

	void insertNewOption(MenuOption newOpt);

	int insertMenuOptions(
		    @Param("menuId") Long menuId, 
		    @Param("optionIds") List<Long> optionIds
		);

	Menu getMenuById(Long menuId);

	int insertMenu(MenuSaveRequestDto dto);
	

	int cancelOrder(Integer orderId);

	OrderListObject selectOrderListObject(String memberId);

	int[] selectOrderList(String memberId);


	int updatePoint(Order order);

	int addReduceCarbon(int orderId);

	int updateOrderStatus(Integer orderId);
}
