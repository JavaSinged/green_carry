package kr.co.iei.store.model.service;

import kr.co.iei.store.model.dao.ManagerDao;
import kr.co.iei.store.model.vo.Container;
import kr.co.iei.store.model.vo.MenuOption;
import kr.co.iei.store.model.vo.MenuSaveRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ManagerService {

    @Autowired
    private ManagerDao managerDao;

    public List<Container> getContainers() {
        return managerDao.selectAllContainers();
    }

    // --- [1. 메뉴 등록 로직] ---
    @Transactional
    public int insertMenuAll(MenuSaveRequest request) {
        // 1. 메뉴 기본 정보 삽입 (이후 request 객체에 menuId가 세팅됨)
        int result = managerDao.insertMenu(request);

        // 2. 연관 데이터 저장 (공통 메서드 호출)
        saveMenuRelations(request, request.getMenuId());

        return result;
    }

    // --- [2. 메뉴 수정 로직] ---
    @Transactional
    public int updateMenuAll(MenuSaveRequest request) {
        // 1. 메뉴 기본 정보 업데이트
        int result = managerDao.updateMenu(request);

        // 2. 기존 연결(매핑) 데이터 일괄 삭제 (초기화)
        managerDao.deleteMenuOptionMap(request.getMenuId());
        managerDao.deleteContainerMap(request.getMenuId());

        // 3. 연관 데이터 다시 저장
        saveMenuRelations(request, request.getMenuId());

        return result;
    }

    // --- [공통] 옵션 및 용기 매핑 로직 ---
    private void saveMenuRelations(MenuSaveRequest request, Long menuId) {
        // A. 기존 옵션 연결
        if (request.getOptionIds() != null) {
            for (Long optionNo : request.getOptionIds()) {
                Map<String, Object> map = new HashMap<>();
                map.put("menuId", menuId);
                map.put("optionNo", optionNo);
                managerDao.insertMenuOptionMap(map);
            }
        }

        // B. 신규 생성 옵션 추가 및 연결
        if (request.getNewOptions() != null) {
            for (MenuOption opt : request.getNewOptions()) {
                managerDao.insertNewOption(opt); // 옵션 마스터 테이블 등록 (optionNo 생성됨)

                Map<String, Object> map = new HashMap<>();
                map.put("menuId", menuId);
                map.put("optionNo", opt.getOptionNo());
                managerDao.insertMenuOptionMap(map); // 매핑 테이블 연결
            }
        }

        // C. 용기 매핑
        if (request.getContainerMap() != null) {
            for (MenuSaveRequest.ContainerItem item : request.getContainerMap()) {
                Map<String, Object> map = new HashMap<>();
                map.put("menuId", menuId);
                map.put("productId", item.getProductId());
                map.put("count", item.getCount());
                managerDao.insertContainerMap(map);
            }
        }
    }

    }
