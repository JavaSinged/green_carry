package kr.co.iei.admin.model.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import kr.co.iei.admin.model.dao.ProductCarbonDao;
import kr.co.iei.admin.model.vo.ProductCarbon;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductCarbonService {

	private static final String CONTAINER_IMAGE_FOLDER = "projet/upload/web/container";

	private final ProductCarbonDao productCarbonDao;

	@Autowired
	private Cloudinary cloudinary;

	public List<ProductCarbon> getCarbonList() {
		return productCarbonDao.selectAllCarbon();
	}

	// 코덱스가 수정함: 용기 이미지를 Cloudinary에 업로드하고 secure_url을 저장
	@Transactional
	public Integer updateProduct(ProductCarbon product, MultipartFile uploadFile) {
		if (uploadFile != null && !uploadFile.isEmpty()) {
			product.setProductImg(uploadToCloudinary(uploadFile));
		}

		if (product.getProductId() != null) {
			return productCarbonDao.updateCarbonProduct(product, uploadFile);
		}
		return productCarbonDao.insertCarbonProduct(product, uploadFile);
	}

	private String uploadToCloudinary(MultipartFile uploadFile) {
		try {
			Map<?, ?> uploadResult = cloudinary.uploader().upload(uploadFile.getBytes(),
					ObjectUtils.asMap("folder", CONTAINER_IMAGE_FOLDER, "use_filename", true, "unique_filename", true));
			return (String) uploadResult.get("secure_url");
		} catch (IOException e) {
			throw new RuntimeException("Cloudinary 용기 이미지 업로드 중 오류가 발생했습니다.", e);
		}
	}

	public Integer deleteCarbon(Integer productId) {
		return productCarbonDao.deleteCarbon(productId);
	}
}
