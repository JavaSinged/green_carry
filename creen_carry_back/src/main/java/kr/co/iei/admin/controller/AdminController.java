package kr.co.iei.admin.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import kr.co.iei.CreenCarryBackApplication;
import kr.co.iei.admin.model.service.AdminService;
import kr.co.iei.admin.model.vo.OrderListByStoreId;
import kr.co.iei.admin.model.vo.StoreResponse;

@RestController
@RequestMapping("/admin")
@CrossOrigin("*")
public class AdminController {

	private final CreenCarryBackApplication creenCarryBackApplication;
	@Autowired
	private AdminService adminService;

	AdminController(CreenCarryBackApplication creenCarryBackApplication) {
		this.creenCarryBackApplication = creenCarryBackApplication;
	}

	@GetMapping("/api/sales/stats")
	public ResponseEntity<?> getSalesStats() {
		// 1. DB에서 12개의 로우를 가져옴 (전기 6개 + 당기 6개 순서)
		List<Map<String, Object>> list = adminService.selectMonthlySales();

		// 2. 결과 담을 그릇
		List<Long> pastSeries = new ArrayList<>();
		List<Long> currentSeries = new ArrayList<>();
		List<String> categories = new ArrayList<>();

		for (int i = 0; i < list.size(); i++) {
			// total_sales 값 가져오기 (오라클 숫자 타입 대응)
			long sales = Long.parseLong(String.valueOf(list.get(i).get("TOTAL_SALES")));
			String month = String.valueOf(list.get(i).get("MONTHLY")).substring(5) + "월";


			if (i < 6) {
				// 앞의 6개는 전기(작년) 데이터
				pastSeries.add(sales);
			} else {
				// 뒤의 6개는 당기(올해) 데이터
				currentSeries.add(sales);
				categories.add(month); // X축 라벨은 당기 기준으로 생성
			}
		}

		Map<String, Object> response = new HashMap<>();
		response.put("pastSeries", pastSeries);
		response.put("currentSeries", currentSeries);
		response.put("categories", categories);

		return ResponseEntity.ok(response);
	}

	@GetMapping("/api/point/stats")
	public ResponseEntity<?> getPointStats() {
		// 1. DB에서 12개의 로우를 가져옴 (전기 6개 + 당기 6개 순서)
		List<Map<String, Object>> list = adminService.selectMonthlyPoint();

		// 2. 결과 담을 그릇
		List<Integer> pastSeries = new ArrayList<>();
		List<Integer> currentSeries = new ArrayList<>();
		List<String> categories = new ArrayList<>();

		for (int i = 0; i < list.size(); i++) {
			// total_point 값 가져오기 (오라클 숫자 타입 대응)
			int point = Integer.parseInt(String.valueOf(list.get(i).get("TOTAL_POINT")));
			String month = String.valueOf(list.get(i).get("MONTHLY")).substring(5) + "월";

			if (i < 6) {
				// 앞의 6개는 전기(작년) 데이터
				pastSeries.add(point);
			} else {
				// 뒤의 6개는 당기(올해) 데이터
				currentSeries.add(point);
				categories.add(month); // X축 라벨은 당기 기준으로 생성
			}
		}

		Map<String, Object> response = new HashMap<>();
		response.put("pastSeries", pastSeries);
		response.put("currentSeries", currentSeries);
		response.put("categories", categories);

		return ResponseEntity.ok(response);
	}

	@GetMapping("/{storeId}")
	public ResponseEntity<?> selectOrdersByStoreId(@PathVariable int storeId) {
		List<OrderListByStoreId> list = adminService.selectOrdersByStoreId(storeId);
		return ResponseEntity.ok(list);
	}


}
