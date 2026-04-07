package kr.co.iei.store.controller;

import kr.co.iei.store.model.service.ManagerService;
import kr.co.iei.store.model.vo.Container;
import kr.co.iei.store.model.vo.MenuSaveRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/menus")
public class ManagerController {
    @Autowired
    private ManagerService managerService;

    @GetMapping("/containers")
    public ResponseEntity<?> getContainers() {
        List<Container> list = managerService.getContainers();

        return ResponseEntity.ok(list);
    }

    // 1. 새 메뉴 등록 (POST)
    @PostMapping("/{storeId}")
    public ResponseEntity<?> insertMenu(@PathVariable Long storeId, @RequestBody MenuSaveRequest request) {
        request.setStoreId(storeId);
        int result = managerService.insertMenuAll(request);
        return result > 0 ? ResponseEntity.ok().build() : ResponseEntity.internalServerError().build();
    }

    // 2. 기존 메뉴 수정 (PUT)
    @PutMapping("/{storeId}/{menuId}")
    public ResponseEntity<?> updateMenu(
            @PathVariable Long storeId,
            @PathVariable Long menuId,
            @RequestBody MenuSaveRequest request) {

        request.setStoreId(storeId);
        request.setMenuId(menuId);
        int result = managerService.updateMenuAll(request);
        return result > 0 ? ResponseEntity.ok().build() : ResponseEntity.internalServerError().build();
    }

}
