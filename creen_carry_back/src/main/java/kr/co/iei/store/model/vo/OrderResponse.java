package kr.co.iei.store.model.vo;

import java.sql.Date;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class OrderResponse {
	private String storeName;
	private Integer orderId;
	private Integer totalPrice;
	private Integer usedPoint;
	private Integer getPoint;
	private Integer deliveryPrice;
	private Integer deliveryType;
	private List<OrderItem> items;
	private Integer orderStatus;
	private String orderDate;
	private Double totalReduceCarbon;

}
