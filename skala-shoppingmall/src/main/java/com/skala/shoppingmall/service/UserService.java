package com.skala.shoppingmall.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.skala.shoppingmall.dto.UserDto;
import com.skala.shoppingmall.repository.OrderItemRepository;
import com.skala.shoppingmall.repository.ProductRepository;
import com.skala.shoppingmall.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final SessionHandler sessionHandler;

    public UserService(
            UserRepository userRepository,
            ProductRepository productRepository,
            OrderItemRepository orderItemRepository,
            SessionHandler sessionHandler, UserRepository userRepository_1) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.sessionHandler = sessionHandler;
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertoDto)
                .collect(Collectors.toList());
    }

    // 몰겟...
    @Transactional(readOnly = true)
    public UserDto getUserById(Long id){
        if (!userRepository.existsById(id)){
            throw new ResponseStatusException(DATA_NOT_FOUND);
        }
        return OrderI
        
    }

    public UserDto createUser(User user){
        if()
    }
}
