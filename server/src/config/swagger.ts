import { Express } from "express";
import swaggerUi from "swagger-ui-express";

export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "CampusIQ API Documentation",
    version: "1.0.0",
    description:
      'CampusIQ: "One AI Platform for Everything on Campus." Complete REST API specification for smart campus operating system, RBAC, academic management, RAG knowledge base, and AI chat assistant.',
    contact: {
      name: "CampusIQ Engineering Team",
    },
  },
  servers: [
    {
      url: "/api/v1",
      description: "Primary API V1 Server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT access token.",
      },
    },
    schemas: {
      StandardResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation successful" },
          data: { type: "object" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Validation failed" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
      SignupRequest: {
        type: "object",
        required: ["fullName", "email", "password"],
        properties: {
          fullName: { type: "string", example: "Alex Mercer" },
          email: {
            type: "string",
            format: "email",
            example: "alex.student@campus.edu",
          },
          password: {
            type: "string",
            format: "password",
            example: "Student@123",
          },
          phone: { type: "string", example: "+1-555-0199" },
          gender: { type: "string", example: "Male" },
          rollNumber: { type: "string", example: "CS2026-042" },
          admissionYear: { type: "integer", example: 2024 },
          departmentId: { type: "string", format: "uuid" },
          semesterId: { type: "string", format: "uuid" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "alex.student@campus.edu",
          },
          password: {
            type: "string",
            format: "password",
            example: "Student@123",
          },
        },
      },
      AIChatRequest: {
        type: "object",
        required: ["message"],
        properties: {
          message: {
            type: "string",
            example:
              "My DBMS attendance is 68%. How many classes do I need to attend to reach 75%?",
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "API Health Check",
        tags: ["System"],
        responses: {
          200: { description: "API is healthy" },
        },
      },
    },
    "/auth/signup": {
      post: {
        summary: "Public Student Registration (Always forces STUDENT role)",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignupRequest" },
            },
          },
        },
        responses: {
          201: {
            description:
              "Student registered successfully with access token and secure cookie",
          },
          400: { description: "Validation error" },
          409: { description: "Email already exists" },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "User Login (Student, Faculty, Admin)",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: { description: "Login successful with JWT access token" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/auth/refresh": {
      post: {
        summary: "Rotate and Refresh Access Token via HTTP-only cookie",
        tags: ["Authentication"],
        responses: {
          200: { description: "Token refreshed" },
          401: { description: "Token expired or invalid" },
        },
      },
    },
    "/auth/logout": {
      post: {
        summary: "Logout user and revoke refresh token",
        tags: ["Authentication"],
        responses: {
          200: { description: "Logged out successfully" },
        },
      },
    },
    "/auth/me": {
      get: {
        summary: "Get current user profile and academic context",
        tags: ["Authentication"],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Profile details" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/students/me/dashboard": {
      get: {
        summary:
          "Comprehensive Student Dashboard (Attendance, Timetable, CGPA, Notices)",
        tags: ["Student"],
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Student dashboard payload aggregated in single query",
          },
        },
      },
    },
    "/faculty/me/dashboard": {
      get: {
        summary: "Faculty Dashboard (Teaching Assignments, Schedule, Sessions)",
        tags: ["Faculty"],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Faculty dashboard payload" },
        },
      },
    },
    "/attendance/me": {
      get: {
        summary:
          "Get dynamic attendance summary, shortage status, and 75% target calculator",
        tags: ["Attendance"],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Attendance metrics" },
        },
      },
    },
    "/ai/chat": {
      post: {
        summary: "Context-Aware AI Chat & RAG Document Retrieval",
        tags: ["AI Assistant"],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AIChatRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Context-grounded AI answer with source citations",
          },
          401: { description: "Unauthorized" },
          429: { description: "Rate limit exceeded" },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express) => {
  app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
