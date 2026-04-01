package com.ats.controller;

import com.ats.dto.AuthResponse;
import com.ats.dto.AuthResponse.UserDto;
import com.ats.model.User;
import com.ats.repository.UserRepository;
import com.ats.security.JwtService;
import com.ats.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "API for user authentication and registration")
public class AuthController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserService userService;
    
    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, UserService userService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userService = userService;
    }
    
    @PostMapping("/register")
    @Operation(
        summary = "Register a new user",
        description = "Creates a new user account with ADMIN or RECRUITER role"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "User registered successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.ats.dto.AuthResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input data",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Username or email already exists",
            content = @Content
        )
    })
    public ResponseEntity<com.ats.dto.AuthResponse> register(
            @Parameter(description = "User registration data", required = true)
            @Valid @RequestBody RegisterRequest request) {
        
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new com.ats.dto.AuthResponse("Username already exists", null, null));
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new com.ats.dto.AuthResponse("Email already exists", null, null));
        }
        
        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(com.ats.model.Role.valueOf(request.getRole()));
        
        // Save user
        User savedUser = userRepository.save(user);
        
        // Generate JWT token
        String token = jwtService.generateToken(savedUser);
        String refreshToken = jwtService.generateToken(savedUser); // For simplicity, same token
        
        // Create user DTO
        UserDto userDto = new UserDto(
            savedUser.getId(),
            savedUser.getUsername(),
            savedUser.getEmail(),
            savedUser.getFirstName(),
            savedUser.getLastName(),
            savedUser.getRole().toString()
        );
        
        return ResponseEntity.ok(new com.ats.dto.AuthResponse(token, refreshToken, userDto));
    }
    
    @PostMapping("/login")
    @Operation(
        summary = "Authenticate user",
        description = "Authenticates user credentials and returns JWT token"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Authentication successful",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.ats.dto.AuthResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Invalid credentials",
            content = @Content
        )
    })
    public ResponseEntity<com.ats.dto.AuthResponse> login(
            @Parameter(description = "User login credentials", required = true)
            @Valid @RequestBody LoginRequest request) {
        
        // Find user by username
        User user = userRepository.findByUsername(request.getUsername())
                .orElse(null);
        
        // Check if user exists and password matches
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new com.ats.dto.AuthResponse("Invalid username or password", null, null));
        }
        
        // Generate JWT token
        String token = jwtService.generateToken(user);
        String refreshToken = jwtService.generateToken(user); // For simplicity, same token
        
        // Create user DTO
        UserDto userDto = new UserDto(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole().toString()
        );
        
        return ResponseEntity.ok(new com.ats.dto.AuthResponse(token, refreshToken, userDto));
    }
    
    @PostMapping("/logout")
    @Operation(
        summary = "Logout user",
        description = "Logs out the current user by invalidating the token"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Logout successful",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized",
            content = @Content
        )
    })
    public ResponseEntity<Void> logout(
            @Parameter(description = "Authorization header with Bearer token")
            @RequestHeader("Authorization") String authorization) {
        
        // In a real implementation, you would add the token to a blacklist
        // For now, we just return success since JWT tokens are stateless
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/refresh")
    @Operation(
        summary = "Refresh JWT token",
        description = "Generates a new access token using the refresh token"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Token refreshed successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = com.ats.dto.AuthResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Invalid refresh token",
            content = @Content
        )
    })
    public ResponseEntity<com.ats.dto.AuthResponse> refresh(
            @Parameter(description = "Authorization header with Bearer refresh token")
            @RequestHeader("Authorization") String authorization) {
        
        // Extract token from "Bearer <token>"
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new com.ats.dto.AuthResponse("Invalid token format", null, null));
        }
        
        String refreshToken = authorization.substring(7);
        
        try {
            // Validate refresh token and extract user info
            String username = jwtService.extractUsername(refreshToken);
            User user = userRepository.findByUsername(username)
                    .orElse(null);
            
            if (user == null || !jwtService.isTokenValid(refreshToken, user)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new com.ats.dto.AuthResponse("Invalid refresh token", null, null));
            }
            
            // Generate new access token
            String newToken = jwtService.generateToken(user);
            String newRefreshToken = jwtService.generateToken(user); // For simplicity, same token
            
            // Create user DTO
            UserDto userDto = new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().toString()
            );
            
            return ResponseEntity.ok(new com.ats.dto.AuthResponse(newToken, newRefreshToken, userDto));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new com.ats.dto.AuthResponse("Invalid refresh token", null, null));
        }
    }
    
    @PutMapping("/settings")
    @Operation(
        summary = "Update user settings",
        description = "Updates user profile information and preferences"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Settings updated successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = User.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input data",
            content = @Content
        ),
        @ApiResponse(
            responseCode = "404",
            description = "User not found",
            content = @Content
        )
    })
    public ResponseEntity<User> updateSettings(
            @Parameter(description = "User settings data", required = true)
            @Valid @RequestBody SettingsRequest request,
            @AuthenticationPrincipal UserDetails currentUser) {
        
        // Find the current user
        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if new username is already taken by another user
        if (!user.getUsername().equals(request.getUsername()) && 
            userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(null); // Username already exists
        }
        
        // Check if new email is already taken by another user
        if (!user.getEmail().equals(request.getEmail()) && 
            userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(null); // Email already exists
        }
        
        // Update user information
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        
        // Save updated user
        User updatedUser = userRepository.save(user);
        
        return ResponseEntity.ok(updatedUser);
    }
    
    // DTO classes for documentation
    @Schema(description = "User registration request")
    public static class RegisterRequest {
        @Schema(description = "Username", example = "john.doe", required = true)
        private String username;
        
        @Schema(description = "Email address", example = "john@example.com", required = true)
        private String email;
        
        @Schema(description = "Password", example = "password123", required = true)
        private String password;
        
        @Schema(description = "First name", example = "John", required = true)
        private String firstName;
        
        @Schema(description = "Last name", example = "Doe", required = true)
        private String lastName;
        
        @Schema(description = "User role", example = "RECRUITER", required = true)
        private String role;
        
        // Getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
    
    @Schema(description = "User login request")
    public static class LoginRequest {
        @Schema(description = "Username", example = "john.doe", required = true)
        private String username;
        
        @Schema(description = "Password", example = "password123", required = true)
        private String password;
        
        // Getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    @Schema(description = "User settings update request")
    public static class SettingsRequest {
        @Schema(description = "Username", example = "john.doe", required = true)
        private String username;
        
        @Schema(description = "Email address", example = "john@example.com", required = true)
        private String email;
        
        @Schema(description = "First name", example = "John", required = true)
        private String firstName;
        
        @Schema(description = "Last name", example = "Doe", required = true)
        private String lastName;
        
        @Schema(description = "Notification email", example = "notifications@example.com")
        private String notificationEmail;
        
        @Schema(description = "Theme preference", example = "light")
        private String theme;
        
        // Getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getNotificationEmail() { return notificationEmail; }
        public void setNotificationEmail(String notificationEmail) { this.notificationEmail = notificationEmail; }
        public String getTheme() { return theme; }
        public void setTheme(String theme) { this.theme = theme; }
    }
    
    @Schema(description = "Authentication response")
    public static class AuthResponse {
        @Schema(description = "JWT access token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        private String accessToken;
        
        @Schema(description = "Token type", example = "Bearer")
        private String tokenType;
        
        @Schema(description = "Token expiration time in seconds", example = "3600")
        private Long expiresIn;
        
        public AuthResponse(String accessToken, String tokenType, Long expiresIn) {
            this.accessToken = accessToken;
            this.tokenType = tokenType;
            this.expiresIn = expiresIn;
        }
        
        public String getAccessToken() { return accessToken; }
        public String getTokenType() { return tokenType; }
        public Long getExpiresIn() { return expiresIn; }
    }
}
