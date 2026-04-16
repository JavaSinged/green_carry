package kr.co.iei.store.model.vo;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias("orderItem")
public class OrderItem {
	private String menuName;
	private Integer menuId;
	private Integer quantity;
	private Integer price;
	private String optionString;
	private Double totalcarbon;
	private String menuImage;
}
