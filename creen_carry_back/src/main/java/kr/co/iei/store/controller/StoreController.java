package kr.co.iei.store.controller;

import kr.co.iei.store.model.service.StoreService;
import kr.co.iei.store.model.vo.Store;
import org.apache.ibatis.type.Alias;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/stores")
@CrossOrigin("*")
public class StoreController {
    @Autowired
    private StoreService storeService;

    @GetMapping
    public ResponseEntity<?> getStores() {
        List<Store> list = storeService.selectAllStore();
        return ResponseEntity.ok(list);
    }
}
