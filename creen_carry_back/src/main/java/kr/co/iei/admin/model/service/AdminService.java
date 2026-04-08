package kr.co.iei.admin.model.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.iei.admin.model.dao.AdminDao;


@Service
public class AdminService {
	
	@Autowired
    private AdminDao adminDao;

	public List<Map<String, Object>> selectMonthlySales() {
		List<Map<String, Object>> list = adminDao.selectMonthlySales();
		return list;
	}

}
