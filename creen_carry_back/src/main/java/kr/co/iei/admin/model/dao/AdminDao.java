package kr.co.iei.admin.model.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AdminDao {

	List<Map<String, Object>> selectMonthlySales();
}
