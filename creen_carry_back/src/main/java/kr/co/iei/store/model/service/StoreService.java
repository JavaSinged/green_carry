package kr.co.iei.store.model.service;

import kr.co.iei.store.model.dao.StoreDao;
import kr.co.iei.store.model.vo.Menu;
import kr.co.iei.store.model.vo.MenuOption;
import kr.co.iei.store.model.vo.Order;
import kr.co.iei.store.model.vo.OrderItem;
import kr.co.iei.store.model.vo.Store;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    	int orderId = 0;
		int result = storeDao.insertOrder(order);
		if(result == 1) {
			orderId = order.getOrderId();
			System.out.println(orderId);
			List<OrderItem> list = order.getItems();
			System.out.println(list);
			for (OrderItem orderItem : list) {
				int menuResult = storeDao.insertOrderDetail(orderItem, orderId);
				System.out.println(menuResult);
			}
			
		}
		return orderId;
	}

}
