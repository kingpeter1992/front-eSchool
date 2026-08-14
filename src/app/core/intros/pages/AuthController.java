package com.king.eschool.Core.Auth;


import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.king.eschool.Core.dtoRequest.LoginRequest;
import com.king.eschool.Core.dtoResponse.AuthResponse;
import com.king.eschool.Core.dtoResponse.UserResponse;
import com.king.eschool.Modules.Utilisateurs.Dto.request.CreateUserDto;
import com.king.eschool.Modules.Utilisateurs.Models.User;
import com.king.eschool.Modules.Utilisateurs.ServiceImplement.UserServiceImpl;
import jakarta.validation.Valid;





@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

private final UserServiceImpl authService;

  
    @PostMapping("/register")
    @PreAuthorize("hasAuthority('user:create')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserDto dto) {
        User createdUser = authService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.fromEntity(createdUser));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

}
