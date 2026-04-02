package kr.co.iei.store.model.dao;

import kr.co.iei.store.model.vo.Menu;
import kr.co.iei.store.model.vo.MenuOption;
import kr.co.iei.store.model.vo.Order;
import kr.co.iei.store.model.vo.OrderItem;
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

	int insertOrderDetail(
		    @Param("orderItem") OrderItem orderItem,
		    @Param("orderId") int orderId
		);


}
