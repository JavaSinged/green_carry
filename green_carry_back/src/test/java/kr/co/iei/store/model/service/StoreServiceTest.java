package kr.co.iei.store.model.service;

import kr.co.iei.store.model.dao.StoreDao;
import kr.co.iei.store.model.vo.Order;
import kr.co.iei.store.model.vo.OrderItem;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StoreServiceTest {

	@Mock
	private StoreDao storeDao;

	@InjectMocks
	private StoreService storeService;

	@Test
	void insertOrderThrowsWhenOrderInsertFails() {
		Order order = createOrder();
		when(storeDao.insertOrder(order)).thenReturn(0);

		RuntimeException exception = assertThrows(RuntimeException.class, () -> storeService.insertOrder(order));

		assertEquals("주문 기본 정보 저장 실패", exception.getMessage());
		verify(storeDao, never()).insertOrderHistory(any(Integer.class), any(String.class));
	}

	@Test
	void insertOrderThrowsWhenOrderDetailInsertFails() {
		Order order = createOrder();
		when(storeDao.insertOrder(order)).thenReturn(1);
		when(storeDao.insertOrderDetail(any(OrderItem.class), eq(101))).thenReturn(0);

		RuntimeException exception = assertThrows(RuntimeException.class, () -> storeService.insertOrder(order));

		assertEquals("주문 상세 저장 중 오류 발생", exception.getMessage());
		verify(storeDao, never()).insertOrderHistory(any(Integer.class), any(String.class));
	}

	@Test
	void insertOrderThrowsWhenOrderHistoryInsertFails() {
		Order order = createOrder();
		when(storeDao.insertOrder(order)).thenReturn(1);
		when(storeDao.insertOrderDetail(any(OrderItem.class), eq(101))).thenReturn(1);
		when(storeDao.insertOrderHistory(101, "member01")).thenReturn(0);

		RuntimeException exception = assertThrows(RuntimeException.class, () -> storeService.insertOrder(order));

		assertEquals("주문 이력 저장 실패", exception.getMessage());
	}

	@Test
	void changeOrderStatusReturnsSuccessWhenStatusFiveAndPointUpdateSucceeds() {
		when(storeDao.changeOrderStatus(20, 5, null)).thenReturn(1);
		when(storeDao.updatePoint(20)).thenReturn(1);
		doNothing().when(storeDao).pointReward(20);
		when(storeDao.addReduceCarbon(20)).thenReturn(1);

		int result = storeService.changeOrderStatus(20, 5, null);

		assertEquals(1, result);
		verify(storeDao).changeOrderStatus(20, 5, null);
		verify(storeDao).updatePoint(20);
		verify(storeDao).pointReward(20);
		verify(storeDao).addReduceCarbon(20);
	}

	@Test
	void changeOrderStatusThrowsWhenStatusFivePointUpdateFails() {
		when(storeDao.changeOrderStatus(21, 5, null)).thenReturn(1);
		when(storeDao.updatePoint(21)).thenReturn(0);

		RuntimeException exception = assertThrows(RuntimeException.class,
				() -> storeService.changeOrderStatus(21, 5, null));

		assertEquals("주문 완료 포인트 반영 실패", exception.getMessage());
		verify(storeDao, never()).pointReward(21);
		verify(storeDao, never()).addReduceCarbon(21);
	}

	@Test
	void changeOrderStatusThrowsWhenCancelRollbackFails() {
		when(storeDao.rollbackPoint(30)).thenReturn(0);

		RuntimeException exception = assertThrows(RuntimeException.class,
				() -> storeService.changeOrderStatus(30, 9, null));

		assertEquals("주문 취소 포인트 롤백 실패", exception.getMessage());
		verify(storeDao, never()).cancelOrder(30);
	}

	@Test
	void changeOrderStatusThrowsWhenCancelFails() {
		when(storeDao.rollbackPoint(31)).thenReturn(1);
		when(storeDao.cancelOrder(31)).thenReturn(0);

		RuntimeException exception = assertThrows(RuntimeException.class,
				() -> storeService.changeOrderStatus(31, 9, null));

		assertEquals("주문 취소 상태 변경 실패", exception.getMessage());
	}

	@Test
	void updatePointPropagatesRewardStepFailure() {
		when(storeDao.updatePoint(40)).thenReturn(1);
		doThrow(new RuntimeException("reward failed")).when(storeDao).pointReward(40);

		RuntimeException exception = assertThrows(RuntimeException.class, () -> storeService.updatePoint(40));

		assertEquals("reward failed", exception.getMessage());
		verify(storeDao, never()).addReduceCarbon(40);
	}

	private Order createOrder() {
		Order order = new Order();
		order.setOrderId(101);
		order.setMemberId("member01");
		order.setUsedPoint(0);

		OrderItem item = new OrderItem();
		item.setMenuId(1);
		item.setQuantity(2);
		item.setPrice(12000);

		order.setItems(List.of(item));
		return order;
	}
}
