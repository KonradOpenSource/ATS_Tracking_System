import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { AuthService } from "../../app/services/auth.service";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from "../../app/models/auth.model";

describe("AuthService", () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let localStorageMock: jasmine.SpyObj<Storage>;

  const mockUser: User = {
    id: 1,
    username: "test@example.com",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    role: "RECRUITER",
  };

  const mockAuthResponse: AuthResponse = {
    accessToken: "mock-jwt-token",
    tokenType: "Bearer",
    expiresIn: 3600,
  };

  beforeEach(() => {
    localStorageMock = jasmine.createSpyObj("Storage", [
      "getItem",
      "setItem",
      "removeItem",
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Storage, useValue: localStorageMock },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage mock
    localStorageMock.getItem.calls.reset();
    localStorageMock.setItem.calls.reset();
    localStorageMock.removeItem.calls.reset();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should initialize with no auth data when localStorage is empty", () => {
    localStorageMock.getItem.and.returnValue(null);

    service = TestBed.inject(AuthService);

    expect(service.getCurrentUser()).toBeNull();
    expect(service.getToken()).toBeNull();
  });

  it("should initialize with auth data when localStorage has data", () => {
    localStorageMock.getItem.and.callFake((key: string) => {
      if (key === "ats_token") return "mock-token";
      if (key === "ats_user") return JSON.stringify(mockUser);
      return null;
    });

    service = TestBed.inject(AuthService);

    expect(service.getCurrentUser()).toEqual(mockUser);
    expect(service.getToken()).toBe("mock-token");
  });

  it("should login successfully", () => {
    const loginRequest: LoginRequest = {
      username: "test@example.com",
      password: "password123",
    };

    // Store temp user data first
    service.storeTempUserData(mockUser);

    service.login(loginRequest).subscribe((response: AuthResponse) => {
      expect(response).toEqual(mockAuthResponse);
    });

    const req = httpMock.expectOne("http://localhost:8082/api/auth/login");
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(loginRequest);
    req.flush(mockAuthResponse);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "ats_token",
      "mock-jwt-token",
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "ats_user",
      JSON.stringify(mockUser),
    );
    expect(service.getCurrentUser()).toEqual(mockUser);
    expect(service.getToken()).toBe("mock-jwt-token");
  });

  it("should register successfully", () => {
    const registerRequest: RegisterRequest = {
      username: "newuser@example.com",
      email: "newuser@example.com",
      password: "password123",
      firstName: "New",
      lastName: "User",
      role: "RECRUITER",
    };

    // Store temp user data first
    service.storeTempUserData(mockUser);

    service.register(registerRequest).subscribe((response: AuthResponse) => {
      expect(response).toEqual(mockAuthResponse);
    });

    const req = httpMock.expectOne("http://localhost:8082/api/auth/register");
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(registerRequest);
    req.flush(mockAuthResponse);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "ats_token",
      "mock-jwt-token",
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "ats_user",
      JSON.stringify(mockUser),
    );
  });

  it("should logout successfully", () => {
    // Set up initial state
    localStorageMock.getItem.and.callFake((key: string) => {
      if (key === "ats_token") return "mock-token";
      if (key === "ats_user") return JSON.stringify(mockUser);
      return null;
    });

    service = TestBed.inject(AuthService);
    expect(service.getCurrentUser()).toEqual(mockUser);

    service.logout();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith("ats_token");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("ats_user");
    expect(service.getCurrentUser()).toBeNull();
    expect(service.getToken()).toBeNull();
  });

  it("should store and retrieve temp user data", () => {
    const userData = {
      username: "test@example.com",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      role: "RECRUITER",
    };

    service.storeTempUserData(userData);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "temp_user_data",
      JSON.stringify(userData),
    );
  });

  it("should update user data", () => {
    // Set up initial user
    localStorageMock.getItem.and.callFake((key: string) => {
      if (key === "ats_token") return "mock-token";
      if (key === "ats_user") return JSON.stringify(mockUser);
      return null;
    });

    service = TestBed.inject(AuthService);

    const updatedData = {
      firstName: "Updated",
      lastName: "Name",
    };

    service.updateUser(updatedData);

    const expectedUser = { ...mockUser, ...updatedData };
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "ats_user",
      JSON.stringify(expectedUser),
    );
    expect(service.getCurrentUser()).toEqual(expectedUser);
  });

  it("should update settings on backend", () => {
    const settings = {
      theme: "dark",
      notifications: true,
    };

    service.updateSettings(settings).subscribe((response: any) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne("http://localhost:8082/api/auth/settings");
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual(settings);
    req.flush({ success: true });
  });

  it("should handle JWT decoding correctly", () => {
    const tokenWithPayload =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInN1YiI6InRlc3RAZXhhbXBsZS5jb20iLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJmaXJzdE5hbWUiOiJUZXN0IiwibGFzdE5hbWUiOiJVc2VyIiwicm9sZSI6IlJFQ1JVSVRFUiJ9.signature";

    localStorageMock.getItem.and.returnValue(null);
    service = TestBed.inject(AuthService);

    const loginRequest: LoginRequest = {
      username: "test@example.com",
      password: "password123",
    };

    service.login(loginRequest).subscribe();

    const req = httpMock.expectOne("http://localhost:8082/api/auth/login");
    req.flush({ ...mockAuthResponse, accessToken: tokenWithPayload });

    expect(service.getCurrentUser()).toEqual({
      id: 1,
      username: "test@example.com",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      role: "RECRUITER",
    });
  });

  it("should handle JWT decoding errors gracefully", () => {
    const invalidToken = "invalid.token.here";

    localStorageMock.getItem.and.returnValue(null);
    service = TestBed.inject(AuthService);

    const loginRequest: LoginRequest = {
      username: "test@example.com",
      password: "password123",
    };

    service.login(loginRequest).subscribe();

    const req = httpMock.expectOne("http://localhost:8082/api/auth/login");
    req.flush({ ...mockAuthResponse, accessToken: invalidToken });

    // Should fallback to default user
    expect(service.getCurrentUser()).toEqual({
      id: 1,
      username: "user",
      email: "user@example.com",
      firstName: "User",
      lastName: "Name",
      role: "RECRUITER",
    });
  });

  it("should provide observable current user", () => {
    service.currentUser$.subscribe((user: User | null) => {
      expect(user).toBeNull(); // Initially null
    });

    service.storeTempUserData(mockUser);
    const loginRequest: LoginRequest = {
      username: "test@example.com",
      password: "password123",
    };

    service.login(loginRequest).subscribe();

    const req = httpMock.expectOne("http://localhost:8082/api/auth/login");
    req.flush(mockAuthResponse);

    service.currentUser$.subscribe((user: User | null) => {
      expect(user).toEqual(mockUser);
    });
  });

  it("should provide observable authentication status", () => {
    service.isAuthenticated$.subscribe((isAuth: boolean) => {
      expect(isAuth).toBeFalse(); // Initially false
    });

    service.storeTempUserData(mockUser);
    const loginRequest: LoginRequest = {
      username: "test@example.com",
      password: "password123",
    };

    service.login(loginRequest).subscribe();

    const req = httpMock.expectOne("http://localhost:8082/api/auth/login");
    req.flush(mockAuthResponse);

    service.isAuthenticated$.subscribe((isAuth: boolean) => {
      expect(isAuth).toBeTrue();
    });
  });
});
