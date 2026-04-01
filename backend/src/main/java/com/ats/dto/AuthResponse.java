package com.ats.dto;

public class AuthResponse {

    private String token;
    private String refreshToken;
    private UserDto user;

    public AuthResponse() {}

    public AuthResponse(String token, String refreshToken, UserDto user) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.user = user;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }

    // -----------------------------------------------------------------
    // Nested UserDto — represents the user info embedded in the response
    // -----------------------------------------------------------------
    public static class UserDto {
        private Long id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String role;

        public UserDto() {}

        public UserDto(Long id, String username, String email,
                       String firstName, String lastName, String role) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.role = role;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}
