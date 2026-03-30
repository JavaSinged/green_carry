package kr.co.iei.store.model.service;

import kr.co.iei.store.model.dao.StoreDao;
import kr.co.iei.store.model.vo.Store;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StoreService {
    @Autowired
    private StoreDao storeDao;

    public List<Store> selectAllStore() {
        return storeDao.selectAllStore();
    }
}
