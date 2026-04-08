package kr.co.iei.admin.model.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.iei.admin.model.dao.AdminDao;
import kr.co.iei.admin.model.vo.OrderListByStoreId;
import kr.co.iei.store.model.vo.Menu;
import kr.co.iei.store.model.vo.OrderResponse;


@Service
public class AdminService {
	
	@Autowired
    private AdminDao adminDao;

	public List<Map<String, Object>> selectMonthlySales() {
		List<Map<String, Object>> list = adminDao.selectMonthlySales();
		return list;
	}

	public List<OrderListByStoreId> selectOrdersByStoreId(int storeId) {
		List<OrderListByStoreId> list = adminDao.selectOrdersByStoreId(storeId);

		for (OrderListByStoreId o : list) {
		    List<Menu> menuList = adminDao.selectMenuListByOrderId(o.getOrderId());
		    o.setMenuList(menuList);
		}
		return list;
	}

}
