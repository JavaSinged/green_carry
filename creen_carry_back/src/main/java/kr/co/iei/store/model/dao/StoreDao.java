package kr.co.iei.store.model.dao;

import kr.co.iei.store.model.vo.Menu;
import kr.co.iei.store.model.vo.MenuOption;
import kr.co.iei.store.model.vo.Store;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface StoreDao {
    List<Store> selectAllStore();

    List<Menu> selectAllMenu(Long storeId);

    List<MenuOption> getMenuOptions(Long menuId);
}
