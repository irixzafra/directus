#!/bin/bash
curl -s -X POST http://localhost:8055/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"irixzafra@gmail.com","password":"BusinessOS2024!"}'
