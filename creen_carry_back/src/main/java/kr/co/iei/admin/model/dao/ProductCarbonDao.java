package kr.co.iei.admin.model.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.web.multipart.MultipartFile;

import kr.co.iei.admin.model.vo.ProductCarbon;

@Mapper
public interface ProductCarbonDao {

	List<ProductCarbon> selectAllCarbon();

	Integer updateCarbonProduct(ProductCarbon product, MultipartFile uploadFile);

	Integer insertCarbonProduct(ProductCarbon product, MultipartFile uploadFile);

	Integer deleteCarbon(Integer productId);


}
