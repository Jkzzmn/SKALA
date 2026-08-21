package com.skala.shoppingmall.repository;

import org.springframework.stereotype.Repository;
import com.skala.shoppingmall.entity.User;
import java.util.List;

@Repository
public class UserProductRepository {
    List<User> findByUser_UserId(Long id);

    List<User> findByConsumerAndProduct(Long user_id, Long product_id);
}
